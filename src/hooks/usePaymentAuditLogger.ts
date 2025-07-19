
import { useCallback } from 'react';
import { useAuditLogger } from './useAuditLogger';

export const usePaymentAuditLogger = (userId?: string) => {
  const { logPaymentAction } = useAuditLogger();

  const logPaymentProcessing = useCallback(async (paymentData: any, success: boolean, error?: string) => {
    if (!userId) return;

    try {
      await logPaymentAction(
        success ? 'Process' : 'Process Failed',
        paymentData.reference_number || paymentData.mpesa_code,
        paymentData.amount,
        {
          student_id: paymentData.student_id,
          payment_method: paymentData.payment_method,
          transaction_type: paymentData.transaction_type,
          success,
          error
        }
      );
    } catch (auditError) {
      console.error('Failed to log payment processing:', auditError);
    }
  }, [logPaymentAction, userId]);

  const logFeeUpdate = useCallback(async (feeId: string, oldValue: any, newValue: any) => {
    if (!userId) return;

    try {
      await logPaymentAction(
        'Fee Update',
        feeId,
        newValue.amount,
        {
          old_value: oldValue,
          new_value: newValue,
          fee_id: feeId
        }
      );
    } catch (auditError) {
      console.error('Failed to log fee update:', auditError);
    }
  }, [logPaymentAction, userId]);

  return {
    logPaymentProcessing,
    logFeeUpdate
  };
};
