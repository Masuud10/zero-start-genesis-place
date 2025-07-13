import { CreateSchoolRequest, CreateSchoolResponse, SchoolData } from '@/types/schoolTypes';
import { SchoolValidationService } from './school/schoolValidationService';
import { createSchool, getAllSchools, getSchool, updateSchool, CreateSchoolData } from './school/schoolDbService';
import { SchoolStorageService } from './school/schoolStorageService';

interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
}

export class SchoolService {
  static async createSchool(schoolData: CreateSchoolRequest): Promise<CreateSchoolResponse> {
    try {
      console.log('🏫 SchoolService: Creating school with enhanced data', schoolData);

      // Validate school data
      const validationResult = SchoolValidationService.validateSchoolData(schoolData);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.error
        };
      }

      // Convert CreateSchoolRequest to CreateSchoolData for database insertion
      const createSchoolData: CreateSchoolData = {
        name: schoolData.name,
        email: schoolData.email,
        phone: schoolData.phone,
        address: schoolData.address,
        logo_url: schoolData.logo_url,
        website_url: schoolData.website_url,
        motto: schoolData.motto,
        slogan: schoolData.slogan,
        school_type: schoolData.school_type,
        registration_number: schoolData.registration_number,
        year_established: schoolData.year_established,
        term_structure: schoolData.term_structure,
        owner_information: schoolData.owner_information
      };

      // Create school using the new function-based approach
      const responseData = await createSchool(createSchoolData);
      
      if (responseData.error) {
        console.error('🏫 SchoolService: Function returned error:', responseData.error);
        return {
          success: false,
          error: responseData.error
        };
      }

      if (responseData.success) {
        console.log('🏫 SchoolService: School created successfully:', responseData);
        
        return {
          success: true,
          school_id: responseData.school_id,
          message: responseData.message || 'School created successfully'
        };
      }

      return {
        success: false,
        error: 'Unexpected response from server'
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create school';
      console.error('🏫 SchoolService: Service error:', error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  static async getAllSchools(): Promise<ServiceResponse<SchoolData[]>> {
    try {
      const schools = await getAllSchools();
      return {
        data: schools,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch schools'
      };
    }
  }

  static async getSchoolById(schoolId: string): Promise<ServiceResponse<SchoolData>> {
    try {
      const school = await getSchool(schoolId);
      return {
        data: school,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch school'
      };
    }
  }

  static async uploadSchoolLogo(file: File, schoolId: string): Promise<{ url?: string; error?: string }> {
    return SchoolStorageService.uploadSchoolLogo(file, schoolId);
  }
}

// Re-export types for backward compatibility
export type { CreateSchoolRequest, CreateSchoolResponse, SchoolData };
