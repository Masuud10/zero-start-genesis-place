
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
