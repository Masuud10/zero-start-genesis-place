
export interface FeeRecord {
  id: string;
  studentId: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  term: string;
  category: string;
  status: 'pending' | 'paid' | 'partial' | 'overdue';
  studentName: string;
  admissionNumber: string;
  className: string;
  academicYear: string;
  paymentMethod?: string;
  paidDate?: string;
  createdAt: string;
  classId?: string;
}

export interface MPESATransaction {
  id: string;
  transaction_id: string;
  mpesa_receipt_number?: string;
  phone_number: string;
  amount_paid: number;
  fee_id?: string;
  student_id?: string;
  class_id?: string;
  school_id: string;
  transaction_status: 'Success' | 'Pending' | 'Failed';
  payment_type: string;
  paybill_number?: string;
  transaction_date: string;
  student?: {
    name: string;
    admission_number: string;
  };
  class?: {
    name: string;
  };
}

export interface MpesaTransaction {
  id: string;
  transaction_id: string;
  mpesa_receipt_number?: string;
  phone_number: string;
  amount_paid: number;
  fee_id?: string;
  student_id?: string;
  class_id?: string;
  school_id: string;
  transaction_status: 'Success' | 'Pending' | 'Failed';
  payment_type: string;
  paybill_number?: string;
  transaction_date: string;
  student?: {
    name: string;
    admission_number: string;
  };
  class?: {
    name: string;
  };
}

export interface ClassSummary {
  classId: string;
  className: string;
  totalFees: number;
  totalCollected: number;
  outstanding: number;
  studentCount: number;
  // Add database column name aliases for compatibility
  class_id?: string;
  class_name?: string;
  total_amount?: number;
  paid_amount?: number;
  balance?: number;
  student_count?: number;
}

export interface Student {
  id: string;
  name: string;
  admission_number: string;
  class_id: string;
  school_id: string;
  class?: {
    name: string;
  };
}

export interface Class {
  id: string;
  name: string;
  school_id: string;
}

export interface FeeStructure {
  id: string;
  name: string;
  school_id: string;
  academic_year: string;
  term: string;
  is_active: boolean;
  items?: FeeStructureItem[];
}

export interface FeeStructureItem {
  id: string;
  fee_structure_id: string;
  name: string;
  description?: string;
  amount: number;
  category: string;
}

export interface MpesaCredentials {
  id?: string;
  school_id: string;
  consumer_key: string;
  consumer_secret: string;
  paybill_number: string;
  passkey: string;
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
