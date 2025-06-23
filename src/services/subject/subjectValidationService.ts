
import { supabase } from '@/integrations/supabase/client';

export class SubjectValidationService {
  static async validateSubjectData(name: string, code: string, schoolId: string) {
    console.log('SubjectValidationService.validateSubjectData called with:', { name, code, schoolId });

    if (!name?.trim()) {
      throw new Error('Subject name is required');
    }
    
    if (!code?.trim()) {
      throw new Error('Subject code is required');
    }

    if (!schoolId) {
      throw new Error('School ID is required');
    }

    // Validate name length
    if (name.trim().length < 2) {
      throw new Error('Subject name must be at least 2 characters long');
    }

    // Validate code length
    if (code.trim().length < 2) {
      throw new Error('Subject code must be at least 2 characters long');
    }

    // Format and validate the code
    const formattedCode = code.trim().toUpperCase();
    if (!/^[A-Z0-9]+$/.test(formattedCode)) {
      throw new Error('Subject code must contain only uppercase letters and numbers');
    }

    return formattedCode;
  }

  static async checkDuplicates(name: string, code: string, schoolId: string) {
    console.log('SubjectValidationService.checkDuplicates called with:', { name, code, schoolId });

    try {
      // Check for duplicate name within the school
      const { data: existingName, error: nameCheckError } = await supabase
        .from('subjects')
        .select('id')
        .eq('school_id', schoolId)
        .ilike('name', name.trim())
        .eq('is_active', true)
        .maybeSingle();

      if (nameCheckError) {
        console.error('SubjectValidationService: Error checking for duplicate subject name:', nameCheckError);
        throw new Error('Failed to validate subject name: ' + nameCheckError.message);
      }

      if (existingName) {
        throw new Error(`Subject with name "${name.trim()}" already exists in your school`);
      }

      // Check for duplicate code within the school
      const { data: existingCode, error: codeCheckError } = await supabase
        .from('subjects')
        .select('id')
        .eq('school_id', schoolId)
        .eq('code', code)
        .eq('is_active', true)
        .maybeSingle();

      if (codeCheckError) {
        console.error('SubjectValidationService: Error checking for duplicate subject code:', codeCheckError);
        throw new Error('Failed to validate subject code: ' + codeCheckError.message);
      }

      if (existingCode) {
        throw new Error(`Subject with code "${code}" already exists in your school`);
      }

    } catch (error: any) {
      console.error('SubjectValidationService.checkDuplicates error:', error);
      throw error;
    }
  }

  static async validateReferences(classId?: string, teacherId?: string, schoolId?: string) {
    console.log('SubjectValidationService.validateReferences called with:', { classId, teacherId, schoolId });

    try {
      if (classId) {
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('id')
          .eq('id', classId)
          .eq('school_id', schoolId!)
          .maybeSingle();

        if (classError) {
          console.error('SubjectValidationService: Error validating class:', classError);
          throw new Error('Failed to validate class: ' + classError.message);
        }

        if (!classData) {
          throw new Error('Selected class does not exist or does not belong to your school');
        }
      }

      if (teacherId) {
        const { data: teacherData, error: teacherError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', teacherId)
          .eq('school_id', schoolId!)
          .eq('role', 'teacher')
          .maybeSingle();

        if (teacherError) {
          console.error('SubjectValidationService: Error validating teacher:', teacherError);
          throw new Error('Failed to validate teacher: ' + teacherError.message);
        }

        if (!teacherData) {
          throw new Error('Selected teacher does not exist or does not belong to your school');
        }
      }

    } catch (error: any) {
      console.error('SubjectValidationService.validateReferences error:', error);
      throw error;
    }
  }
}
