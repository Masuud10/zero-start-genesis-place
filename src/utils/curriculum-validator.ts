import { supabase } from '@/integrations/supabase/client';

export interface CurriculumValidationResult {
  isValid: boolean;
  curriculumType: string;
  message: string;
  error?: string;
  suggestions?: string[];
}

export interface ClassCurriculumData {
  id: string;
  name: string;
  curriculum_type?: string;
  curriculum?: string;
  school_id: string;
}

/**
 * Validates curriculum type and provides helpful error messages
 * @param curriculumValue - The curriculum value to validate
 * @returns CurriculumValidationResult
 */
export const validateCurriculumType = (curriculumValue: string | null | undefined): CurriculumValidationResult => {
  if (!curriculumValue) {
    return {
      isValid: false,
      curriculumType: 'standard',
      message: 'No curriculum type assigned to this class',
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
        curriculumType: 'cbc',
        message: 'Valid CBC curriculum type'
      };
    case 'igcse':
    case 'cambridge':
    case 'cambridge igcse':
      return {
        isValid: true,
        curriculumType: 'igcse',
        message: 'Valid IGCSE curriculum type'
      };
    case 'standard':
    case 'traditional':
    case '8-4-4':
    case '844':
      return {
        isValid: true,
        curriculumType: 'standard',
        message: 'Valid Standard curriculum type'
      };
    default:
      return {
        isValid: false,
        curriculumType: 'standard',
        message: `Unrecognized curriculum type: ${curriculumValue}`,
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
 * @param curriculumType - The curriculum type
 * @returns Curriculum info object
 */
export const getCurriculumInfo = (curriculumType: string) => {
  const normalized = curriculumType.toLowerCase();
  
  switch (normalized) {
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
    default:
      return {
        name: 'Unknown Curriculum',
        description: 'Curriculum type not recognized',
        gradingSystem: 'Unknown',
        color: 'gray',
        icon: '❓'
      };
  }
};

/**
 * Validates curriculum type for a class
 * @param classId - The class ID to validate
 * @returns Promise<CurriculumValidationResult>
 */
export async function validateClassCurriculum(classId: string): Promise<CurriculumValidationResult> {
  try {
    // Fetch class data including curriculum information
    const { data, error } = await supabase
      .from('classes')
      .select('id, name, curriculum_type, curriculum, school_id')
      .eq('id', classId)
      .single();

    if (error) {
      return {
        isValid: false,
        curriculumType: 'unknown',
        message: `Failed to fetch class data: ${error.message}`,
        suggestions: ['Check if the class exists', 'Verify database connection']
      };
    }

    if (!data) {
      return {
        isValid: false,
        curriculumType: 'unknown',
        message: 'Class not found',
        suggestions: ['Verify the class ID is correct']
      };
    }

    // Check both curriculum_type and curriculum fields
    const curriculumValue = data.curriculum_type || data.curriculum;
    
    if (!curriculumValue) {
      return {
        isValid: false,
        curriculumType: 'unknown',
        message: 'No curriculum type specified for this class',
        suggestions: [
          'Set curriculum_type to "CBC", "IGCSE", or "Standard"',
          'Update the class configuration'
        ]
      };
    }

    // Validate curriculum type
    const validCurriculums = ['CBC', 'IGCSE', 'Standard', 'cbc', 'igcse', 'standard'];
    const normalizedCurriculum = curriculumValue.toLowerCase();
    
    if (!validCurriculums.includes(curriculumValue) && !validCurriculums.includes(normalizedCurriculum)) {
      return {
        isValid: false,
        curriculumType: curriculumValue,
        message: `Invalid curriculum type: ${curriculumValue}`,
        suggestions: [
          'Use "CBC" for Kenyan Competency-Based Curriculum',
          'Use "IGCSE" for International General Certificate of Secondary Education',
          'Use "Standard" for traditional curriculum'
        ]
      };
    }

    // Normalize to uppercase for consistency
    const dbCurriculumType = curriculumValue.toUpperCase();
    
    // Update the database with normalized value if different
    if (dbCurriculumType !== curriculumValue) {
      const { error: updateError } = await supabase
        .from('classes')
        .update({ 
          curriculum_type: dbCurriculumType,
          curriculum: dbCurriculumType 
        })
        .eq('id', classId);

      if (updateError) {
        console.warn('Failed to normalize curriculum type:', updateError);
      }
    }

    return {
      isValid: true,
      curriculumType: dbCurriculumType,
      message: `Valid curriculum type: ${dbCurriculumType}`
    };

  } catch (error) {
    console.error('Curriculum validation error:', error);
    return {
      isValid: false,
      curriculumType: 'unknown',
      message: 'Unexpected error during curriculum validation',
      suggestions: ['Check console for detailed error information']
    };
  }
}

/**
 * Gets curriculum type for a class
 * @param classId - The class ID
 * @returns Promise<string> - The curriculum type
 */
export async function getClassCurriculumType(classId: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('curriculum_type, curriculum')
      .eq('id', classId)
      .single();

    if (error || !data) {
      return 'Standard'; // Default fallback
    }

    return (data.curriculum_type || data.curriculum || 'Standard').toUpperCase();
  } catch (error) {
    console.error('Error getting class curriculum type:', error);
    return 'Standard'; // Default fallback
  }
}

/**
 * Validates if a curriculum type is supported
 * @param curriculumType - The curriculum type to validate
 * @returns boolean
 */
export function isSupportedCurriculum(curriculumType: string): boolean {
  const supported = ['CBC', 'IGCSE', 'STANDARD', 'cbc', 'igcse', 'standard'];
  return supported.includes(curriculumType);
}

/**
 * Validates if a class has proper curriculum setup
 * @param classId - The class ID to validate
 * @param supabase - Supabase client instance
 * @returns Promise with validation result
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