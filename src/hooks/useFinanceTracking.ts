
import { useState } from 'react';
import { useAnalyticsTracking } from './useAnalyticsTracking';
import { supabase } from '@/integrations/supabase/client';

export const useFinanceTracking = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { trackFinanceTransaction } = useAnalyticsTracking();

  const processPayment = async (paymentData: any) => {
    setIsProcessing(true);
    try {
      // Process payment in database
      const { data, error } = await supabase
        .from('financial_transactions')
        .insert(paymentData)
        .select()
        .single();

      if (error) throw error;

      // Track the finance transaction event
      await trackFinanceTransaction({
        student_id: paymentData.student_id,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        transaction_type: paymentData.transaction_type,
        reference_number: paymentData.reference_number
      });

      return { success: true, data };
    } catch (error) {
      console.error('Payment processing failed:', error);
      return { success: false, error };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processPayment,
    isProcessing
  };
};
