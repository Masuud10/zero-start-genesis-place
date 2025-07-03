export interface ReportData {
  id: string;
  title: string;
  generatedAt: string;
  schoolInfo: SchoolInfo;
  content: any;
}

export interface SchoolInfo {
  name: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface TeacherReportFilters {
  classId?: string;
  subjectId?: string;
  startDate: string;
  endDate: string;
  reportType: 'performance' | 'attendance' | 'subject';
}

export interface PrincipalReportFilters {
  studentId?: string;
  classId?: string;
  subjectId?: string;
  startDate: string;
  endDate: string;
  reportType: 'individual' | 'academic' | 'class' | 'subject' | 'attendance' | 'financial';
}

export interface FinanceReportFilters {
  startDate: string;
  endDate: string;
  reportType: 'fee_collection' | 'mpesa_transactions' | 'outstanding' | 'subscription';
}

export interface ParentReportFilters {
  studentId: string;
  startDate: string;
  endDate: string;
  reportType: 'academic' | 'attendance' | 'fees';
}

export interface SystemReportFilters {
  startDate: string;
  endDate: string;
  reportType: 'system_overview' | 'school_performance' | 'revenue' | 'user_activity';
}