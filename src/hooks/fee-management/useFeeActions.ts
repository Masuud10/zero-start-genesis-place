
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useFeeActions = () => {
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const assignFeeToClass = useCallback(async (classId: string, feeData: Record<string, unknown>, isRetry = false) => {
    if (!user?.school_id) {
      toast({
        title: "Error",
        description: "User not associated with a school",
        variant: "destructive",
      });
      return false;
    }

    // Validate fee data
    if (!feeData.amount || feeData.amount <= 0) {
      toast({
        title: "Error",
        description: "Invalid fee amount",
        variant: "destructive",
      });
      return false;
    }

    if (!feeData.category || !feeData.term) {
      toast({
        title: "Error",
        description: "Missing required fee information",
        variant: "destructive",
      });
      return false;
    }

    try {
      setLoading(true);
      
      console.log('💰 Assigning fee to class:', classId, 'with retry:', isRetry);
      
      // Get all students in the class with validation
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, name')
        .eq('class_id', classId)
        .eq('school_id', user.school_id)
        .eq('is_active', true);

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
        throw new Error(`Failed to fetch students: ${studentsError.message}`);
      }

      if (!students || students.length === 0) {
        toast({
          title: "Warning",
          description: "No active students found in the selected class",
          variant: "destructive",
        });
        return false;
      }

      // Validate fee amount consistency
      const feeAmount = Number(feeData.amount);
      if (isNaN(feeAmount) || feeAmount <= 0) {
        throw new Error('Invalid fee amount provided');
      }

      // Create fee records for each student with validation
      const feeRecords = students.map(student => ({
        school_id: user.school_id,
        student_id: student.id,
        class_id: classId,
        amount: feeAmount,
        category: feeData.category || 'General',
        term: feeData.term,
        academic_year: feeData.academic_year || new Date().getFullYear().toString(),
        due_date: feeData.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        status: 'pending',
        paid_amount: 0,
        discount_amount: 0,
        late_fee_amount: 0,
        installment_number: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      console.log('Creating fee records for students:', feeRecords.length);

      // Use transaction-like approach with rollback capability
      const { data: createdFees, error } = await supabase
        .from('fees')
        .insert(feeRecords)
        .select('id, student_id, amount');

      if (error) {
        console.error('Error creating fee records:', error);
        throw new Error(`Failed to create fee records: ${error.message}`);
      }

      // Validate created records
      if (!createdFees || createdFees.length !== students.length) {
        console.error('Fee creation mismatch:', createdFees?.length, 'vs', students.length);
        throw new Error('Some fee records failed to create');
      }

      console.log('Successfully created fees:', createdFees.length);

      toast({
        title: "Success",
        description: `Fee assigned to ${students.length} students in the class`,
      });

      setRetryCount(0); // Reset retry count on success
      return true;

    } catch (error: unknown) {
      console.error('Error assigning fee to class:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      // Retry logic for transient errors
      if (!isRetry && retryCount < 2 && (
        errorMessage.includes('timeout') || 
        errorMessage.includes('network') || 
        errorMessage.includes('connection')
      )) {
        console.log('🔄 Retrying fee assignment...');
        setRetryCount(prev => prev + 1);
        setTimeout(() => assignFeeToClass(classId, feeData, true), 2000);
        return false;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.school_id, retryCount, toast]);

  const assignFeeToStudent = useCallback(async (studentId: string, feeData: any, students: any[], isRetry = false) => {
    if (!user?.school_id) {
      toast({
        title: "Error",
        description: "User not associated with a school",
        variant: "destructive",
      });
      return false;
    }

    // Validate inputs
    if (!studentId || !feeData.amount || feeData.amount <= 0) {
      toast({
        title: "Error",
        description: "Invalid student or fee data",
        variant: "destructive",
      });
      return false;
    }

    try {
      setLoading(true);

      const student = students.find(s => s.id === studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      // Validate fee amount
      const feeAmount = Number(feeData.amount);
      if (isNaN(feeAmount) || feeAmount <= 0) {
        throw new Error('Invalid fee amount');
      }

      const feeRecord = {
        ...feeData,
        student_id: studentId,
        class_id: student.class_id,
        school_id: user.school_id,
        amount: feeAmount,
        status: 'pending',
        paid_amount: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: createdFee, error } = await supabase
        .from('fees')
        .insert([feeRecord])
        .select('id, amount')
        .single();

      if (error) {
        console.error('Error creating fee record:', error);
        throw new Error(`Failed to create fee record: ${error.message}`);
      }

      if (!createdFee) {
        throw new Error('Fee record was not created');
      }

      toast({
        title: "Success",
        description: "Fee assigned to student successfully",
      });

      setRetryCount(0); // Reset retry count on success
      return true;

    } catch (error: unknown) {
      console.error('Error assigning fee to student:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      // Retry logic for transient errors
      if (!isRetry && retryCount < 2 && (
        errorMessage.includes('timeout') || 
        errorMessage.includes('network') || 
        errorMessage.includes('connection')
      )) {
        console.log('🔄 Retrying student fee assignment...');
        setRetryCount(prev => prev + 1);
        setTimeout(() => assignFeeToStudent(studentId, feeData, students, true), 2000);
        return false;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.school_id, retryCount, toast]);

  const recordPayment = useCallback(async (feeId: string, paymentData: any, isRetry = false) => {
    if (!user?.school_id) {
      toast({
        title: "Error",
        description: "User not associated with a school",
        variant: "destructive",
      });
      return false;
    }

    // Validate payment data
    if (!paymentData.amount || paymentData.amount <= 0) {
      toast({
        title: "Error",
        description: "Invalid payment amount",
        variant: "destructive",
      });
      return false;
    }

    if (!paymentData.total_amount || paymentData.total_amount <= 0) {
      toast({
        title: "Error",
        description: "Invalid total amount",
        variant: "destructive",
      });
      return false;
    }

    try {
      setLoading(true);

      // Validate payment amount doesn't exceed total
      const paymentAmount = Number(paymentData.amount);
      const totalAmount = Number(paymentData.total_amount);
      
      if (paymentAmount > totalAmount) {
        throw new Error('Payment amount cannot exceed total fee amount');
      }

      // First, get the current fee record to validate
      const { data: currentFee, error: fetchError } = await supabase
        .from('fees')
        .select('paid_amount, amount, status')
        .eq('id', feeId)
        .eq('school_id', user.school_id)
        .single();

      if (fetchError || !currentFee) {
        throw new Error('Fee record not found or access denied');
      }

      // Calculate new paid amount
      const currentPaidAmount = Number(currentFee.paid_amount || 0);
      const newPaidAmount = currentPaidAmount + paymentAmount;
      const feeAmount = Number(currentFee.amount || 0);

      // Validate payment doesn't exceed fee amount
      if (newPaidAmount > feeAmount) {
        throw new Error('Payment would exceed total fee amount');
      }

      // Determine new status
      const newStatus = newPaidAmount >= feeAmount ? 'paid' : 'partial';

      // Update the fee record with payment information
      const { error: updateError } = await supabase
        .from('fees')
        .update({
          paid_amount: newPaidAmount,
          payment_method: paymentData.payment_method || 'cash',
          paid_date: new Date().toISOString(),
          status: newStatus,
          mpesa_code: paymentData.mpesa_code || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', feeId)
        .eq('school_id', user.school_id);

      if (updateError) {
        console.error('Error updating fee record:', updateError);
        throw new Error(`Failed to update fee record: ${updateError.message}`);
      }

      // Create a financial transaction record
      const transactionData = {
        school_id: user.school_id,
        fee_id: feeId,
        student_id: paymentData.student_id,
        amount: paymentAmount,
        payment_method: paymentData.payment_method || 'cash',
        transaction_type: 'payment',
        reference_number: paymentData.reference_number || `PAY-${Date.now()}`,
        mpesa_code: paymentData.mpesa_code || null,
        description: `Fee payment for ${paymentData.category || 'General'}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: transactionError } = await supabase
        .from('financial_transactions')
        .insert([transactionData]);

      if (transactionError) {
        console.warn('Failed to create financial transaction record:', transactionError);
        // Don't throw here as the main payment was successful
      }

      toast({
        title: "Success",
        description: `Payment of KES ${paymentAmount.toLocaleString()} recorded successfully`,
      });

      setRetryCount(0); // Reset retry count on success
      return true;

    } catch (error: unknown) {
      console.error('Error recording payment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      // Retry logic for transient errors
      if (!isRetry && retryCount < 2 && (
        errorMessage.includes('timeout') || 
        errorMessage.includes('network') || 
        errorMessage.includes('connection')
      )) {
        console.log('🔄 Retrying payment recording...');
        setRetryCount(prev => prev + 1);
        setTimeout(() => recordPayment(feeId, paymentData, true), 2000);
        return false;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.school_id, retryCount, toast]);

  return {
    assignFeeToClass,
    assignFeeToStudent,
    recordPayment,
    loading,
    retryCount
  };
};
