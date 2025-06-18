
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from './useSchoolScopedData';

interface PaymentData {
  studentFeeId: string;
  amount: number;
  paymentMethod: 'mpesa' | 'cash' | 'bank_transfer' | 'card' | 'cheque';
  referenceNumber?: string;
  mpesaCode?: string;
  bankReference?: string;
}

export const useFeePayments = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { schoolId, isSystemAdmin } = useSchoolScopedData();

  const recordPayment = async (paymentData: PaymentData) => {
    if (!schoolId && !isSystemAdmin) {
      const message = 'School ID is required to record payments';
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return { data: null, error: message };
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Recording fee payment:', paymentData);

      // Validate payment data
      if (!paymentData.studentFeeId || !paymentData.amount || paymentData.amount <= 0) {
        throw new Error('Invalid payment data: Student fee ID and valid amount are required');
      }

      if (!paymentData.paymentMethod) {
        throw new Error('Payment method is required');
      }

      // For MPESA payments, require MPESA code
      if (paymentData.paymentMethod === 'mpesa' && !paymentData.mpesaCode) {
        throw new Error('MPESA code is required for MPESA payments');
      }

      // For bank transfers, require bank reference
      if (paymentData.paymentMethod === 'bank_transfer' && !paymentData.bankReference) {
        throw new Error('Bank reference is required for bank transfers');
      }

      const { data, error: paymentError } = await supabase.rpc('record_fee_payment', {
        p_student_fee_id: paymentData.studentFeeId,
        p_amount: paymentData.amount,
        p_payment_method: paymentData.paymentMethod,
        p_reference_number: paymentData.referenceNumber || null,
        p_mpesa_code: paymentData.mpesaCode || null,
        p_bank_reference: paymentData.bankReference || null
      });

      if (paymentError) {
        console.error('Payment recording error:', paymentError);
        throw new Error(`Failed to record payment: ${paymentError.message}`);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      console.log('Payment recorded successfully:', data);
      
      toast({
        title: "Payment Recorded",
        description: `Payment of KES ${paymentData.amount.toLocaleString()} recorded successfully`,
      });

      return { data, error: null };
    } catch (err: any) {
      const message = err?.message || 'Failed to record payment';
      console.error('Payment recording error:', err);
      setError(message);
      toast({
        title: "Payment Error",
        description: message,
        variant: "destructive",
      });
      return { data: null, error: message };
    } finally {
      setLoading(false);
    }
  };

  return {
    recordPayment,
    loading,
    error
  };
};
