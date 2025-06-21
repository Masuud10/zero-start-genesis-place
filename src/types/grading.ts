
export interface GradingSession {
  id: string;
  classId: string;
  subjectId: string;
  term: string;
  examType: 'OPENER' | 'MID_TERM' | 'END_TERM';
  maxScore: number;
  teacherId: string;
  createdAt: Date;
  isActive: boolean;
  students: GradingStudent[];
}

export interface GradingStudent {
  studentId: string;
  name: string;
  admissionNumber: string;
  rollNumber: string;
  currentScore?: number;
  percentage?: number;
  position?: number;
  isAbsent?: boolean;
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  classId: string;
  score?: number | null;
  maxScore?: number | null;
  letter_grade?: string | null;
  cbc_performance_level?: string | null;
  percentage?: number | null;
  position?: number;
  term: string;
  examType: string;
  submittedBy: string;
  submittedAt: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'released';
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
  isReleased: boolean;
  isImmutable: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Enhanced fields for advanced grading
  curriculum_type?: string;
  competency_id?: string;
  strand_scores?: Record<string, any>;
  coursework_score?: number | null;
  exam_score?: number | null;
  raw_score?: number | null;
  grade_boundary_applied?: boolean;
  competency_level?: string;
  submission_batch_id?: string;
  approval_workflow_stage?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'released' | 'published';
}

export interface BulkGradeSubmission {
  id: string;
  classId: string;
  subjectId: string;
  term: string;
  examType: string;
  totalStudents: number;
  gradesEntered: number;
  submittedBy: string;
  submittedAt: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'released';
  principalNotes?: string;
  releasedAt?: string;
}

export interface CBCCompetency {
  id: string;
  school_id: string;
  subject_id: string;
  class_id: string;
  competency_name: string;
  competency_code: string;
  description?: string;
  strands: any[];
  weighting: number;
  created_at: string;
  updated_at: string;
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
