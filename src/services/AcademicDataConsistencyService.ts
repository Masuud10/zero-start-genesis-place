import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AcademicContext {
  schoolId: string;
  academicYearId?: string;
  termId?: string;
  classId?: string;
  subjectId?: string;
  curriculumType?: string;
}

export interface AccessValidationResult {
  hasAccess: boolean;
  error?: string;
  academicContext?: AcademicContext;
  userRole?: string;
}

export interface CurriculumValidationResult {
  isConsistent: boolean;
  curriculumType?: string;
  errors?: string[];
  curriculumTypes?: {
    academicYear?: string;
    term?: string;
    class?: string;
    subject?: string;
  };
}

export interface AcademicDataValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
  context?: AcademicContext;
}

export class AcademicDataConsistencyService {
  /**
   * Validate user access to academic data based on role and context
   */
  static async validateAcademicDataAccess(
    userId: string,
    context: AcademicContext,
    operation: string
  ): Promise<AccessValidationResult> {
    try {
      const { data, error } = await supabase.rpc('validate_academic_data_access', {
        p_user_id: userId,
        p_school_id: context.schoolId,
        p_academic_year_id: context.academicYearId,
        p_term_id: context.termId,
        p_class_id: context.classId,
        p_subject_id: context.subjectId,
        p_operation: operation
      });

      if (error) throw error;

      return {
        hasAccess: data.has_access,
        error: data.error,
        academicContext: {
          schoolId: context.schoolId,
          academicYearId: data.academic_year_id,
          termId: data.term_id,
          classId: context.classId,
          subjectId: context.subjectId
        },
        userRole: data.user_role
      };
    } catch (error) {
      console.error('Error validating academic data access:', error);
      return {
        hasAccess: false,
        error: 'Failed to validate access permissions'
      };
    }
  }

  /**
   * Validate curriculum type consistency across academic entities
   */
  static async validateCurriculumConsistency(
    context: AcademicContext
  ): Promise<CurriculumValidationResult> {
    try {
      const { data, error } = await supabase.rpc('validate_curriculum_consistency', {
        p_school_id: context.schoolId,
        p_academic_year_id: context.academicYearId,
        p_term_id: context.termId,
        p_class_id: context.classId,
        p_subject_id: context.subjectId
      });

      if (error) throw error;

      return {
        isConsistent: data.is_consistent,
        curriculumType: data.curriculum_type,
        errors: data.errors,
        curriculumTypes: data.curriculum_types
      };
    } catch (error) {
      console.error('Error validating curriculum consistency:', error);
      return {
        isConsistent: false,
        errors: ['Failed to validate curriculum consistency']
      };
    }
  }

  /**
   * Get curriculum-specific grading configuration
   */
  static async getCurriculumGradingConfig(
    curriculumType: string,
    schoolId: string
  ): Promise<Record<string, unknown> | null> {
    try {
      const { data, error } = await supabase.rpc('get_curriculum_grading_config', {
        p_curriculum_type: curriculumType,
        p_school_id: schoolId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting curriculum grading config:', error);
      return null;
    }
  }

  /**
   * Get current academic context for a school
   */
  static async getCurrentAcademicContext(schoolId: string): Promise<AcademicContext | null> {
    try {
      const { data, error } = await supabase
        .from('current_academic_context')
        .select('*')
        .eq('school_id', schoolId)
        .single();

      if (error) throw error;

      return {
        schoolId: data.school_id,
        academicYearId: data.academic_year_id,
        termId: data.term_id,
        curriculumType: data.curriculum_type
      };
    } catch (error) {
      console.error('Error getting current academic context:', error);
      return null;
    }
  }

  /**
   * Get teacher assignments with academic context
   */
  static async getTeacherAssignmentsWithContext(
    teacherId: string,
    schoolId: string,
    academicYearId?: string,
    termId?: string
  ): Promise<Record<string, unknown>[]> {
    try {
      let query = supabase
        .from('teacher_assignments_with_context')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('school_id', schoolId)
        .eq('is_active', true);

      if (academicYearId) {
        query = query.eq('academic_year_id', academicYearId);
      }

      if (termId) {
        query = query.eq('term_id', termId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting teacher assignments:', error);
      return [];
    }
  }

  /**
   * Validate academic data before operations
   */
  static async validateAcademicData(
    context: AcademicContext,
    dataType: string
  ): Promise<AcademicDataValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate curriculum consistency
      const curriculumValidation = await this.validateCurriculumConsistency(context);
      if (!curriculumValidation.isConsistent) {
        errors.push(...(curriculumValidation.errors || []));
      }

      // Validate academic period exists
      if (context.academicYearId) {
        const { data: academicYear, error: yearError } = await supabase
          .from('academic_years')
          .select('id, is_active')
          .eq('id', context.academicYearId)
          .eq('school_id', context.schoolId)
          .single();

        if (yearError || !academicYear) {
          errors.push('Invalid or inactive academic year');
        } else if (!academicYear.is_active) {
          warnings.push('Academic year is not active');
        }
      }

      if (context.termId) {
        const { data: term, error: termError } = await supabase
          .from('academic_terms')
          .select('id, is_active')
          .eq('id', context.termId)
          .eq('school_id', context.schoolId)
          .single();

        if (termError || !term) {
          errors.push('Invalid or inactive academic term');
        } else if (!term.is_active) {
          warnings.push('Academic term is not active');
        }
      }

      // Validate class exists and belongs to school
      if (context.classId) {
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('id, is_active, curriculum_type')
          .eq('id', context.classId)
          .eq('school_id', context.schoolId)
          .single();

        if (classError || !classData) {
          errors.push('Invalid class or class does not belong to this school');
        } else if (!classData.is_active) {
          warnings.push('Class is not active');
        }

        // Validate curriculum type consistency
        if (context.curriculumType && classData.curriculum_type !== context.curriculumType) {
          errors.push(`Class curriculum type (${classData.curriculum_type}) does not match expected type (${context.curriculumType})`);
        }
      }

      // Validate subject exists and is assigned to class
      if (context.subjectId && context.classId && context.academicYearId && context.termId) {
        const { data: assignment, error: assignmentError } = await supabase
          .from('subject_teacher_assignments_enhanced')
          .select('id')
          .eq('subject_id', context.subjectId)
          .eq('class_id', context.classId)
          .eq('academic_year_id', context.academicYearId)
          .eq('term_id', context.termId)
          .eq('is_active', true)
          .single();

        if (assignmentError || !assignment) {
          errors.push('Subject is not assigned to this class for the current academic period');
        }
      }

      return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
        context
      };
    } catch (error) {
      console.error('Error validating academic data:', error);
      return {
        isValid: false,
        errors: ['Failed to validate academic data'],
        context
      };
    }
  }

  /**
   * Log academic data changes for audit purposes
   */
  static async logAcademicDataChange(
    tableName: string,
    recordId: string,
    operation: string,
    userId: string,
    schoolId: string,
    changes?: Record<string, unknown>
  ): Promise<void> {
    try {
      await supabase.rpc('log_academic_data_change', {
        p_table_name: tableName,
        p_record_id: recordId,
        p_operation: operation,
        p_user_id: userId,
        p_school_id: schoolId,
        p_changes: changes || {}
      });
    } catch (error) {
      console.error('Error logging academic data change:', error);
    }
  }

  /**
   * Get academic context validation issues
   */
  static async getAcademicContextValidationIssues(
    schoolId: string,
    validationType?: string
  ): Promise<Record<string, unknown>[]> {
    try {
      let query = supabase
        .from('academic_context_validation_log')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (validationType) {
        query = query.eq('validation_type', validationType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting academic context validation issues:', error);
      return [];
    }
  }

  /**
   * Ensure academic context is set for data operations
   */
  static async ensureAcademicContext(
    context: AcademicContext
  ): Promise<AcademicContext> {
    // If academic year and term are not provided, get current ones
    if (!context.academicYearId || !context.termId) {
      const currentContext = await this.getCurrentAcademicContext(context.schoolId);
      if (currentContext) {
        return {
          ...context,
          academicYearId: context.academicYearId || currentContext.academicYearId,
          termId: context.termId || currentContext.termId,
          curriculumType: context.curriculumType || currentContext.curriculumType
        };
      }
    }

    return context;
  }

  /**
   * Get curriculum display information
   */
  static getCurriculumDisplayInfo(curriculumType: string) {
    switch (curriculumType?.toLowerCase()) {
      case 'cbc':
        return {
          name: 'Competency-Based Curriculum (CBC)',
          description: 'Kenyan CBC with performance levels and strand assessments',
          gradingSystem: 'Performance Levels (EM, AP, PR, EX)',
          color: 'blue',
          icon: '🎯',
          badgeClass: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'igcse':
        return {
          name: 'International General Certificate of Secondary Education (IGCSE)',
          description: 'Cambridge IGCSE with letter grades and component scoring',
          gradingSystem: 'Letter Grades (A*, A, B, C, D, E, F, G, U)',
          color: 'purple',
          icon: '🎓',
          badgeClass: 'bg-purple-100 text-purple-800 border-purple-200'
        };
      default:
        return {
          name: 'Standard Curriculum',
          description: 'Traditional numeric grading system',
          gradingSystem: 'Numeric Scores (0-100) with letter grades',
          color: 'green',
          icon: '📊',
          badgeClass: 'bg-green-100 text-green-800 border-green-200'
        };
    }
  }

  /**
   * Validate that teachers and principals can only input data within their assigned scope
   */
  static async validateUserScope(
    userId: string,
    context: AcademicContext,
    operation: string
  ): Promise<{ isValid: boolean; error?: string }> {
    try {
      // Get user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role, school_id')
        .eq('id', userId)
        .single();

      if (profileError || !userProfile) {
        return { isValid: false, error: 'User profile not found' };
      }

      // Check school access
      if (userProfile.school_id !== context.schoolId) {
        return { isValid: false, error: 'Access denied to this school' };
      }

      // Role-specific scope validation
      if (userProfile.role === 'teacher') {
        // Teachers can only operate on their assigned classes/subjects
        if (context.classId && context.subjectId) {
          const { data: assignment, error: assignmentError } = await supabase
            .from('subject_teacher_assignments_enhanced')
            .select('id')
            .eq('teacher_id', userId)
            .eq('class_id', context.classId)
            .eq('subject_id', context.subjectId)
            .eq('academic_year_id', context.academicYearId)
            .eq('term_id', context.termId)
            .eq('is_active', true)
            .single();

          if (assignmentError || !assignment) {
            return { 
              isValid: false, 
              error: 'You are not assigned to this class/subject for the current academic period' 
            };
          }
        }
      } else if (userProfile.role === 'principal') {
        // Principals can operate on all classes in their school
        if (context.classId) {
          const { data: classData, error: classError } = await supabase
            .from('classes')
            .select('id')
            .eq('id', context.classId)
            .eq('school_id', context.schoolId)
            .single();

          if (classError || !classData) {
            return { 
              isValid: false, 
              error: 'Invalid class or class does not belong to your school' 
            };
          }
        }
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error validating user scope:', error);
      return { isValid: false, error: 'Failed to validate user scope' };
    }
  }
}

// Hook for using academic data consistency service
export const useAcademicDataConsistency = () => {
  const { user } = useAuth();

  const validateAccess = async (
    context: AcademicContext,
    operation: string
  ): Promise<AccessValidationResult> => {
    if (!user?.id) {
      return { hasAccess: false, error: 'User not authenticated' };
    }

    return AcademicDataConsistencyService.validateAcademicDataAccess(
      user.id,
      context,
      operation
    );
  };

  const validateCurriculum = async (
    context: AcademicContext
  ): Promise<CurriculumValidationResult> => {
    return AcademicDataConsistencyService.validateCurriculumConsistency(context);
  };

  const validateData = async (
    context: AcademicContext,
    dataType: string
  ): Promise<AcademicDataValidationResult> => {
    return AcademicDataConsistencyService.validateAcademicData(context, dataType);
  };

  const validateScope = async (
    context: AcademicContext,
    operation: string
  ): Promise<{ isValid: boolean; error?: string }> => {
    if (!user?.id) {
      return { isValid: false, error: 'User not authenticated' };
    }

    return AcademicDataConsistencyService.validateUserScope(
      user.id,
      context,
      operation
    );
  };

  const getCurrentContext = async (schoolId: string): Promise<AcademicContext | null> => {
    return AcademicDataConsistencyService.getCurrentAcademicContext(schoolId);
  };

  const getCurriculumConfig = async (
    curriculumType: string,
    schoolId: string
  ): Promise<Record<string, unknown> | null> => {
    return AcademicDataConsistencyService.getCurriculumGradingConfig(curriculumType, schoolId);
  };

  const logChange = async (
    tableName: string,
    recordId: string,
    operation: string,
    schoolId: string,
    changes?: Record<string, unknown>
  ): Promise<void> => {
    if (!user?.id) return;

    return AcademicDataConsistencyService.logAcademicDataChange(
      tableName,
      recordId,
      operation,
      user.id,
      schoolId,
      changes
    );
  };

  return {
    validateAccess,
    validateCurriculum,
    validateData,
    validateScope,
    getCurrentContext,
    getCurriculumConfig,
    logChange,
    getCurriculumDisplayInfo: AcademicDataConsistencyService.getCurriculumDisplayInfo
  };
}; 