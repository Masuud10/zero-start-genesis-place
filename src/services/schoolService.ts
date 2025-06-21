
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

      // Use the existing create_school database function with owner details
      const { data, error } = await supabase.rpc('create_school', {
        school_name: schoolData.name,
        school_email: schoolData.email,
        school_phone: schoolData.phone,
        school_address: schoolData.address,
        owner_email: schoolData.ownerEmail || null,
        owner_name: schoolData.ownerName || null
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
          
          // Update additional fields that aren't handled by the basic create_school function
          if (result.school_id) {
            const updateData: any = {};
            
            if (schoolData.logo_url) updateData.logo_url = schoolData.logo_url;
            if (schoolData.website_url) updateData.website_url = schoolData.website_url;
            if (schoolData.motto) updateData.motto = schoolData.motto;
            if (schoolData.slogan) updateData.slogan = schoolData.slogan;
            if (schoolData.school_type) updateData.school_type = schoolData.school_type;
            if (schoolData.registration_number) updateData.registration_number = schoolData.registration_number;
            if (schoolData.year_established) updateData.year_established = schoolData.year_established;
            if (schoolData.term_structure) updateData.term_structure = schoolData.term_structure;
            if (schoolData.owner_information) updateData.owner_information = schoolData.owner_information;
            if (schoolData.curriculumType) updateData.curriculum_type = schoolData.curriculumType;
            
            // Update the school with additional fields if any exist
            if (Object.keys(updateData).length > 0) {
              const { error: updateError } = await supabase
                .from('schools')
                .update(updateData)
                .eq('id', result.school_id);
                
              if (updateError) {
                console.warn('🏫 SchoolService: Failed to update additional fields:', updateError);
                // Don't fail the entire operation for this
              }
            }
          }
          
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
