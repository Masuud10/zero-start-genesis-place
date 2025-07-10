export const detectCurriculumType = (curriculumValue: string | undefined | null): string => {
  if (!curriculumValue) {
    console.log('🎓 Curriculum detector: No value provided, defaulting to standard');
    return 'standard';
  }
  
  const normalized = curriculumValue.toString().toLowerCase().trim();
  
  console.log('🎓 Curriculum detector: Processing value:', { original: curriculumValue, normalized });
  
  switch (normalized) {
    case 'cbc':
    case 'competency_based':
    case 'competency-based':
    case 'competency based':
    case 'kenyan cbc':
    case 'kenya cbc':
      console.log('🎓 Curriculum detector: Detected CBC curriculum');
      return 'cbc';
    case 'igcse':
    case 'cambridge':
    case 'cambridge igcse':
    case 'international':
    case 'british':
      console.log('🎓 Curriculum detector: Detected IGCSE curriculum');
      return 'igcse';
    case 'standard':
    case 'traditional':
    case '8-4-4':
    case '844':
    case 'kenyan standard':
    case 'kenya standard':
      console.log('🎓 Curriculum detector: Detected Standard curriculum');
      return 'standard';
    default:
      console.warn(`⚠️ Curriculum detector: Unrecognized curriculum type: ${curriculumValue}, defaulting to standard`);
      return 'standard';
  }
};

export const getCurriculumDisplayName = (curriculumType: string): string => {
  switch (curriculumType?.toLowerCase()) {
    case "cbc":
      return "CBC Curriculum";
    case "igcse":
      return "IGCSE Curriculum";
    case "standard":
      return "Standard Curriculum";
    default:
      return "Standard Curriculum";
  }
};

export const getCurriculumBadgeColor = (curriculumType: string): string => {
  switch (curriculumType?.toLowerCase()) {
    case "cbc":
      return "bg-green-100 text-green-800 border-green-200";
    case "igcse":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "standard":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const getCurriculumInfo = (curriculumType: string) => {
  const normalized = curriculumType?.toLowerCase() || '';
  switch (normalized) {
    case 'cbc':
      return {
        displayName: 'CBC (Competency-Based Curriculum)',
        badgeColor: 'bg-green-100 text-green-800 border-green-200',
        description: 'Kenyan Competency-Based Curriculum with performance levels',
        gradingSystem: 'performance_levels',
        levels: ['EM', 'AP', 'PR', 'EX'],
        assessmentTypes: ['observation', 'written_work', 'project_work', 'group_activity', 'oral_assessment', 'practical_work']
      };
    case 'igcse':
      return {
        displayName: 'IGCSE (International General Certificate)',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
        description: 'International General Certificate of Secondary Education',
        gradingSystem: 'letter_grades',
        levels: ['A*', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'U'],
        assessmentTypes: ['theory', 'practical', 'coursework', 'exam']
      };
    default:
      return {
        displayName: 'Standard Curriculum',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
        description: 'Traditional numeric grading system',
        gradingSystem: 'numeric',
        levels: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'E'],
        assessmentTypes: ['OPENER', 'MID_TERM', 'END_TERM', 'CAT', 'ASSIGNMENT', 'PROJECT', 'EXAM']
      };
  }
};

export const isCBCCurriculum = (curriculumType: string | undefined | null): boolean => {
  return detectCurriculumType(curriculumType) === 'cbc';
};

export const isIGCSECurriculum = (curriculumType: string | undefined | null): boolean => {
  return detectCurriculumType(curriculumType) === 'igcse';
};

export const isStandardCurriculum = (curriculumType: string | undefined | null): boolean => {
  return detectCurriculumType(curriculumType) === 'standard';
};

export const validateCurriculumType = (curriculumValue: string | null | undefined): {
  isValid: boolean;
  curriculumType: string;
  error?: string;
  suggestions?: string[];
} => {
  if (!curriculumValue) {
    return {
      isValid: false,
      curriculumType: 'standard',
      error: 'No curriculum type assigned',
      suggestions: [
        'Assign a curriculum type to the class',
        'Valid options: CBC, IGCSE, or Standard',
        'Contact your administrator for assistance'
      ]
    };
  }

  const detectedType = detectCurriculumType(curriculumValue);
  const normalized = curriculumValue.toString().toLowerCase().trim();
  
  if (detectedType === 'standard' && !['standard', 'traditional', '8-4-4', '844', 'kenyan standard', 'kenya standard'].includes(normalized)) {
    return {
      isValid: false,
      curriculumType: 'standard',
      error: `Unrecognized curriculum type: ${curriculumValue}`,
      suggestions: [
        'Valid curriculum types: CBC, IGCSE, Standard',
        'CBC: Competency-Based Curriculum (Kenyan)',
        'IGCSE: International General Certificate of Secondary Education',
        'Standard: Traditional numeric grading (0-100)',
        'Please update the class details with a valid curriculum type'
      ]
    };
  }

  return {
    isValid: true,
    curriculumType: detectedType
  };
};
