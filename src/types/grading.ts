
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
