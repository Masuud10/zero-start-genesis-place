
import { CreateSchoolRequest } from '@/types/schoolTypes';

export class SchoolValidationService {
  static validateSchoolData(schoolData: CreateSchoolRequest): { isValid: boolean; error?: string } {
    // Validate required fields
    if (!schoolData.name || !schoolData.email || !schoolData.phone || !schoolData.address) {
      return {
        isValid: false,
        error: 'Missing required fields: name, email, phone, and address are required'
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(schoolData.email)) {
      return {
        isValid: false,
        error: 'Invalid email format'
      };
    }

    // Validate year of establishment
    const currentYear = new Date().getFullYear();
    if (schoolData.year_established && (schoolData.year_established < 1800 || schoolData.year_established > currentYear)) {
      return {
        isValid: false,
        error: 'Year of establishment must be between 1800 and current year'
      };
    }

    return { isValid: true };
  }
}
