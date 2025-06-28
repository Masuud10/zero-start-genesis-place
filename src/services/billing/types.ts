
export interface BillingRecord {
  id: string;
  school_id: string;
  billing_type: 'setup_fee' | 'subscription_fee';
  amount: number;
  currency: string;
  billing_period_start?: string;
  billing_period_end?: string;
  student_count?: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  invoice_number: string;
  description: string;
  due_date: string;
  paid_date?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  school?: {
    id: string;
    name: string;
    student_count?: number;
    total_billing_amount?: number;
    outstanding_balance?: number;
  };
}

export interface BillingStats {
  total_schools: number;
  total_revenue: number;
  pending_payments: number;
  active_subscriptions: number;
  total_amount_expected: number;
  outstanding_balance: number;
}

export interface School {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  student_count?: number;
}

export interface CreateFeeRecordData {
  school_id: string;
  billing_type: 'setup_fee' | 'subscription_fee';
  amount: number;
  description: string;
  due_date: string;
}

export interface BillingFilters {
  status?: string;
  school_name?: string;
  month?: string;
  year?: string;
}
