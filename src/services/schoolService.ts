import { CreateSchoolRequest, CreateSchoolResponse, SchoolData } from '@/types/schoolTypes';
import { SchoolValidationService } from './school/schoolValidationService';
import { SchoolDbService } from './school/schoolDbService';
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

      // Check if registration number is unique
      if (schoolData.registration_number) {
        const isUnique = await SchoolDbService.checkRegistrationNumberUnique(schoolData.registration_number);
        if (!isUnique) {
          return {
            success: false,
            error: 'Registration number already exists'
          };
        }
      }

      // Create school using database function
      const responseData = await SchoolDbService.createSchoolWithRpc(schoolData);
      
      if (responseData?.error) {
        console.error('🏫 SchoolService: Function returned error:', responseData.error);
        return {
          success: false,
          error: responseData.error
        };
      }

      if (responseData?.success === true) {
        console.log('🏫 SchoolService: School created successfully:', responseData);
        
        // Update additional fields if school was created successfully
        if (responseData.school_id) {
          await SchoolDbService.updateSchoolAdditionalFields(responseData.school_id, schoolData);
        }
        
        return {
          success: true,
          school_id: responseData.school_id,
          owner_id: responseData.owner_id,
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
    return SchoolDbService.getAllSchools();
  }

  static async getSchoolById(schoolId: string): Promise<ServiceResponse<SchoolData>> {
    return SchoolDbService.getSchoolById(schoolId);
  }

  static async uploadSchoolLogo(file: File, schoolId: string): Promise<{ url?: string; error?: string }> {
    return SchoolStorageService.uploadSchoolLogo(file, schoolId);
  }
}

// Re-export types for backward compatibility
export type { CreateSchoolRequest, CreateSchoolResponse, SchoolData };
