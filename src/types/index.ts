
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'parent';
  avatar?: string;
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  parentId?: string;
  rollNumber: string;
  avatar?: string;
}

export interface Class {
  id: string;
  name: string;
  teacherId: string;
  students: Student[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  teacher: string;
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  classId: string;
  score: number;
  maxScore: number;
  term: string;
  submittedBy: string;
  submittedAt: Date;
  isReleased: boolean;
  overrideHistory?: GradeOverride[];
}

export interface GradeOverride {
  id: string;
  originalScore: number;
  newScore: number;
  reason: string;
  requestedBy: string;
  approvedBy?: string;
  requestedAt: Date;
  approvedAt?: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: Date;
  status: 'present' | 'absent' | 'late';
  session: 'morning' | 'afternoon' | 'full-day';
  remarks?: string;
  submittedBy: string;
  submittedAt: Date;
}

export interface AttendanceStats {
  studentId: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendanceRate: number;
}
