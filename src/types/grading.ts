
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
