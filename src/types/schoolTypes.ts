
export interface CreateSchoolRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  logo_url?: string;
  website_url?: string;
  motto?: string;
  slogan?: string;
  school_type?: 'primary' | 'secondary' | 'college';
  registration_number?: string;
  year_established?: number;
  term_structure?: '3-term' | '2-semester' | 'other';
  owner_information?: string;
  ownerEmail?: string;
  ownerName?: string;
  ownerPhone?: string;

}

export interface CreateSchoolResponse {
  success: boolean;
  school_id?: string;
  owner_id?: string;
  message?: string;
  error?: string;
}

export interface SchoolData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  location?: string;
  logo_url?: string;
  website_url?: string;
  motto?: string;
  slogan?: string;
  registration_number?: string;
  year_established?: number;
  term_structure?: string;
  owner_information?: string;
  school_type?: string;
  status?: string;
  created_at: string;
  updated_at: string;
  owner_id?: string;
}

export interface CreateSchoolRpcResult {
  success?: boolean;
  school_id?: string;
  owner_id?: string;
  principal_id?: string;
  message?: string;
  error?: string;
}

// Comprehensive school creation interface for the new modal
export interface ComprehensiveSchoolData {
  // Basic Information
  school_name: string;
  school_email: string;
  school_phone: string;
  school_address: string;
  
  // School Details
  school_type: 'primary' | 'secondary' | 'college';
  term_structure: '3-term' | '2-semester' | 'other';
  registration_number?: string;
  year_established?: number;
  
  // Branding
  logo_url?: string;
  website_url?: string;
  motto?: string;
  slogan?: string;
  
  // Owner Information
  owner_name?: string;
  owner_email?: string;
  owner_phone?: string;
  owner_information?: string;
  
  // Principal Information
  principal_name?: string;
  principal_email?: string;
  principal_contact?: string;
  
  // MPESA Configuration
  mpesa_paybill_number?: string;
  mpesa_consumer_key?: string;
  mpesa_consumer_secret?: string;
  mpesa_passkey?: string;
}
