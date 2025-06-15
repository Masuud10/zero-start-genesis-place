
export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  session: 'morning' | 'afternoon' | 'full-day';
  remarks?: string;
  submittedBy: string;
  submittedAt: Date;
  updatedBy?: string;
  updatedAt?: Date;
}

export interface AttendanceStats {
  studentId: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendanceRate: number;
  morningAttendanceRate: number;
  afternoonAttendanceRate: number;
}

export interface BulkAttendanceEntry {
  studentId: string;
  name: string;
  admissionNumber: string;
  morningStatus: 'present' | 'absent' | 'late' | 'excused';
  afternoonStatus: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}

export interface AttendanceSession {
  id: string;
  classId: string;
  date: string;
  session: 'morning' | 'afternoon' | 'full-day';
  submittedBy: string;
  submittedAt: Date;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  entries: BulkAttendanceEntry[];
}
