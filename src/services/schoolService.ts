import { supabase } from '@/integrations/supabase/client';

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
  curriculumType?: 'cbc' | 'igcse';
}

export interface CreateSchoolResponse {
  success: boolean;
  school_id?: string;
  owner_id?: string;
  message?: string;
  error?: string;
}

export class SchoolService {
  static async createSchool(schoolData: CreateSchoolRequest): Promise<CreateSchoolResponse> {
    try {
      console.log('🏫 SchoolService: Creating school via database function', schoolData);

      // Use the create_school database function (only elimisha_admin can call this)
      const { data, error } = await supabase.rpc('create_enhanced_school', {
        school_name: schoolData.name,
        school_email: schoolData.email,
        school_phone: schoolData.phone,
        school_address: schoolData.address,
        school_logo_url: schoolData.logo_url || null,
        school_website_url: schoolData.website_url || null,
        school_motto: schoolData.motto || null,
        school_slogan: schoolData.slogan || null,
        school_type: schoolData.school_type || 'primary',
        registration_number: schoolData.registration_number || null,
        year_established: schoolData.year_established || null,
        term_structure: schoolData.term_structure || '3-term',
        owner_information: schoolData.owner_information || null,
        owner_email: schoolData.ownerEmail || null,
        owner_name: schoolData.ownerName || null,
        curriculum_type: schoolData.curriculumType || 'cbc'
      } as any);

      if (error) {
        console.error('🏫 SchoolService: Database function error:', error);
        throw error;
      }

      // Handle the JSONB response
      if (data && typeof data === 'object' && data !== null) {
        const result = data as Record<string, any>;
        
        if ('error' in result && typeof result.error === 'string') {
          console.error('🏫 SchoolService: Function returned error:', result.error);
          return {
            success: false,
            error: result.error
          };
        }

        if ('success' in result && result.success === true) {
          console.log('🏫 SchoolService: School created successfully:', result);
          return {
            success: true,
            school_id: typeof result.school_id === 'string' ? result.school_id : undefined,
            owner_id: typeof result.owner_id === 'string' ? result.owner_id : undefined,
            message: typeof result.message === 'string' ? result.message : 'School created successfully'
          };
        }
      }

      return {
        success: false,
        error: 'Unexpected response from server'
      };

    } catch (error: any) {
      console.error('🏫 SchoolService: Service error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create school'
      };
    }
  }

  static async getAllSchools() {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select(`
          id,
          name,
          email,
          phone,
          address,
          logo_url,
          website_url,
          motto,
          slogan,
          school_type,
          registration_number,
          year_established,
          term_structure,
          owner_information,
          created_at,
          updated_at,
          owner_id,
          principal_id
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('🏫 SchoolService: Error fetching schools:', error);
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('🏫 SchoolService: Service error:', error);
      return { data: null, error };
    }
  }

  static async getSchoolById(schoolId: string) {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select(`
          id,
          name,
          email,
          phone,
          address,
          logo_url,
          website_url,
          motto,
          slogan,
          school_type,
          registration_number,
          year_established,
          term_structure,
          owner_information,
          created_at,
          updated_at,
          owner_id,
          principal_id
        `)
        .eq('id', schoolId)
        .single();

      if (error) {
        console.error('🏫 SchoolService: Error fetching school:', error);
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('🏫 SchoolService: Service error:', error);
      return { data: null, error };
    }
  }
}
