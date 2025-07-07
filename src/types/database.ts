// Database table types for type safety
export interface FeeStructure {
  id: string;
  school_id: string;
  name: string;
  academic_year: string;
  term: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentFee {
  id: string;
  student_id: string;
  school_id: string;
  fee_id: string;
  class_id: string;
  amount: number;
  amount_paid: number;
  status: string;
  due_date: string;
  academic_year: string;
  term: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEnhancedSchoolParams {
  school_name: string;
  school_email: string;
  school_phone: string;
  school_address: string;
  registration_number?: string;
  school_type: string;
  term_structure: string;
  year_established: number;
  timezone: string;
  logo_url?: string;
  website_url?: string;
  motto?: string;
  slogan?: string;
  owner_name?: string;
  owner_email?: string;
  owner_phone?: string;
  owner_information?: string;
  mpesa_enabled: boolean;
  mpesa_paybill_number?: string;
  mpesa_business_name?: string;
  mpesa_callback_url?: string;
  mpesa_shortcode?: string;
  mpesa_confirmation_key?: string;
}

export interface CreateEnhancedSchoolResult {
  success?: boolean;
  school_id?: string;
  owner_id?: string;
  message?: string;
  error?: string;
} 