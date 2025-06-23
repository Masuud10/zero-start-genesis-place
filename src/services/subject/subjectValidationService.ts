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

    // Check if code is too long (database constraint)
    if (formattedCode.length > 20) {
      throw new Error('Subject code must be 20 characters or less');
    }

    return formattedCode;
  }

  static async checkDuplicates(name: string, code: string, schoolId: string) {
    console.log('SubjectValidationService.checkDuplicates called with:', { name, code, schoolId });

    try {
      // Test database connection first
      const { data: connectionTest, error: connectionError } = await supabase
        .from('subjects')
        .select('id')
        .limit(1);

      if (connectionError) {
        console.error('Database connection failed in validation:', connectionError);
        throw new Error('Database connection failed. Please check your internet connection.');
      }

      // Check for duplicate name within the school - using case-insensitive comparison
      const { data: existingName, error: nameCheckError } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .ilike('name', name.trim());

      if (nameCheckError) {
        console.error('SubjectValidationService: Error checking for duplicate subject name:', nameCheckError);
        throw new Error(`Failed to validate subject name: ${nameCheckError.message}`);
      }

      if (existingName && existingName.length > 0) {
        throw new Error(`Subject with name "${name.trim()}" already exists in your school`);
      }

      // Check for duplicate code within the school - case-insensitive
      const { data: existingCode, error: codeCheckError } = await supabase
        .from('subjects')
        .select('id, code')
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .ilike('code', code.trim());

      if (codeCheckError) {
        console.error('SubjectValidationService: Error checking for duplicate subject code:', codeCheckError);
        throw new Error(`Failed to validate subject code: ${codeCheckError.message}`);
      }

      if (existingCode && existingCode.length > 0) {
        throw new Error(`Subject with code "${code.toUpperCase()}" already exists in your school`);
      }

      console.log('SubjectValidationService: No duplicates found');

    } catch (error: any) {
      console.error('SubjectValidationService.checkDuplicates error:', error);
      throw error;
    }
  }

  static async validateReferences(classId?: string, teacherId?: string, schoolId?: string) {
    console.log('SubjectValidationService.validateReferences called with:', { classId, teacherId, schoolId });

    if (!schoolId) {
      return; // Skip validation if no school context
    }

    try {
      if (classId) {
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('id, name, school_id')
          .eq('id', classId)
          .single();

        if (classError) {
          console.error('SubjectValidationService: Error validating class:', classError);
          if (classError.code === 'PGRST116') {
            throw new Error('Selected class does not exist');
          }
          throw new Error(`Failed to validate class: ${classError.message}`);
        }

        if (!classData) {
          throw new Error('Selected class does not exist');
        }

        if (classData.school_id !== schoolId) {
          throw new Error('Selected class does not belong to your school');
        }
      }

      if (teacherId) {
        const { data: teacherData, error: teacherError } = await supabase
          .from('profiles')
          .select('id, name, school_id, role')
          .eq('id', teacherId)
          .single();

        if (teacherError) {
          console.error('SubjectValidationService: Error validating teacher:', teacherError);
          if (teacherError.code === 'PGRST116') {
            throw new Error('Selected teacher does not exist');
          }
          throw new Error(`Failed to validate teacher: ${teacherError.message}`);
        }

        if (!teacherData) {
          throw new Error('Selected teacher does not exist');
        }

        if (teacherData.school_id !== schoolId) {
          throw new Error('Selected teacher does not belong to your school');
        }

        if (teacherData.role !== 'teacher') {
          throw new Error('Selected user is not a teacher');
        }
      }

      console.log('SubjectValidationService: References validated successfully');

    } catch (error: any) {
      console.error('SubjectValidationService.validateReferences error:', error);
      throw error;
    }
  }

  // Validate school access
  static async validateSchoolAccess(schoolId: string): Promise<boolean> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User authentication required');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('school_id, role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw new Error('Failed to get user profile');
      }

      // System admins can access any school
      if (profile.role === 'edufam_admin' || profile.role === 'elimisha_admin') {
        return true;
      }

      // Other users can only access their own school
      return profile.school_id === schoolId;

    } catch (error) {
      console.error('School access validation failed:', error);
      return false;
    }
  }
}
