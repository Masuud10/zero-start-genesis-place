
import { supabase } from '@/integrations/supabase/client';
import { ComprehensiveSchoolData } from '@/types/schoolTypes';

export interface SchoolCreationResult {
  success: boolean;
  school_id?: string;
  owner_id?: string;
  principal_id?: string;
  message?: string;
  error?: string;
}

export class SchoolCreationService {
  static async createSchool(schoolData: ComprehensiveSchoolData): Promise<SchoolCreationResult> {
    try {
      console.log('🏫 SchoolCreationService: Creating school with data:', schoolData);

      // Validate required fields
      if (!schoolData.school_name || !schoolData.school_email || !schoolData.school_phone || !schoolData.school_address) {
        return {
          success: false,
          error: 'Missing required fields: name, email, phone, and address are required'
        };
      }

      // Call the comprehensive school creation function
      const { data, error } = await supabase.rpc('create_comprehensive_school', {
        school_name: schoolData.school_name,
        school_email: schoolData.school_email,
        school_phone: schoolData.school_phone,
        school_address: schoolData.school_address,
        school_type: schoolData.school_type || 'primary',
        curriculum_type: schoolData.curriculum_type || 'cbc',
        term_structure: schoolData.term_structure || '3-term',
        registration_number: schoolData.registration_number || null,
        year_established: schoolData.year_established || null,
        logo_url: schoolData.logo_url || null,
        website_url: schoolData.website_url || null,
        motto: schoolData.motto || null,
        slogan: schoolData.slogan || null,
        owner_name: schoolData.owner_name || null,
        owner_email: schoolData.owner_email || null,
        owner_phone: schoolData.owner_phone || null,
        owner_information: schoolData.owner_information || null,
        principal_name: schoolData.principal_name || null,
        principal_email: schoolData.principal_email || null,
        principal_contact: schoolData.principal_contact || null,
        mpesa_paybill_number: schoolData.mpesa_paybill_number || null,
        mpesa_consumer_key: schoolData.mpesa_consumer_key || null,
        mpesa_consumer_secret: schoolData.mpesa_consumer_secret || null,
        mpesa_passkey: schoolData.mpesa_passkey || null
      });

      if (error) {
        console.error('🏫 SchoolCreationService: RPC Error:', error);
        return {
          success: false,
          error: `Database error: ${error.message}`
        };
      }

      console.log('🏫 SchoolCreationService: RPC Response:', data);
      
      if (data && typeof data === 'object') {
        if (data.success) {
          return {
            success: true,
            school_id: data.school_id,
            owner_id: data.owner_id,
            principal_id: data.principal_id,
            message: data.message || 'School created successfully with complete setup'
          };
        } else {
          return {
            success: false,
            error: data.error || 'Failed to create school'
          };
        }
      }

      return {
        success: false,
        error: 'Invalid response from server'
      };

    } catch (error: any) {
      console.error('🏫 SchoolCreationService: Service error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create school'
      };
    }
  }
}
