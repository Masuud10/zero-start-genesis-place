
import { FeeRecord, MPESATransaction } from '../types';

export const transformFeeRecord = (fee: any): FeeRecord => {
  // Safe student data extraction with proper null checks
  let studentData: { name: string; admission_number: string } | undefined;
  if (fee.student && 
      fee.student !== null &&
      typeof fee.student === 'object' && 
      'name' in fee.student) {
    const student = fee.student as any;
    studentData = {
      name: String(student.name || ''),
      admission_number: String(student.admission_number || '')
    };
  }

  // Safe class data extraction with proper null checks
  let classData: { name: string } | undefined;
  if (fee.class && 
      fee.class !== null &&
      typeof fee.class === 'object' && 
      'name' in fee.class) {
    const classObj = fee.class as any;
    classData = {
      name: String(classObj.name || '')
    };
  }

  return {
    id: fee.id,
    student_id: fee.student_id || '',
    class_id: fee.class_id || '',
    amount: fee.amount || 0,
    paid_amount: fee.paid_amount || 0,
    status: (['pending', 'partial', 'paid', 'overdue'].includes(fee.status) 
      ? fee.status 
      : 'pending') as 'pending' | 'partial' | 'paid' | 'overdue',
    due_date: fee.due_date || '',
    academic_year: fee.academic_year || '',
    term: fee.term || '',
    category: fee.category || '',
    student: studentData,
    class: classData
  };
};

export const transformMPESATransaction = (transaction: any): MPESATransaction => {
  // Safe student data extraction with proper null checks
  let studentData: { name: string; admission_number: string } | undefined;
  if (transaction.student && 
      transaction.student !== null &&
      typeof transaction.student === 'object' && 
      'name' in transaction.student) {
    const student = transaction.student as any;
    studentData = {
      name: String(student.name || ''),
      admission_number: String(student.admission_number || '')
    };
  }

  // Safe class data extraction with proper null checks
  let classData: { name: string } | undefined;
  if (transaction.class && 
      transaction.class !== null &&
      typeof transaction.class === 'object' && 
      'name' in transaction.class) {
    const classObj = transaction.class as any;
    classData = {
      name: String(classObj.name || '')
    };
  }

  return {
    id: transaction.id,
    transaction_id: transaction.transaction_id || '',
    mpesa_receipt_number: transaction.mpesa_receipt_number || '',
    phone_number: transaction.phone_number || '',
    amount_paid: transaction.amount_paid || 0,
    transaction_date: transaction.transaction_date || '',
    transaction_status: transaction.transaction_status || '',
    student: studentData,
    class: classData
  };
};
