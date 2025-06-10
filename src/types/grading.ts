
export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  classId: string;
  score: number;
  maxScore: number;
  term: string;
  examType: 'CAT' | 'MID_TERM' | 'END_TERM' | 'FINAL';
  submittedBy: string;
  submittedAt: Date;
  isReleased: boolean;
  isImmutable: boolean; // New field to track if grade can be edited
  position?: number; // Class position for this grade
  percentage: number; // Calculated percentage
  overrideHistory?: GradeOverride[];
}

export interface GradeOverride {
  id: string;
  gradeId: string;
  originalScore: number;
  newScore: number;
  reason: string;
  requestedBy: string;
  approvedBy?: string;
  requestedAt: Date;
  approvedAt?: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface BulkGradeUpload {
  id: string;
  classId: string;
  subjectId: string;
  term: string;
  examType: 'CAT' | 'MID_TERM' | 'END_TERM' | 'FINAL';
  uploadedBy: string;
  uploadedAt: Date;
  grades: Grade[];
  status: 'draft' | 'submitted' | 'approved';
  totalStudents: number;
  gradesEntered: number;
}

export interface GradingSession {
  id: string;
  classId: string;
  subjectId: string;
  term: string;
  examType: 'CAT' | 'MID_TERM' | 'END_TERM' | 'FINAL';
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
