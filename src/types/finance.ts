
export interface Fee {
  id: string;
  studentId: string;
  amount: number;
  dueDate: Date;
  term: string;
  category: 'tuition' | 'transport' | 'meals' | 'activities' | 'other';
  status: 'pending' | 'paid' | 'overdue';
  paidAmount?: number;
  paidDate?: Date;
  paymentMethod?: 'mpesa' | 'cash' | 'bank';
  mpesaCode?: string;
  schoolId: string;
  academicYear: string;
  installmentNumber: number;
  lateFeeAmount: number;
  discountAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  schoolId: string;
  category: string;
  amount: number;
  description: string;
  date: Date;
  approvedBy: string;
  receipt?: string;
  isRecurring: boolean;
  recurringPeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface FinancialTransaction {
  id: string;
  schoolId: string;
  studentId?: string;
  feeId?: string;
  transactionType: 'payment' | 'refund' | 'adjustment' | 'late_fee';
  amount: number;
  paymentMethod?: 'cash' | 'mpesa' | 'bank_transfer' | 'card' | 'cheque';
  referenceNumber?: string;
  mpesaCode?: string;
  bankReference?: string;
  description?: string;
  processedBy?: string;
  processedAt: Date;
  academicYear: string;
  term?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AcademicYear {
  id: string;
  schoolId: string;
  yearName: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  createdAt: Date;
}

export interface AcademicTerm {
  id: string;
  schoolId: string;
  academicYearId: string;
  termName: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  createdAt: Date;
}
