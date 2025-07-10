// CBC (Competency-Based Curriculum) Types
// Comprehensive type definitions for the CBC grading system

export interface CBCStrand {
  id: string;
  school_id: string;
  subject_id: string;
  class_id: string;
  strand_name: string;
  strand_code: string;
  description?: string;
  grade_level: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CBCSubStrand {
  id: string;
  school_id: string;
  strand_id: string;
  sub_strand_name: string;
  sub_strand_code: string;
  description?: string;
  learning_outcomes: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CBCLearningOutcome {
  id: string;
  school_id: string;
  sub_strand_id: string;
  outcome_code: string;
  outcome_description: string;
  outcome_type: 'knowledge' | 'skill' | 'attitude' | 'value';
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CBCAssessmentType {
  id: string;
  school_id: string;
  assessment_type_name: string;
  assessment_type_code: string;
  description?: string;
  is_formative: boolean;
  is_summative: boolean;
  weighting_percentage: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CBCAssessment {
  id: string;
  school_id: string;
  class_id: string;
  subject_id: string;
  strand_id: string;
  sub_strand_id?: string;
  assessment_type_id: string;
  assessment_title: string;
  assessment_description?: string;
  assessment_date: string;
  term: string;
  academic_year: string;
  created_by: string;
  is_template: boolean;
  template_name?: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  created_at?: string;
  updated_at?: string;
}

export interface CBCStudentAssessment {
  id: string;
  school_id: string;
  student_id: string;
  class_id: string;
  subject_id: string;
  assessment_id: string;
  strand_id: string;
  sub_strand_id?: string;
  learning_outcome_id?: string;
  assessment_type_id: string;
  performance_level: 'EM' | 'AP' | 'PR' | 'AD';
  teacher_remarks?: string;
  evidence_description?: string;
  areas_of_strength?: string[];
  areas_for_improvement?: string[];
  next_steps?: string;
  assessed_by: string;
  assessment_date: string;
  term: string;
  academic_year: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'released';
  submitted_at?: string;
  approved_by?: string;
  approved_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CBCPerformanceLevel {
  id: string;
  school_id: string;
  level_code: 'EM' | 'AP' | 'PR' | 'AD';
  level_name: string;
  level_description: string;
  color_code: string;
  is_default: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CBCTermSummary {
  id: string;
  school_id: string;
  student_id: string;
  class_id: string;
  subject_id: string;
  term: string;
  academic_year: string;
  overall_performance_level?: 'EM' | 'AP' | 'PR' | 'AD';
  strand_performances: Record<string, string>;
  teacher_general_remarks?: string;
  areas_of_strength?: string[];
  areas_for_improvement?: string[];
  next_steps?: string;
  attendance_percentage: number;
  created_by: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'released';
  submitted_at?: string;
  approved_by?: string;
  approved_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CBCAssessmentTemplate {
  id: string;
  school_id: string;
  template_name: string;
  template_description?: string;
  subject_id?: string;
  class_id?: string;
  strand_id?: string;
  assessment_type_id: string;
  template_data: Record<string, any>;
  is_public: boolean;
  created_by: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Extended interfaces with related data
export interface CBCStrandWithSubStrands extends CBCStrand {
  sub_strands: CBCSubStrand[];
}

export interface CBCSubStrandWithOutcomes extends CBCSubStrand {
  learning_outcomes: CBCLearningOutcome[];
}

export interface CBCAssessmentWithDetails extends CBCAssessment {
  strand: CBCStrand;
  sub_strand?: CBCSubStrand;
  assessment_type: CBCAssessmentType;
  created_by_user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export interface CBCStudentAssessmentWithDetails extends CBCStudentAssessment {
  strand: CBCStrand;
  sub_strand?: CBCSubStrand;
  learning_outcome?: CBCLearningOutcome;
  assessment_type: CBCAssessmentType;
  assessment: CBCAssessment;
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    admission_number: string;
  };
  assessed_by_user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

// Form interfaces for creating/editing
export interface CBCStrandFormData {
  strand_name: string;
  strand_code: string;
  description?: string;
  grade_level: string;
}

export interface CBCSubStrandFormData {
  sub_strand_name: string;
  sub_strand_code: string;
  description?: string;
  learning_outcomes: string[];
}

export interface CBCLearningOutcomeFormData {
  outcome_code: string;
  outcome_description: string;
  outcome_type: 'knowledge' | 'skill' | 'attitude' | 'value';
}

export interface CBCAssessmentFormData {
  assessment_title: string;
  assessment_description?: string;
  strand_id: string;
  sub_strand_id?: string;
  assessment_type_id: string;
  assessment_date: string;
  term: string;
  academic_year: string;
  is_template: boolean;
  template_name?: string;
}

export interface CBCStudentAssessmentFormData {
  performance_level: 'EM' | 'AP' | 'PR' | 'AD';
  teacher_remarks?: string;
  evidence_description?: string;
  areas_of_strength?: string[];
  areas_for_improvement?: string[];
  next_steps?: string;
  assessment_date: string;
}

export interface CBCTermSummaryFormData {
  overall_performance_level?: 'EM' | 'AP' | 'PR' | 'AD';
  strand_performances: Record<string, string>;
  teacher_general_remarks?: string;
  areas_of_strength?: string[];
  areas_for_improvement?: string[];
  next_steps?: string;
  attendance_percentage: number;
}

// Grading interface types
export interface CBCGradeValue {
  performance_level: 'EM' | 'AP' | 'PR' | 'AD';
  marks?: number;
  strand_scores: Record<string, string>;
  sub_strand_scores: Record<string, string>;
  learning_outcome_scores: Record<string, string>;
  teacher_remarks?: string;
  evidence_description?: string;
  areas_of_strength?: string[];
  areas_for_improvement?: string[];
  next_steps?: string;
  assessment_type?: string;
}

export interface CBCGradingData {
  student_id: string;
  subject_id: string;
  class_id: string;
  term: string;
  academic_year: string;
  assessment_id: string;
  strand_id: string;
  sub_strand_id?: string;
  learning_outcome_id?: string;
  assessment_type_id: string;
  performance_level: 'EM' | 'AP' | 'PR' | 'AD';
  teacher_remarks?: string;
  evidence_description?: string;
  areas_of_strength?: string[];
  areas_for_improvement?: string[];
  next_steps?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'released';
}

// Analytics and reporting types
export interface CBCPerformanceAnalytics {
  total_assessments: number;
  performance_distribution: {
    EM: number;
    AP: number;
    PR: number;
    AD: number;
  };
  strand_performance: Record<string, {
    EM: number;
    AP: number;
    PR: number;
    AD: number;
    average: number;
  }>;
  assessment_type_distribution: Record<string, number>;
  progress_over_time: Array<{
    date: string;
    average_performance: number;
    total_assessments: number;
  }>;
}

export interface CBCReportCardData {
  student_id: string;
  student_name: string;
  class_name: string;
  term: string;
  academic_year: string;
  subjects: Array<{
    subject_name: string;
    overall_performance: 'EM' | 'AP' | 'PR' | 'AD';
    strand_performances: Record<string, string>;
    teacher_remarks?: string;
    areas_of_strength?: string[];
    areas_for_improvement?: string[];
    next_steps?: string;
  }>;
  attendance_percentage: number;
  general_remarks?: string;
  principal_remarks?: string;
  report_date: string;
}

// Constants
export const CBC_PERFORMANCE_LEVELS: CBCPerformanceLevel[] = [
  {
    id: '1',
    school_id: 'default',
    level_code: 'EM',
    level_name: 'Emerging',
    level_description: 'Beginning to show understanding and skills',
    color_code: '#EF4444',
    is_default: true,
    is_active: true,
  },
  {
    id: '2',
    school_id: 'default',
    level_code: 'AP',
    level_name: 'Approaching Proficiency',
    level_description: 'Shows developing understanding with support needed',
    color_code: '#F59E0B',
    is_default: true,
    is_active: true,
  },
  {
    id: '3',
    school_id: 'default',
    level_code: 'PR',
    level_name: 'Proficient',
    level_description: 'Demonstrates good understanding and application',
    color_code: '#3B82F6',
    is_default: true,
    is_active: true,
  },
  {
    id: '4',
    school_id: 'default',
    level_code: 'AD',
    level_name: 'Advanced',
    level_description: 'Consistently demonstrates exceptional understanding and skills',
    color_code: '#10B981',
    is_default: true,
    is_active: true,
  },
];

export const DEFAULT_CBC_ASSESSMENT_TYPES: CBCAssessmentType[] = [
  {
    id: '1',
    school_id: 'default',
    assessment_type_name: 'Observations',
    assessment_type_code: 'OBS',
    description: 'Teacher observations of student performance',
    is_formative: true,
    is_summative: false,
    weighting_percentage: 20,
    is_active: true,
  },
  {
    id: '2',
    school_id: 'default',
    assessment_type_name: 'Projects',
    assessment_type_code: 'PROJ',
    description: 'Project-based assessments',
    is_formative: true,
    is_summative: false,
    weighting_percentage: 25,
    is_active: true,
  },
  {
    id: '3',
    school_id: 'default',
    assessment_type_name: 'Oral Questions',
    assessment_type_code: 'ORAL',
    description: 'Oral questioning and discussions',
    is_formative: true,
    is_summative: false,
    weighting_percentage: 15,
    is_active: true,
  },
  {
    id: '4',
    school_id: 'default',
    assessment_type_name: 'Assignments',
    assessment_type_code: 'ASSIGN',
    description: 'Written assignments and tasks',
    is_formative: true,
    is_summative: false,
    weighting_percentage: 20,
    is_active: true,
  },
  {
    id: '5',
    school_id: 'default',
    assessment_type_name: 'Quizzes',
    assessment_type_code: 'QUIZ',
    description: 'Short quizzes and tests',
    is_formative: true,
    is_summative: false,
    weighting_percentage: 10,
    is_active: true,
  },
  {
    id: '6',
    school_id: 'default',
    assessment_type_name: 'Practical Work',
    assessment_type_code: 'PRAC',
    description: 'Hands-on practical activities',
    is_formative: true,
    is_summative: false,
    weighting_percentage: 10,
    is_active: true,
  },
  {
    id: '7',
    school_id: 'default',
    assessment_type_name: 'Summative Assessment',
    assessment_type_code: 'SUMM',
    description: 'End of term comprehensive assessment',
    is_formative: false,
    is_summative: true,
    weighting_percentage: 100,
    is_active: true,
  },
];

// Default CBC strands for different subjects
export const DEFAULT_CBC_STRANDS: Record<string, string[]> = {
  Mathematics: [
    'Number and Place Value',
    'Addition and Subtraction',
    'Multiplication and Division',
    'Fractions',
    'Geometry',
    'Measurement',
    'Statistics',
  ],
  English: [
    'Reading',
    'Writing',
    'Speaking and Listening',
    'Grammar and Vocabulary',
    'Comprehension',
    'Creative Writing',
    'Literature',
  ],
  Kiswahili: [
    'Kusoma',
    'Kuandika',
    'Kuzungumza na Kusikiliza',
    'Sarufi na Msamiati',
    'Ufahamu',
    'Uandishi wa Kibunifu',
    'Fasihi',
  ],
  Science: [
    'Scientific Inquiry',
    'Life Processes',
    'Materials and their Properties',
    'Physical Processes',
    'Earth and Space',
    'Working Scientifically',
  ],
  'Social Studies': [
    'Citizenship',
    'History',
    'Geography',
    'Economics',
    'Environmental Awareness',
    'Cultural Understanding',
  ],
  default: [
    'Communication',
    'Problem Solving',
    'Application',
    'Understanding',
    'Creativity',
    'Collaboration',
    'Critical Thinking',
  ],
}; 