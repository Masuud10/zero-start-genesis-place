
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

interface CreateSchoolRpcResponse {
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
      if (!schoolData.school_name?.trim()) {
        return {
          success: false,
          error: 'School name is required'
        };
      }

      if (!schoolData.school_email?.trim()) {
        return {
          success: false,
          error: 'School email is required'
        };
      }

      if (!schoolData.school_phone?.trim()) {
        return {
          success: false,
          error: 'School phone is required'
        };
      }

      if (!schoolData.school_address?.trim()) {
        return {
          success: false,
          error: 'School address is required'
        };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(schoolData.school_email)) {
        return {
          success: false,
          error: 'Please enter a valid email address'
        };
      }

      // Validate owner details if provided
      if (schoolData.owner_email && !schoolData.owner_name) {
        return {
          success: false,
          error: 'Owner name is required when owner email is provided'
        };
      }

      if (schoolData.owner_name && !schoolData.owner_email) {
        return {
          success: false,
          error: 'Owner email is required when owner name is provided'
        };
      }

      if (schoolData.owner_email && !emailRegex.test(schoolData.owner_email)) {
        return {
          success: false,
          error: 'Please enter a valid owner email address'
        };
      }

      // Validate principal details if provided
      if (schoolData.principal_email && !schoolData.principal_name) {
        return {
          success: false,
          error: 'Principal name is required when principal email is provided'
        };
      }

      if (schoolData.principal_name && !schoolData.principal_email) {
        return {
          success: false,
          error: 'Principal email is required when principal name is provided'
        };
      }

      if (schoolData.principal_email && !emailRegex.test(schoolData.principal_email)) {
        return {
          success: false,
          error: 'Please enter a valid principal email address'
        };
      }

      // Call the comprehensive school creation function
      const { data, error } = await supabase.rpc('create_comprehensive_school', {
        school_name: schoolData.school_name,
        school_email: schoolData.school_email,
        school_phone: schoolData.school_phone,
        school_address: schoolData.school_address,
        school_type: schoolData.school_type || 'primary',
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
        principal_name: schoolData.principal_name || null,
        principal_email: schoolData.principal_email || null,
        principal_phone: schoolData.principal_contact || null,
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
      
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const response = data as unknown as CreateSchoolRpcResponse;
        if (response.success) {
          return {
            success: true,
            school_id: response.school_id,
            owner_id: response.owner_id,
            principal_id: response.principal_id,
            message: response.message || 'School created successfully with complete setup'
          };
        } else {
          return {
            success: false,
            error: response.error || 'Failed to create school'
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
