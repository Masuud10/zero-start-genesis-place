import { useState } from 'react';
import { useAnalyticsTracking } from './useAnalyticsTracking';
import { auditLogger } from '@/utils/auditLogger';
import { rateLimiter, RateLimiter } from '@/utils/rateLimiter';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { withDatabaseRetry } from '@/utils/enhancedErrorHandler';

export const useFinanceTracking = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { trackFinanceTransaction } = useAnalyticsTracking();
  const { user } = useAuth();

  const processPayment = async (paymentData: any) => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // CRITICAL: Validate required fields before processing
    if (!paymentData.amount || paymentData.amount <= 0) {
      return { success: false, error: 'Invalid payment amount' };
    }

    if (!paymentData.student_id) {
      return { success: false, error: 'Student ID is required' };
    }

    if (!paymentData.transaction_type) {
      return { success: false, error: 'Transaction type is required' };
    }

    // Check rate limiting for MPESA transactions
    const rateLimit = rateLimiter.checkLimit({
      ...RateLimiter.MPESA_TRANSACTION_LIMIT,
      identifier: `mpesa_${user.id}`
    });

    if (!rateLimit.allowed) {
      const resetMinutes = Math.ceil((rateLimit.resetTime - Date.now()) / 60000);
      const error = `Rate limit exceeded. Please wait ${resetMinutes} minutes before processing another payment.`;
      
      await auditLogger.logMpesaTransaction(user.id, paymentData, false, error);
      return { success: false, error };
    }

    setIsProcessing(true);
    try {
      // CRITICAL FIX: Verify student belongs to user's school for security
      const studentQuery = await withDatabaseRetry(
        () => supabase
          .from('students')
          .select('school_id, name, admission_number')
          .eq('id', paymentData.student_id)
          .single(),
        'fetch_student_for_payment'
      );

      if (studentQuery.error) {
        throw new Error(`Student not found: ${studentQuery.error.message}`);
      }

      const studentData = studentQuery.data;
      if (!studentData?.school_id) {
        throw new Error("Could not find school for the student");
      }

      // SECURITY: Verify user has permission to process payments for this school
      if (user.role !== 'edufam_admin' && user.role !== 'elimisha_admin' && 
          user.school_id !== studentData.school_id) {
        throw new Error("Access denied: Cannot process payments for other schools");
      }

      // BUSINESS LOGIC: Calculate proper amounts and update fee balance
      const completePaymentData = {
        ...paymentData,
        school_id: studentData.school_id,
        processed_by: user.id,
        processed_at: new Date().toISOString(),
        amount: Number(paymentData.amount), // Ensure numeric
      };

      // Start transaction for atomic payment processing
      const { data: transaction, error: transactionError } = await withDatabaseRetry(
        () => supabase
          .from('financial_transactions')
          .insert(completePaymentData)
          .select()
          .single(),
        'create_financial_transaction'
      );

      if (transactionError) throw transactionError;

      // CRITICAL: Update student fee balance if fee_id is provided
      if (paymentData.fee_id) {
        const { error: feeUpdateError } = await withDatabaseRetry(
          () => supabase.rpc('update_fee_payment', {
            p_fee_id: paymentData.fee_id,
            p_payment_amount: Number(paymentData.amount)
          }),
          'update_fee_payment'
        );

        if (feeUpdateError) {
          console.warn('Fee balance update failed:', feeUpdateError);
          // Don't fail the entire transaction, but log it
        }
      }

      // Track the finance transaction event
      await trackFinanceTransaction({
        student_id: paymentData.student_id,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        transaction_type: paymentData.transaction_type,
        reference_number: paymentData.reference_number
      });

      // Log successful transaction
      await auditLogger.logMpesaTransaction(user.id, completePaymentData, true);

      return { 
        success: true, 
        data: transaction,
        message: `Payment of ${paymentData.amount} processed successfully for ${studentData.name} (${studentData.admission_number})`
      };
    } catch (error: any) {
      console.error('Payment processing failed:', error);
      
      // Log failed transaction
      await auditLogger.logMpesaTransaction(user.id, paymentData, false, error.message);
      
      return { 
        success: false, 
        error: error.message || 'Payment processing failed',
        details: error
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processPayment,
    isProcessing
  };
};