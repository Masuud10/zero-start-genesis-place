/**
 * Centralized Grade Calculation Utilities
 * This module fixes critical logical errors in grade calculations and ensures consistency
 */

export interface GradeCalculationParams {
  score: number | null;
  maxScore: number;
  curriculumType: 'standard' | 'cbc' | 'igcse';
  subjectId?: string;
  courseworkScore?: number;
  examScore?: number;
  courseworkWeight?: number;
  examWeight?: number;
}

export interface GradeCalculationResult {
  score: number | null;
  maxScore: number;
  percentage: number | null;
  letterGrade: string | null;
  cbcPerformanceLevel?: string;
  totalScore?: number;
  isValid: boolean;
  error?: string;
}

/**
 * Standard grade boundaries for consistent letter grade calculation
 */
export const STANDARD_GRADE_BOUNDARIES = {
  'A+': 90,
  'A': 80,
  'B+': 70,
  'B': 60,
  'C+': 50,
  'C': 40,
  'D+': 30,
  'D': 20,
  'E': 0
} as const;

/**
 * IGCSE grade boundaries
 */
export const IGCSE_GRADE_BOUNDARIES = {
  'A*': 90,
  'A': 80,
  'B': 70,
  'C': 60,
  'D': 50,
  'E': 40,
  'F': 30,
  'G': 20,
  'U': 0
} as const;

/**
 * CBC performance levels
 */
export const CBC_PERFORMANCE_LEVELS = {
  'EE': { min: 80, max: 100, description: 'Exceeding Expectations' },
  'ME': { min: 60, max: 79, description: 'Meeting Expectations' },
  'AE': { min: 40, max: 59, description: 'Approaching Expectations' },
  'BE': { min: 0, max: 39, description: 'Below Expectations' }
} as const;

/**
 * Calculate percentage from score and max score
 * FIXED: Ensures proper percentage calculation with validation
 */
export function calculatePercentage(score: number | null, maxScore: number): number | null {
  if (score === null || score === undefined || maxScore <= 0) {
    return null;
  }
  
  // Validate score is within valid range
  if (score < 0 || score > maxScore) {
    return null;
  }
  
  // Calculate percentage and round to 2 decimal places
  const percentage = (score / maxScore) * 100;
  return Math.round(percentage * 100) / 100;
}

/**
 * Calculate letter grade from percentage for standard curriculum
 * FIXED: Uses consistent grade boundaries and proper validation
 */
export function calculateLetterGrade(percentage: number | null, curriculumType: 'standard' | 'igcse' = 'standard'): string | null {
  if (percentage === null || percentage === undefined || percentage < 0 || percentage > 100) {
    return null;
  }
  
  const boundaries = curriculumType === 'igcse' ? IGCSE_GRADE_BOUNDARIES : STANDARD_GRADE_BOUNDARIES;
  
  // Sort boundaries by score descending to find the highest applicable grade
  const sortedBoundaries = Object.entries(boundaries)
    .sort(([, a], [, b]) => b - a);
  
  for (const [grade, minScore] of sortedBoundaries) {
    if (percentage >= minScore) {
      return grade;
    }
  }
  
  return 'E'; // Default fallback
}

/**
 * Calculate CBC performance level from marks
 * FIXED: Uses proper boundaries and validation
 */
export function calculateCBCPerformanceLevel(marks: number): string {
  if (marks < 0 || marks > 100) {
    return 'BE'; // Default for invalid marks
  }
  
  for (const [level, range] of Object.entries(CBC_PERFORMANCE_LEVELS)) {
    if (marks >= range.min && marks <= range.max) {
      return level;
    }
  }
  
  return 'BE'; // Default fallback
}

/**
 * Calculate IGCSE grade from coursework and exam scores
 * FIXED: Proper weighted calculation with validation
 */
export function calculateIGCSEGrade(
  courseworkScore: number | null,
  examScore: number | null,
  courseworkWeight: number = 30,
  examWeight: number = 70
): GradeCalculationResult {
  // Validate inputs
  if (courseworkScore === null || examScore === null) {
    return {
      score: null,
      maxScore: 100,
      percentage: null,
      letterGrade: null,
      isValid: false,
      error: 'Both coursework and exam scores are required'
    };
  }
  
  if (courseworkScore < 0 || courseworkScore > 100 || examScore < 0 || examScore > 100) {
    return {
      score: null,
      maxScore: 100,
      percentage: null,
      letterGrade: null,
      isValid: false,
      error: 'Scores must be between 0 and 100'
    };
  }
  
  if (courseworkWeight + examWeight !== 100) {
    return {
      score: null,
      maxScore: 100,
      percentage: null,
      letterGrade: null,
      isValid: false,
      error: 'Coursework and exam weights must sum to 100'
    };
  }
  
  // Calculate weighted total score
  const totalScore = (courseworkScore * courseworkWeight / 100) + (examScore * examWeight / 100);
  const percentage = Math.round(totalScore * 100) / 100;
  const letterGrade = calculateLetterGrade(percentage, 'igcse');
  
  return {
    score: totalScore,
    maxScore: 100,
    percentage,
    letterGrade,
    totalScore,
    isValid: true
  };
}

/**
 * Calculate standard grade with comprehensive validation
 * FIXED: Centralized calculation with proper error handling
 */
export function calculateStandardGrade(
  score: number | null,
  maxScore: number = 100
): GradeCalculationResult {
  // Validate inputs
  if (score === null || score === undefined) {
    return {
      score: null,
      maxScore,
      percentage: null,
      letterGrade: null,
      isValid: false,
      error: 'Score is required'
    };
  }
  
  if (score < 0 || score > maxScore) {
    return {
      score: null,
      maxScore,
      percentage: null,
      letterGrade: null,
      isValid: false,
      error: `Score must be between 0 and ${maxScore}`
    };
  }
  
  if (maxScore <= 0) {
    return {
      score: null,
      maxScore,
      percentage: null,
      letterGrade: null,
      isValid: false,
      error: 'Maximum score must be greater than 0'
    };
  }
  
  // Calculate percentage and letter grade
  const percentage = calculatePercentage(score, maxScore);
  const letterGrade = calculateLetterGrade(percentage, 'standard');
  
  return {
    score,
    maxScore,
    percentage,
    letterGrade,
    isValid: true
  };
}

/**
 * Calculate CBC grade from marks
 * FIXED: Proper CBC calculation with performance level
 */
export function calculateCBCGrade(marks: number): GradeCalculationResult {
  if (marks < 0 || marks > 100) {
    return {
      score: null,
      maxScore: 100,
      percentage: null,
      letterGrade: null,
      cbcPerformanceLevel: 'BE',
      isValid: false,
      error: 'Marks must be between 0 and 100'
    };
  }
  
  const percentage = Math.round(marks * 100) / 100;
  const performanceLevel = calculateCBCPerformanceLevel(marks);
  
  return {
    score: marks,
    maxScore: 100,
    percentage,
    letterGrade: null, // CBC doesn't use letter grades
    cbcPerformanceLevel: performanceLevel,
    isValid: true
  };
}

/**
 * Universal grade calculation function
 * FIXED: Routes to appropriate calculation based on curriculum type
 */
export function calculateGrade(params: GradeCalculationParams): GradeCalculationResult {
  const { curriculumType, score, maxScore } = params;
  
  switch (curriculumType) {
    case 'standard':
      return calculateStandardGrade(score, maxScore);
      
    case 'cbc':
      if (score === null) {
        return {
          score: null,
          maxScore,
          percentage: null,
          letterGrade: null,
          isValid: false,
          error: 'Score is required for CBC grading'
        };
      }
      return calculateCBCGrade(score);
      
    case 'igcse': {
      const { courseworkScore, examScore, courseworkWeight = 30, examWeight = 70 } = params;
      return calculateIGCSEGrade(courseworkScore || null, examScore || null, courseworkWeight, examWeight);
    }
      
    default:
      return {
        score: null,
        maxScore,
        percentage: null,
        letterGrade: null,
        isValid: false,
        error: `Unsupported curriculum type: ${curriculumType}`
      };
  }
}

/**
 * Calculate class average from grades
 * FIXED: Proper average calculation with validation
 */
export function calculateClassAverage(grades: Array<{ percentage?: number | null; score?: number | null; maxScore?: number | null }>): number {
  const validGrades = grades.filter(grade => {
    if (grade.percentage !== null && grade.percentage !== undefined && !isNaN(grade.percentage)) {
      return true;
    }
    if (grade.score !== null && grade.score !== undefined && grade.maxScore && grade.maxScore > 0) {
      return true;
    }
    return false;
  });
  
  if (validGrades.length === 0) {
    return 0;
  }
  
  const totalPercentage = validGrades.reduce((sum, grade) => {
    if (grade.percentage !== null && grade.percentage !== undefined) {
      return sum + grade.percentage;
    }
    if (grade.score && grade.maxScore) {
      return sum + (grade.score / grade.maxScore) * 100;
    }
    return sum;
  }, 0);
  
  return Math.round((totalPercentage / validGrades.length) * 100) / 100;
}

/**
 * Calculate pass rate from grades
 * FIXED: Proper pass rate calculation with configurable passing threshold
 */
export function calculatePassRate(
  grades: Array<{ percentage?: number | null; letterGrade?: string | null }>,
  passingThreshold: number = 50,
  passingGrades: string[] = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-']
): number {
  const validGrades = grades.filter(grade => 
    grade.percentage !== null && grade.percentage !== undefined && !isNaN(grade.percentage)
  );
  
  if (validGrades.length === 0) {
    return 0;
  }
  
  const passingCount = validGrades.filter(grade => {
    if (grade.percentage !== null && grade.percentage >= passingThreshold) {
      return true;
    }
    if (grade.letterGrade && passingGrades.includes(grade.letterGrade)) {
      return true;
    }
    return false;
  }).length;
  
  return Math.round((passingCount / validGrades.length) * 100);
}

/**
 * Validate grade data for consistency
 * FIXED: Comprehensive validation to prevent data corruption
 */
export function validateGradeData(grade: {
  score?: number | null;
  maxScore?: number | null;
  percentage?: number | null;
  letterGrade?: string | null;
  curriculumType?: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate score
  if (grade.score !== null && grade.score !== undefined) {
    if (isNaN(grade.score) || grade.score < 0) {
      errors.push('Score must be a non-negative number');
    }
    if (grade.maxScore && grade.score > grade.maxScore) {
      errors.push('Score cannot exceed maximum score');
    }
  }
  
  // Validate max score
  if (grade.maxScore !== null && grade.maxScore !== undefined) {
    if (isNaN(grade.maxScore) || grade.maxScore <= 0) {
      errors.push('Maximum score must be a positive number');
    }
  }
  
  // Validate percentage
  if (grade.percentage !== null && grade.percentage !== undefined) {
    if (isNaN(grade.percentage) || grade.percentage < 0 || grade.percentage > 100) {
      errors.push('Percentage must be between 0 and 100');
    }
  }
  
  // Validate letter grade format
  if (grade.letterGrade) {
    const validGrades = [...Object.keys(STANDARD_GRADE_BOUNDARIES), ...Object.keys(IGCSE_GRADE_BOUNDARIES)];
    if (!validGrades.includes(grade.letterGrade)) {
      errors.push(`Invalid letter grade: ${grade.letterGrade}`);
    }
  }
  
  // Validate curriculum type
  if (grade.curriculumType && !['standard', 'cbc', 'igcse'].includes(grade.curriculumType)) {
    errors.push(`Invalid curriculum type: ${grade.curriculumType}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get grade statistics for a set of grades
 * FIXED: Comprehensive statistics calculation
 */
export function calculateGradeStatistics(grades: Array<{ percentage?: number | null; score?: number | null; maxScore?: number | null }>) {
  const validGrades = grades.filter(grade => {
    if (grade.percentage !== null && grade.percentage !== undefined && !isNaN(grade.percentage)) {
      return true;
    }
    if (grade.score !== null && grade.score !== undefined && grade.maxScore && grade.maxScore > 0) {
      return true;
    }
    return false;
  });
  
  if (validGrades.length === 0) {
    return {
      count: 0,
      average: 0,
      highest: 0,
      lowest: 0,
      passRate: 0
    };
  }
  
  const percentages = validGrades.map(grade => {
    if (grade.percentage !== null && grade.percentage !== undefined) {
      return grade.percentage;
    }
    if (grade.score && grade.maxScore) {
      return (grade.score / grade.maxScore) * 100;
    }
    return 0;
  });
  
  const average = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
  const highest = Math.max(...percentages);
  const lowest = Math.min(...percentages);
  const passRate = (percentages.filter(p => p >= 50).length / percentages.length) * 100;
  
  return {
    count: validGrades.length,
    average: Math.round(average * 100) / 100,
    highest: Math.round(highest * 100) / 100,
    lowest: Math.round(lowest * 100) / 100,
    passRate: Math.round(passRate * 100) / 100
  };
} 