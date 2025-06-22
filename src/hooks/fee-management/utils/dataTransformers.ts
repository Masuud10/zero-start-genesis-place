
import { MpesaTransaction } from '../types';

export const transformMPESATransaction = (transaction: any): MpesaTransaction => {
  return {
    id: transaction.id,
    transaction_id: transaction.transaction_id || '',
    phone_number: transaction.phone_number || '',
    amount_paid: transaction.amount_paid || 0,
    transaction_status: transaction.transaction_status || '',
    mpesa_receipt_number: transaction.mpesa_receipt_number || '',
    transaction_date: transaction.transaction_date || '',
    student_id: transaction.student_id || '',
    fee_id: transaction.fee_id || '',
    class_id: transaction.class_id || '',
    student: transaction.student && 
             transaction.student !== null && 
             typeof transaction.student === 'object' && 
             'name' in transaction.student
      ? {
          name: (transaction.student as any).name || '',
          admission_number: (transaction.student as any).admission_number || ''
        }
      : undefined,
    class: transaction.class && 
           transaction.class !== null && 
           typeof transaction.class === 'object' && 
           'name' in transaction.class
      ? {
          name: (transaction.class as any).name || ''
        }
      : undefined
  };
};
