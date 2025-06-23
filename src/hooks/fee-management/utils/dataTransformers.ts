
import { FeeRecord, MPESATransaction } from '../types';

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
    studentName: item.students?.name || 'Unknown Student',
    admissionNumber: item.students?.admission_number || 'N/A',
    className: item.classes?.name || 'Unknown Class',
    academicYear: item.academic_year || new Date().getFullYear().toString(),
    paymentMethod: item.payment_method,
    paidDate: item.paid_date,
    createdAt: item.created_at || new Date().toISOString(),
    classId: item.class_id,
  };
};

export const transformMPESATransaction = (item: any): MPESATransaction => {
  return {
    id: item.id || item.transaction_id,
    transaction_id: item.transaction_id || item.id,
    mpesa_receipt_number: item.mpesa_receipt_number,
    phone_number: item.phone_number || '',
    amount_paid: Number(item.amount_paid) || 0,
    fee_id: item.fee_id,
    student_id: item.student_id,
    class_id: item.class_id,
    school_id: item.school_id || '',
    transaction_status: (item.transaction_status as 'Success' | 'Pending' | 'Failed') || 'Pending',
    payment_type: item.payment_type || 'Full',
    paybill_number: item.paybill_number,
    transaction_date: item.transaction_date || item.created_at || new Date().toISOString(),
    student: item.students ? {
      name: item.students.name || 'Unknown',
      admission_number: item.students.admission_number || 'N/A'
    } : undefined,
    class: item.classes ? {
      name: item.classes.name || 'Unknown'
    } : undefined,
  };
};
