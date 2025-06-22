
export interface FeeRecord {
  id: string;
  student_id: string;
  class_id: string;
  amount: number;
  paid_amount: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  due_date: string;
  academic_year: string;
  term: string;
  category: string;
  student?: {
    name: string;
    admission_number: string;
  };
  class?: {
    name: string;
  };
}

export interface MPESATransaction {
  id: string;
  transaction_id: string;
  mpesa_receipt_number: string;
  phone_number: string;
  amount_paid: number;
  transaction_date: string;
  transaction_status: string;
  student?: {
    name: string;
    admission_number: string;
  };
  class?: {
    name: string;
  };
}

export interface ClassSummary {
  class_id: string;
  class_name: string;
  total_amount: number;
  paid_amount: number;
  balance: number;
  student_count: number;
  // Legacy aliases for backward compatibility
  total_fees?: number;
  collected?: number;
  outstanding?: number;
}

export interface FeeData {
  amount: number;
  due_date: string;
  academic_year: string;
  term: string;
  category: string;
}

export interface PaymentData {
  amount: number;
  payment_method: string;
  mpesa_code?: string;
  reference_number?: string;
}

export interface SchoolData {
  classes: any[];
  students: any[];
  feeStructures: any[];
}
