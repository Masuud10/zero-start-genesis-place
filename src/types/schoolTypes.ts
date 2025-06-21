
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
  curriculumType?: 'cbc' | 'igcse';
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
  logo_url?: string;
  website_url?: string;
  motto?: string;
  slogan?: string;
  registration_number?: string;
  year_established?: number;
  term_structure?: string;
  owner_information?: string;
  curriculum_type?: string;
  created_at: string;
  updated_at: string;
  owner_id?: string;
  principal_id?: string;
}

export interface CreateSchoolRpcResult {
  success?: boolean;
  school_id?: string;
  owner_id?: string;
  message?: string;
  error?: string;
}
