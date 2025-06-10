
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'school_owner' | 'principal' | 'teacher' | 'parent' | 'finance_officer' | 'edufam_admin' | 'elimisha_admin';
  avatar?: string;
  schoolId?: string;
  isFirstLogin?: boolean;
  emailVerified?: boolean;
}

export type UserRole = 'school_owner' | 'principal' | 'teacher' | 'parent' | 'finance_officer' | 'edufam_admin' | 'elimisha_admin';

export interface School {
  id: string;
  name: string;
  ownerId: string;
  principalId: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  settings: SchoolSettings;
}

export interface SchoolSettings {
  academicYear: string;
  terms: Term[];
  gradeReleaseEnabled: boolean;
  attendanceEnabled: boolean;
}

export interface Term {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  parentId?: string;
  rollNumber: string;
  avatar?: string;
  admissionNumber: string;
  dateOfBirth: Date;
  gender: 'male' | 'female';
  address: string;
  parentContact: string;
  isActive: boolean;
  schoolId: string; // Required for multi-tenancy
}

export interface Class {
  id: string;
  name: string;
  teacherId: string;
  students: Student[];
  subjects: Subject[];
  schoolId: string; // Required for multi-tenancy
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  classId: string;
  schoolId: string; // Required for multi-tenancy
}

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

export interface Fee {
  id: string;
  studentId: string;
  amount: number;
  dueDate: Date;
  term: string;
  category: 'tuition' | 'transport' | 'meals' | 'activities' | 'other';
  status: 'pending' | 'paid' | 'overdue';
  paidAmount?: number;
  paidDate?: Date;
  paymentMethod?: 'mpesa' | 'cash' | 'bank';
  mpesaCode?: string;
}

export interface Expense {
  id: string;
  schoolId: string;
  category: string;
  amount: number;
  description: string;
  date: Date;
  approvedBy: string;
  receipt?: string;
  isRecurring: boolean;
  recurringPeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetAudience: 'all' | 'parents' | 'teachers' | 'students';
  createdBy: string;
  createdAt: Date;
  expiryDate?: Date;
  attachments?: string[];
  readBy: string[];
  schoolId?: string;
  isGlobal: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  attachments?: string[];
  conversationId: string;
}

export interface SupportTicket {
  id: string;
  schoolId: string;
  createdBy: string;
  title: string;
  description: string;
  type: 'technical' | 'feature_request' | 'billing' | 'feedback';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  resolvedAt?: Date;
  assignedTo?: string;
  attachments?: string[];
}

export interface Timetable {
  id: string;
  classId: string;
  schoolId: string;
  schedule: TimetableSlot[];
  version: number;
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
}

export interface TimetableSlot {
  id: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
  startTime: string;
  endTime: string;
  subjectId: string;
  teacherId: string;
  room?: string;
}

export interface AnalyticsData {
  totalStudents: number;
  totalTeachers: number;
  averageGrade: number;
  attendanceRate: number;
  feeCollectionRate: number;
  academicPerformance: PerformanceMetric[];
  financialSummary: FinancialMetric[];
}

export interface PerformanceMetric {
  subject: string;
  average: number;
  trend: 'up' | 'down' | 'stable';
  classPerformance: ClassPerformance[];
}

export interface ClassPerformance {
  className: string;
  average: number;
  totalStudents: number;
}

export interface FinancialMetric {
  category: string;
  collected: number;
  expected: number;
  percentage: number;
}
