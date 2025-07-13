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
   * Simplified validation for basic access control
   */
  static async validateAcademicDataAccess(
    userId: string,
    context: AcademicContext,
    operation: string
  ): Promise<AccessValidationResult> {
    try {
      // Get user profile for basic validation
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role, school_id')
        .eq('id', userId)
        .single();

      if (profileError || !userProfile) {
        return { hasAccess: false, error: 'User profile not found' };
      }

      // Check school access
      if (userProfile.school_id !== context.schoolId) {
        return { hasAccess: false, error: 'Access denied to this school' };
      }

      return {
        hasAccess: true,
        academicContext: context,
        userRole: userProfile.role
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
   * Basic curriculum consistency validation
   */
  static async validateCurriculumConsistency(
    context: AcademicContext
  ): Promise<CurriculumValidationResult> {
    try {
      const errors: string[] = [];
      let curriculumType = context.curriculumType;

      // If class is provided, get its curriculum type
      if (context.classId && !curriculumType) {
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('curriculum_type')
          .eq('id', context.classId)
          .single();

        if (!classError && classData) {
          curriculumType = classData.curriculum_type;
        }
      }

      return {
        isConsistent: errors.length === 0,
        curriculumType,
        errors: errors.length > 0 ? errors : undefined
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
   * Get current academic context for a school
   */
  static async getCurrentAcademicContext(schoolId: string): Promise<AcademicContext | null> {
    try {
      // Get current academic year
      const { data: yearData, error: yearError } = await supabase
        .from('academic_years')
        .select('id, year_name')
        .eq('school_id', schoolId)
        .eq('is_current', true)
        .single();

      // Get current term
      const { data: termData, error: termError } = await supabase
        .from('academic_terms')
        .select('id, term_name')
        .eq('school_id', schoolId)
        .eq('is_current', true)
        .single();

      return {
        schoolId,
        academicYearId: yearData?.id,
        termId: termData?.id
      };
    } catch (error) {
      console.error('Error getting current academic context:', error);
      return null;
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
          .select('id, is_current')
          .eq('id', context.academicYearId)
          .eq('school_id', context.schoolId)
          .single();

        if (yearError || !academicYear) {
          errors.push('Invalid academic year');
        } else if (!academicYear.is_current) {
          warnings.push('Academic year is not current');
        }
      }

      if (context.termId) {
        const { data: term, error: termError } = await supabase
          .from('academic_terms')
          .select('id, is_current')
          .eq('id', context.termId)
          .eq('school_id', context.schoolId)
          .single();

        if (termError || !term) {
          errors.push('Invalid academic term');
        } else if (!term.is_current) {
          warnings.push('Academic term is not current');
        }
      }

      // Validate class exists and belongs to school
      if (context.classId) {
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('id, curriculum_type')
          .eq('id', context.classId)
          .eq('school_id', context.schoolId)
          .single();

        if (classError || !classData) {
          errors.push('Invalid class or class does not belong to this school');
        }

        // Validate curriculum type consistency
        if (context.curriculumType && classData?.curriculum_type !== context.curriculumType) {
          errors.push(`Class curriculum type (${classData.curriculum_type}) does not match expected type (${context.curriculumType})`);
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
            .from('subjects')
            .select('id')
            .eq('id', context.subjectId)
            .eq('class_id', context.classId)
            .eq('teacher_id', userId)
            .single();

          if (assignmentError || !assignment) {
            return { 
              isValid: false, 
              error: 'You are not assigned to this class/subject' 
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

  const validateUserScope = async (
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

  const ensureContext = async (context: AcademicContext): Promise<AcademicContext> => {
    return AcademicDataConsistencyService.ensureAcademicContext(context);
  };

  const getCurriculumInfo = (curriculumType: string) => {
    return AcademicDataConsistencyService.getCurriculumDisplayInfo(curriculumType);
  };

  return {
    validateAccess,
    validateCurriculum,
    validateData,
    validateUserScope,
    getCurrentContext,
    ensureContext,
    getCurriculumInfo
  };
};