
import { FeeRecord, MPESATransaction, MpesaTransaction } from '../types';

export const transformFeeRecord = (item: any): FeeRecord => {
  return {
    id: item.id,
    studentId: item.student_id || '',
    amount: Number(item.amount) || 0,
    paidAmount: Number(item.paid_amount) || 0,
    dueDate: item.due_date || new Date().toISOString(),
    term: item.term || '',
    category: item.category || 'Unknown',
    status: item.status || 'pending',
    studentName: item.student?.name || 'Unknown Student',
    admissionNumber: item.student?.admission_number || 'N/A',
    className: item.class?.name || 'Unknown Class',
    academicYear: item.academic_year || new Date().getFullYear().toString(),
    paymentMethod: item.payment_method,
    paidDate: item.paid_date,
    createdAt: item.created_at || new Date().toISOString(),
  };
};

export const transformMPESATransaction = (item: any): MPESATransaction => {
  return {
    transaction_id: item.transaction_id || item.id,
    mpesa_receipt_number: item.mpesa_receipt_number,
    phone_number: item.phone_number || '',
    amount_paid: Number(item.amount_paid) || 0,
    fee_id: item.fee_id,
    student_id: item.student_id,
    class_id: item.class_id,
    school_id: item.school_id || '',
    transaction_status: item.transaction_status || 'Pending',
    payment_type: item.payment_type || 'Full',
    paybill_number: item.paybill_number,
    transaction_date: item.transaction_date || item.created_at || new Date().toISOString(),
    student: item.student ? {
      name: item.student.name || 'Unknown',
      admission_number: item.student.admission_number || 'N/A'
    } : undefined,
    class: item.class ? {
      name: item.class.name || 'Unknown'
    } : undefined,
  };
};
