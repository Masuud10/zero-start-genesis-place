
export interface AnalyticsMetrics {
  academicPerformance: AcademicMetrics;
  attendance: AttendanceMetrics;
  financial: FinancialMetrics;
  compliance: ComplianceMetrics;
}

export interface AcademicMetrics {
  totalStudents: number;
  averageGrade: number;
  passRate: number;
  gradeDistribution: GradeDistribution[];
  subjectPerformance: SubjectPerformance[];
  classRankings: ClassRanking[];
  termComparison: TermComparison[];
}

export interface AttendanceMetrics {
  overallRate: number;
  dailyTrends: DailyTrend[];
  classAttendance: ClassAttendance[];
  absenteeismAlerts: AbsenteeismAlert[];
}

export interface FinancialMetrics {
  totalCollected: number;
  totalExpected: number;
  collectionRate: number;
  defaulters: number;
  mpesaTransactions: number;
  expenseBreakdown: ExpenseCategory[];
}

export interface ComplianceMetrics {
  missingGrades: number;
  lateSubmissions: number;
  attendanceIssues: number;
  pendingApprovals: number;
}

export interface GradeDistribution {
  grade: string;
  count: number;
  percentage: number;
}

export interface SubjectPerformance {
  subjectName: string;
  averageScore: number;
  totalStudents: number;
  passRate: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ClassRanking {
  className: string;
  averageScore: number;
  totalStudents: number;
  rank: number;
}

export interface TermComparison {
  term: string;
  averageScore: number;
  attendanceRate: number;
  improvement: number;
}

export interface DailyTrend {
  date: string;
  attendanceRate: number;
  presentCount: number;
  totalCount: number;
}

export interface ClassAttendance {
  className: string;
  attendanceRate: number;
  presentToday: number;
  totalStudents: number;
}

export interface AbsenteeismAlert {
  studentId: string;
  studentName: string;
  consecutiveDays: number;
  lastAttendance: string;
}

export interface ExpenseCategory {
  category: string;
  amount: number;
  percentage: number;
}

export interface ReportConfig {
  type: 'academic' | 'attendance' | 'financial' | 'comprehensive';
  filters: ReportFilters;
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
}

export interface ReportFilters {
  term?: string;
  class?: string;
  subject?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}
