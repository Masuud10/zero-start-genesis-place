
import { MpesaTransaction, FeeRecord } from '../types';

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

export const transformFeeRecord = (fee: any): FeeRecord => {
  return {
    id: fee.id,
    student_id: fee.student_id || '',
    class_id: fee.class_id || '',
    school_id: fee.school_id || '',
    amount: fee.amount || 0,
    paid_amount: fee.paid_amount || 0,
    due_date: fee.due_date || '',
    status: fee.status || 'pending',
    category: fee.category || '',
    term: fee.term || '',
    academic_year: fee.academic_year || '',
    created_at: fee.created_at || '',
    updated_at: fee.updated_at || '',
    student: fee.student && 
             fee.student !== null && 
             typeof fee.student === 'object' && 
             'name' in fee.student
      ? {
          name: (fee.student as any).name || '',
          admission_number: (fee.student as any).admission_number || ''
        }
      : undefined,
    class: fee.class && 
           fee.class !== null && 
           typeof fee.class === 'object' && 
           'name' in fee.class
      ? {
          name: (fee.class as any).name || ''
        }
      : undefined
  };
};
