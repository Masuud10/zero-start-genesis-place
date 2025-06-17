
import { supabase } from '@/integrations/supabase/client';

export interface SubjectValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateSubjectData = async (
  subjectData: {
    name: string;
    code: string;
    class_id: string;
    teacher_id?: string;
    school_id: string;
  }
): Promise<SubjectValidationResult> => {
  const errors: string[] = [];

  // Validate required fields
  if (!subjectData.name?.trim()) {
    errors.push('Subject name is required');
  }

  if (!subjectData.code?.trim()) {
    errors.push('Subject code is required');
  }

  if (!subjectData.class_id) {
    errors.push('Class selection is required');
  }

  if (!subjectData.school_id) {
    errors.push('School ID is required');
  }

  // Check if class exists and belongs to the same school
  if (subjectData.class_id && subjectData.school_id) {
    try {
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id, school_id')
        .eq('id', subjectData.class_id)
        .eq('school_id', subjectData.school_id)
        .maybeSingle();

      if (classError) {
        console.error('Class validation error:', classError);
        errors.push('Error validating class');
      } else if (!classData) {
        errors.push('Selected class does not exist or does not belong to your school');
      }
    } catch (error) {
      console.error('Class validation error:', error);
      errors.push('Error validating class');
    }
  }

  // Check if teacher exists and belongs to the same school (if provided)
  if (subjectData.teacher_id && subjectData.school_id) {
    try {
      const { data: teacherData, error: teacherError } = await supabase
        .from('profiles')
        .select('id, school_id, role')
        .eq('id', subjectData.teacher_id)
        .eq('school_id', subjectData.school_id)
        .eq('role', 'teacher')
        .maybeSingle();

      if (teacherError) {
        console.error('Teacher validation error:', teacherError);
        errors.push('Error validating teacher');
      } else if (!teacherData) {
        errors.push('Selected teacher does not exist or does not belong to your school');
      }
    } catch (error) {
      console.error('Teacher validation error:', error);
      errors.push('Error validating teacher');
    }
  }

  // Check for duplicate subject code in the same class
  if (subjectData.code?.trim() && subjectData.class_id) {
    try {
      const { data: existingSubject, error: duplicateError } = await supabase
        .from('subjects')
        .select('id')
        .eq('code', subjectData.code.trim().toUpperCase())
        .eq('class_id', subjectData.class_id)
        .maybeSingle();

      if (duplicateError) {
        console.error('Duplicate check error:', duplicateError);
        errors.push('Error checking for duplicate subjects');
      } else if (existingSubject) {
        errors.push('A subject with this code already exists in the selected class');
      }
    } catch (error) {
      console.error('Duplicate check error:', error);
      errors.push('Error checking for duplicate subjects');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const logSubjectCreationError = (error: any, context: string) => {
  console.error(`Subject creation error in ${context}:`, {
    error,
    message: error?.message,
    code: error?.code,
    details: error?.details,
    hint: error?.hint,
    timestamp: new Date().toISOString()
  });
};
