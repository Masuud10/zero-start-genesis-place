
export const detectCurriculumType = (curriculumValue: string | undefined | null): string => {
  if (!curriculumValue) return 'standard';
  
  const normalized = curriculumValue.toString().toUpperCase();
  
  switch (normalized) {
    case 'CBC':
    case 'COMPETENCY_BASED':
    case 'COMPETENCY-BASED':
      return 'CBC';
    case 'IGCSE':
    case 'CAMBRIDGE':
      return 'IGCSE';
    default:
      return 'standard';
  }
};

export const getCurriculumDisplayName = (curriculumType: string): string => {
  switch (curriculumType) {
    case 'CBC':
      return 'CBC (Competency-Based Curriculum)';
    case 'IGCSE':
      return 'IGCSE (International General Certificate)';
    default:
      return 'Standard Curriculum';
  }
};

export const getCurriculumBadgeColor = (curriculumType: string): string => {
  switch (curriculumType) {
    case 'CBC':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'IGCSE':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-blue-100 text-blue-800 border-blue-200';
  }
};

export const isCBCCurriculum = (curriculumType: string | undefined | null): boolean => {
  return detectCurriculumType(curriculumType) === 'CBC';
};

export const isIGCSECurriculum = (curriculumType: string | undefined | null): boolean => {
  return detectCurriculumType(curriculumType) === 'IGCSE';
};
