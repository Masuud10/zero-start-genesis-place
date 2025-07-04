export type ValidCurriculumType = 'cbc' | 'igcse' | 'standard';

export interface CurriculumValidationResult {
  isValid: boolean;
  curriculumType: ValidCurriculumType;
  error?: string;
  suggestions?: string[];
}

/**
 * Validates curriculum type and provides helpful error messages
 */
export const validateCurriculumType = (curriculumValue: string | null | undefined): CurriculumValidationResult => {
  if (!curriculumValue) {
    return {
      isValid: false,
      curriculumType: 'standard',
      error: 'No curriculum type assigned to this class',
      suggestions: [
        'Update the class details to assign a curriculum type',
        'Valid options: CBC, IGCSE, or Standard',
        'Contact your system administrator if you need help'
      ]
    };
  }

  const normalized = curriculumValue.toString().toLowerCase().trim();
  
  switch (normalized) {
    case 'cbc':
    case 'competency_based':
    case 'competency-based':
    case 'competency based':
      return {
        isValid: true,
        curriculumType: 'cbc'
      };
    case 'igcse':
    case 'cambridge':
    case 'cambridge igcse':
      return {
        isValid: true,
        curriculumType: 'igcse'
      };
    case 'standard':
    case 'traditional':
    case '8-4-4':
    case '844':
      return {
        isValid: true,
        curriculumType: 'standard'
      };
    default:
      return {
        isValid: false,
        curriculumType: 'standard',
        error: `Unrecognized curriculum type: ${curriculumValue}`,
        suggestions: [
          'Valid curriculum types are: CBC, IGCSE, Standard',
          'CBC: Competency-Based Curriculum (Kenyan)',
          'IGCSE: International General Certificate of Secondary Education',
          'Standard: Traditional numeric grading (0-100)',
          'Please update the class details with a valid curriculum type'
        ]
      };
  }
};

/**
 * Gets curriculum display information
 */
export const getCurriculumInfo = (curriculumType: ValidCurriculumType) => {
  switch (curriculumType) {
    case 'cbc':
      return {
        name: 'Competency-Based Curriculum (CBC)',
        description: 'Kenyan CBC with performance levels and strand assessments',
        gradingSystem: 'Performance Levels (EM, AP, PR, EX)',
        color: 'blue',
        icon: '🎯'
      };
    case 'igcse':
      return {
        name: 'International General Certificate of Secondary Education (IGCSE)',
        description: 'Cambridge IGCSE with letter grades and component scoring',
        gradingSystem: 'Letter Grades (A*, A, B, C, D, E, F, G, U)',
        color: 'purple',
        icon: '🎓'
      };
    case 'standard':
      return {
        name: 'Standard Curriculum',
        description: 'Traditional numeric grading system',
        gradingSystem: 'Numeric Scores (0-100) with letter grades',
        color: 'green',
        icon: '📊'
      };
  }
};

/**
 * Validates if a class has proper curriculum setup
 */
export const validateClassCurriculumSetup = async (classId: string, supabase: {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        single: () => Promise<{ 
          data: { curriculum_type?: string; curriculum?: string; name?: string } | null; 
          error: { message: string } | null 
        }>;
      };
    };
  };
}) => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('curriculum_type, curriculum, name')
      .eq('id', classId)
      .single();

    if (error) {
      return {
        isValid: false,
        error: 'Failed to fetch class information',
        details: error.message
      };
    }

    const curriculumValue = data?.curriculum_type || data?.curriculum;
    const validation = validateCurriculumType(curriculumValue);

    return {
      isValid: validation.isValid,
      class: data,
      curriculumType: validation.curriculumType,
      error: validation.error,
      suggestions: validation.suggestions
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Database connection error',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Fixes curriculum type for a class by updating the database
 */
export const fixClassCurriculumType = async (
  classId: string, 
  newCurriculumType: ValidCurriculumType,
  supabase: {
    from: (table: string) => {
      update: (data: { curriculum_type: string; curriculum: string }) => {
        eq: (column: string, value: string) => Promise<{ 
          data: unknown; 
          error: { message: string } | null 
        }>;
      };
    };
  }
) => {
  try {
    // Convert to uppercase for database storage
    const dbCurriculumType = newCurriculumType.toUpperCase();
    
    const { data, error } = await supabase
      .from('classes')
      .update({ 
        curriculum_type: dbCurriculumType,
        curriculum: dbCurriculumType 
      })
      .eq('id', classId);

    if (error) {
      return {
        success: false,
        error: 'Failed to update curriculum type',
        details: error.message
      };
    }

    return {
      success: true,
      message: `Curriculum type updated to ${newCurriculumType.toUpperCase()}`,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: 'Database update error',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Gets curriculum-specific grading sheet component name
 */
export const getCurriculumGradingSheetComponent = (curriculumType: ValidCurriculumType): string => {
  switch (curriculumType) {
    case 'cbc':
      return 'CBCGradingSheet';
    case 'igcse':
      return 'IGCSEGradingSheet';
    case 'standard':
      return 'EnhancedGradingSheet';
    default:
      return 'EnhancedGradingSheet';
  }
};

/**
 * Gets curriculum-specific assessment types
 */
export const getCurriculumAssessmentTypes = (curriculumType: ValidCurriculumType): string[] => {
  switch (curriculumType) {
    case 'cbc':
      return [
        'observation',
        'written_work', 
        'project_work',
        'group_activity',
        'oral_assessment',
        'practical_work'
      ];
    case 'igcse':
      return [
        'coursework',
        'examination',
        'practical',
        'oral'
      ];
    case 'standard':
      return [
        'OPENER',
        'MID_TERM',
        'END_TERM',
        'FINAL'
      ];
    default:
      return ['OPENER', 'MID_TERM', 'END_TERM'];
  }
}; 