
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
