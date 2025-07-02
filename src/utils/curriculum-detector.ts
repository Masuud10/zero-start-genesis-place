
export const detectCurriculumType = (curriculumValue: string | undefined | null): string => {
  if (!curriculumValue) return 'standard';
  
  const normalized = curriculumValue.toString().toLowerCase().trim();
  
  switch (normalized) {
    case 'cbc':
    case 'competency_based':
    case 'competency-based':
    case 'competency based':
      return 'cbc'; // Keep lowercase to match database
    case 'igcse':
    case 'cambridge':
    case 'cambridge igcse':
      return 'igcse'; // Keep lowercase to match database
    default:
      return 'standard';
  }
};

export const getCurriculumDisplayName = (curriculumType: string): string => {
  const normalized = curriculumType?.toLowerCase() || '';
  switch (normalized) {
    case 'cbc':
      return 'CBC (Competency-Based Curriculum)';
    case 'igcse':
      return 'IGCSE (International General Certificate)';
    default:
      return 'Standard Curriculum';
  }
};

export const getCurriculumBadgeColor = (curriculumType: string): string => {
  const normalized = curriculumType?.toLowerCase() || '';
  switch (normalized) {
    case 'cbc':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'igcse':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-blue-100 text-blue-800 border-blue-200';
  }
};

export const isCBCCurriculum = (curriculumType: string | undefined | null): boolean => {
  return detectCurriculumType(curriculumType) === 'cbc';
};

export const isIGCSECurriculum = (curriculumType: string | undefined | null): boolean => {
  return detectCurriculumType(curriculumType) === 'igcse';
};
