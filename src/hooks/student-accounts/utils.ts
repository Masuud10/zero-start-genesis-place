
import { Student, FeeRecord } from '@/hooks/fee-management/types';
import { StudentAccount } from './types';

export const transformStudentData = (studentsData: any[]): Student[] => {
  return (studentsData || []).map(student => {
    // Safely handle the classes data with proper null checking
    let className = 'Unknown Class';
    
    // Check if classes exists and is not null
    if (student.classes && student.classes !== null) {
      // Handle both single object and array cases
      if (Array.isArray(student.classes)) {
        // If it's an array, get the first item's name
        if (student.classes.length > 0 && student.classes[0]?.name) {
          className = student.classes[0].name;
        }
      } else if (typeof student.classes === 'object' && 'name' in student.classes && student.classes.name) {
        // If it's a single object with name property, add null check for name
        className = student.classes.name;
      }
    }

    return {
      id: student.id,
      name: student.name,
      admission_number: student.admission_number,
      class_id: student.class_id,
      school_id: student.school_id,
      class: { name: className }
    };
  });
};

export const createStudentAccountsMap = (students: Student[]): Map<string, StudentAccount> => {
  const accountsMap = new Map<string, StudentAccount>();

  students.forEach(student => {
    accountsMap.set(student.id, {
      student,
      totalFees: 0,
      totalPaid: 0,
      outstanding: 0,
      fees: []
    });
  });

  return accountsMap;
};

export const processFeeData = (feesData: any[], accountsMap: Map<string, StudentAccount>) => {
  (feesData || []).forEach(fee => {
    const studentId = fee.student_id;
    const account = accountsMap.get(studentId);
    
    if (account) {
      // Ensure status is properly typed
      const validStatuses: Array<'pending' | 'paid' | 'partial' | 'overdue'> = ['pending', 'paid', 'partial', 'overdue'];
      const feeStatus = validStatuses.includes(fee.status as any) ? fee.status : 'pending';
      
      const feeRecord: FeeRecord = {
        id: fee.id,
        studentId: fee.student_id,
        amount: fee.amount || 0,
        paidAmount: fee.paid_amount || 0,
        dueDate: fee.due_date,
        term: fee.term,
        category: fee.category,
        status: feeStatus as 'pending' | 'paid' | 'partial' | 'overdue',
        studentName: account.student.name,
        admissionNumber: account.student.admission_number,
        className: account.student.class?.name || 'Unknown Class',
        academicYear: fee.academic_year,
        paymentMethod: fee.payment_method,
        paidDate: fee.paid_date,
        createdAt: fee.created_at,
        classId: fee.class_id
      };

      account.fees.push(feeRecord);
      account.totalFees += feeRecord.amount;
      account.totalPaid += feeRecord.paidAmount;
      account.outstanding = account.totalFees - account.totalPaid;
    }
  });
};
