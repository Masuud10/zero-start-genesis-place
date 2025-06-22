
export interface MpesaTransaction {
  id: string;
  transaction_id: string;
  phone_number: string;
  amount_paid: number;
  transaction_status: string;
  mpesa_receipt_number: string;
  transaction_date: string;
  student_id: string;
  fee_id: string;
  class_id: string;
  student?: {
    name: string;
    admission_number: string;
  };
  class?: {
    name: string;
  };
}

export interface MpesaCredentials {
  consumer_key: string;
  consumer_secret: string;
  passkey: string;
  paybill_number: string;
}

export interface FeeRecord {
  id: string;
  student_id: string;
  class_id: string;
  school_id: string;
  amount: number;
  paid_amount: number;
  due_date: string;
  status: string;
  category: string;
  term: string;
  academic_year: string;
  created_at: string;
  updated_at: string;
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
  total_fees: number;
  collected: number;
  outstanding: number;
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

// Alias for backward compatibility
export type MPESATransaction = MpesaTransaction;
