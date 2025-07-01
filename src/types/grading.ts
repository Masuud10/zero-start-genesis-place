

export interface CBCCompetency {
  id: string;
  competency_name: string;
  competency_code: string;
  description?: string;
  strands: string[];
  sub_strands: string[];
  weighting: number;
  class_id?: string;
  subject_id?: string;
  school_id: string;
  assessment_types: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CBCPerformanceLevel {
  value: 'EX' | 'PR' | 'AP' | 'EM';
  label: string;
  description: string;
  color: string;
}

export interface CBCGradeData {
  student_id: string;
  subject_id: string;
  class_id: string;
  term: string;
  exam_type: string;
  performance_level: 'EX' | 'PR' | 'AP' | 'EM';
  strand_scores: Record<string, string>;
  teacher_remarks?: string;
  assessment_type?: string;
  curriculum_type: 'CBC';
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'released';
}

export interface StandardGradeData {
  student_id: string;
  subject_id: string;
  class_id: string;
  term: string;
  exam_type: string;
  score: number;
  max_score: number;
  percentage: number;
  letter_grade?: string;
  curriculum_type: 'standard' | 'IGCSE';
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'released';
}

export type GradeData = CBCGradeData | StandardGradeData;

// Additional missing types
export interface GradingSession {
  id: string;
  classId: string;
  subjectId: string;
  term: string;
  examType: string;
  maxScore: number;
  students: Array<{
    studentId: string;
    name: string;
    rollNumber: string;
    admissionNumber: string;
    currentScore?: number;
    isAbsent?: boolean;
  }>;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'released';
  submittedAt?: string;
  submittedBy?: string;
}

export interface Grade {
  id: string;
  student_id: string;
  subject_id: string;
  class_id: string;
  term: string;
  exam_type: string;
  score: number;
  maxScore: number;
  percentage: number;
  letter_grade?: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'released';
  submittedBy: string;
  submittedAt: string;
  curriculum_type?: string;
  comments?: string;
}

export interface BulkGradeSubmission {
  id: string;
  classId: string;
  subjectId: string;
  term: string;
  examType: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'released';
  submittedAt: string;
  submittedBy: string;
  totalStudents: number;
  gradesEntered: number;
  principalNotes?: string;
  releasedAt?: string;
}

export interface IGCSEGradeBoundaries {
  'A*': number;
  'A': number;
  'B': number;
  'C': number;
  'D': number;
  'E': number;
  'F': number;
  'G': number;
  'U': number;
}

export interface CBCStrandAssessment {
  id: string;
  school_id: string;
  student_id: string;
  subject_id: string;
  class_id: string;
  teacher_id: string;
  competency_id?: string;
  strand_name: string;
  sub_strand_name?: string;
  assessment_type: string;
  performance_level: 'EM' | 'AP' | 'PR' | 'EX';
  teacher_remarks?: string;
  term: string;
  academic_year: string;
  assessment_date?: string;
  created_at?: string;
  updated_at?: string;
}

