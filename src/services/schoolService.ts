import { supabase } from '@/integrations/supabase/client';

export interface CreateSchoolRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
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
      const { data, error } = await supabase.rpc('create_school', {
        school_name: schoolData.name,
        school_email: schoolData.email,
        school_phone: schoolData.phone,
        school_address: schoolData.address,
        owner_email: schoolData.ownerEmail || null,
        owner_name: schoolData.ownerName || null,
        curriculum_type: schoolData.curriculumType || 'cbc'
      });

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
