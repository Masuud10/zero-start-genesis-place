// Unified Report Service

import { supabase } from '@/integrations/supabase/client';

export interface SchoolInfo {
  name: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface ReportData {
  id: string;
  title: string;
  generatedAt: string;
  schoolInfo: SchoolInfo;
  content: Record<string, unknown>;
  generatedBy: string;
  role: string;
}

export interface ReportTemplate {
  header: string;
  content: string;
  footer: string;
}

export interface ReportHistory {
  id: string;
  reportName: string;
  generatedAt: string;
  format: string;
  status: string;
}

export class UnifiedReportService {
  private static async getSchoolInfo(schoolId: string): Promise<SchoolInfo> {
    try {
      const { data: school, error } = await supabase
        .from('schools')
        .select('name, logo_url, address, phone, email')
        .eq('id', schoolId)
        .single();

      if (error) throw error;

      return {
        name: school?.name || 'School',
        logo: school?.logo_url || '/lovable-uploads/ae278d7f-ba0b-4bb3-b868-639625b0caf0.png',
        address: school?.address,
        phone: school?.phone,
        email: school?.email,
      };
    } catch (error) {
      console.error('Error fetching school info:', error);
      return {
        name: 'School',
        logo: '/lovable-uploads/ae278d7f-ba0b-4bb3-b868-639625b0caf0.png',
      };
    }
  }

  private static async getUserInfo(userId: string): Promise<{ name: string; role: string }> {
    try {
      const { data: user, error } = await supabase
        .from('profiles')
        .select('name, role')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return {
        name: user?.name || 'Unknown User',
        role: user?.role || 'user',
      };
    } catch (error) {
      console.error('Error fetching user info:', error);
      return { name: 'Unknown User', role: 'user' };
    }
  }

  // PRINCIPAL REPORTS
  static async generatePrincipalAcademicReport(schoolId: string, userId: string): Promise<ReportData> {
    const [schoolInfo, userInfo] = await Promise.all([
      this.getSchoolInfo(schoolId),
      this.getUserInfo(userId)
    ]);

    const { data: grades } = await supabase
      .from('grades')
      .select(`
        *,
        students!inner(name, admission_number, class_id),
        subjects!inner(name, code),
        classes!inner(name)
      `)
      .eq('school_id', schoolId)
      .eq('status', 'released')
      .order('created_at', { ascending: false });

    const { data: attendance } = await supabase
      .from('attendance')
      .select(`
        *,
        students!inner(name, admission_number),
        classes!inner(name)
      `)
      .eq('school_id', schoolId)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    return {
      id: `principal-academic-${Date.now()}`,
      title: 'School Academic Performance Report',
      generatedAt: new Date().toISOString(),
      schoolInfo,
      generatedBy: userInfo.name,
      role: userInfo.role,
      content: { grades, attendance }
    };
  }

  static async generatePrincipalAttendanceReport(schoolId: string, userId: string, startDate?: string, endDate?: string): Promise<ReportData> {
    const [schoolInfo, userInfo] = await Promise.all([
      this.getSchoolInfo(schoolId),
      this.getUserInfo(userId)
    ]);

    let query = supabase
      .from('attendance')
      .select(`
        *,
        students!inner(name, admission_number),
        classes!inner(name)
      `)
      .eq('school_id', schoolId);

    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data: attendance } = await query.order('date', { ascending: false });

    return {
      id: `principal-attendance-${Date.now()}`,
      title: 'School Attendance Report',
      generatedAt: new Date().toISOString(),
      schoolInfo,
      generatedBy: userInfo.name,
      role: userInfo.role,
      content: { attendance }
    };
  }

  static async generatePrincipalFinancialReport(schoolId: string, userId: string): Promise<ReportData> {
    const [schoolInfo, userInfo] = await Promise.all([
      this.getSchoolInfo(schoolId),
      this.getUserInfo(userId)
    ]);

    const { data: fees } = await supabase
      .from('fees')
      .select(`
        *,
        students!inner(name, admission_number)
      `)
      .eq('school_id', schoolId);

    const { data: transactions } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });

    return {
      id: `principal-financial-${Date.now()}`,
      title: 'School Financial Overview Report',
      generatedAt: new Date().toISOString(),
      schoolInfo,
      generatedBy: userInfo.name,
      role: userInfo.role,
      content: { fees, transactions }
    };
  }

  // TEACHER REPORTS
  static async generateTeacherClassReport(classId: string, userId: string): Promise<ReportData> {
    const userInfo = await this.getUserInfo(userId);
    
    const { data: classData } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classId)
      .single();

    if (!classData) {
      throw new Error('Class not found');
    }

    const { data: schoolData } = await supabase
      .from('schools')
      .select('name, logo_url, address, phone, email')
      .eq('id', classData.school_id)
      .single();

    const schoolInfo: SchoolInfo = {
      name: schoolData?.name || 'School',
      logo: schoolData?.logo_url,
      address: schoolData?.address,
      phone: schoolData?.phone,
      email: schoolData?.email,
    };

    const { data: grades } = await supabase
      .from('grades')
      .select(`
        *,
        students!inner(name, admission_number),
        subjects!inner(name, code)
      `)
      .eq('class_id', classId)
      .eq('submitted_by', userId);

    const { data: attendance } = await supabase
      .from('attendance')
      .select(`
        *,
        students!inner(name, admission_number)
      `)
      .eq('class_id', classId)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    return {
      id: `teacher-class-${Date.now()}`,
      title: `Class Report - ${classData?.name || 'Class'}`,
      generatedAt: new Date().toISOString(),
      schoolInfo,
      generatedBy: userInfo.name,
      role: userInfo.role,
      content: { class: classData, grades, attendance }
    };
  }

  // FINANCE REPORTS
  static async generateFinanceCollectionReport(schoolId: string, userId: string, startDate?: string, endDate?: string): Promise<ReportData> {
    const [schoolInfo, userInfo] = await Promise.all([
      this.getSchoolInfo(schoolId),
      this.getUserInfo(userId)
    ]);

    let query = supabase
      .from('financial_transactions')
      .select(`
        *,
        students!inner(name, admission_number)
      `)
      .eq('school_id', schoolId);

    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    const { data: transactions } = await query.order('created_at', { ascending: false });

    const { data: fees } = await supabase
      .from('fees')
      .select(`
        *,
        students!inner(name, admission_number)
      `)
      .eq('school_id', schoolId);

    return {
      id: `finance-collection-${Date.now()}`,
      title: 'Fee Collection Report',
      generatedAt: new Date().toISOString(),
      schoolInfo,
      generatedBy: userInfo.name,
      role: userInfo.role,
      content: { transactions, fees }
    };
  }

  static async generateFinanceAnalyticsReport(schoolId: string, userId: string): Promise<ReportData> {
    const [schoolInfo, userInfo] = await Promise.all([
      this.getSchoolInfo(schoolId),
      this.getUserInfo(userId)
    ]);

    const { data: transactions } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });

    const { data: fees } = await supabase
      .from('fees')
      .select('*')
      .eq('school_id', schoolId);

    const { data: mpesaTransactions } = await supabase
      .from('mpesa_transactions')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });

    return {
      id: `finance-analytics-${Date.now()}`,
      title: 'Financial Analytics Report',
      generatedAt: new Date().toISOString(),
      schoolInfo,
      generatedBy: userInfo.name,
      role: userInfo.role,
      content: { transactions, fees, mpesaTransactions }
    };
  }

  // PARENT REPORTS
  static async generateParentStudentReport(studentId: string, userId: string): Promise<ReportData> {
    const userInfo = await this.getUserInfo(userId);
    
    const { data: student } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();

    if (!student) {
      throw new Error('Student not found');
    }

    const { data: schoolData } = await supabase
      .from('schools')
      .select('name, logo_url, address, phone, email')
      .eq('id', student.school_id)
      .single();

    const schoolInfo: SchoolInfo = {
      name: schoolData?.name || 'School',
      logo: schoolData?.logo_url,
      address: schoolData?.address,
      phone: schoolData?.phone,
      email: schoolData?.email,
    };

    const { data: grades } = await supabase
      .from('grades')
      .select(`
        *,
        subjects!inner(name, code)
      `)
      .eq('student_id', studentId)
      .eq('status', 'released')
      .order('created_at', { ascending: false });

    const { data: attendance } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    return {
      id: `parent-student-${Date.now()}`,
      title: `Student Report - ${student?.name || 'Student'}`,
      generatedAt: new Date().toISOString(),
      schoolInfo,
      generatedBy: userInfo.name,
      role: userInfo.role,
      content: { student, grades, attendance }
    };
  }

  // EDUFAM ADMIN REPORTS
  static async generateSystemOverviewReport(userId: string): Promise<ReportData> {
    const userInfo = await this.getUserInfo(userId);

    const { data: schools } = await supabase.from('schools').select('*');
    const { data: users } = await supabase.from('profiles').select('*');
    const { data: transactions } = await supabase.from('financial_transactions').select('*');

    return {
      id: `system-overview-${Date.now()}`,
      title: 'EduFam System Overview Report',
      generatedAt: new Date().toISOString(),
      schoolInfo: { 
        name: 'EduFam Education Management System',
        logo: '/lovable-uploads/ae278d7f-ba0b-4bb3-b868-639625b0caf0.png'
      },
      generatedBy: userInfo.name,
      role: userInfo.role,
      content: { schools, users, transactions }
    };
  }

  static async generateSchoolPerformanceReport(schoolId: string, userId: string): Promise<ReportData> {
    const [schoolInfo, userInfo] = await Promise.all([
      this.getSchoolInfo(schoolId),
      this.getUserInfo(userId)
    ]);

    const { data: grades } = await supabase
      .from('grades')
      .select('*')
      .eq('school_id', schoolId);

    const { data: attendance } = await supabase
      .from('attendance')
      .select('*')
      .eq('school_id', schoolId);

    const { data: students } = await supabase
      .from('students')
      .select('*')
      .eq('school_id', schoolId);

    const { data: teachers } = await supabase
      .from('profiles')
      .select('*')
      .eq('school_id', schoolId)
      .eq('role', 'teacher');

    return {
      id: `school-performance-${Date.now()}`,
      title: 'School Performance Report',
      generatedAt: new Date().toISOString(),
      schoolInfo,
      generatedBy: userInfo.name,
      role: userInfo.role,
      content: { grades, attendance, students, teachers }
    };
  }

  // SCHOOL OWNER REPORTS
  static async generateSchoolOwnerReport(schoolId: string, userId: string): Promise<ReportData> {
    const [schoolInfo, userInfo] = await Promise.all([
      this.getSchoolInfo(schoolId),
      this.getUserInfo(userId)
    ]);

    const { data: staff } = await supabase
      .from('profiles')
      .select('*')
      .eq('school_id', schoolId);

    const { data: students } = await supabase
      .from('students')
      .select('*')
      .eq('school_id', schoolId);

    const { data: financialSummary } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('school_id', schoolId);

    return {
      id: `school-owner-${Date.now()}`,
      title: 'School Owner Summary Report',
      generatedAt: new Date().toISOString(),
      schoolInfo,
      generatedBy: userInfo.name,
      role: userInfo.role,
      content: { staff, students, financialSummary }
    };
  }

  // Unified report generation method
  static async generateReport(params: {
    reportType: string;
    userRole: string;
    filters?: {
      dateRange?: { from?: Date; to?: Date };
      classId?: string;
      studentId?: string;
    };
  }): Promise<ReportData> {
    const { reportType, userRole, filters } = params;
    
    // Get current user info
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get user's school ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single();

    const schoolId = profile?.school_id;

    switch (userRole) {
      case 'principal':
        if (!schoolId) throw new Error('School ID is required for principal reports');
        switch (reportType) {
          case 'class-performance':
            return this.generatePrincipalAcademicReport(schoolId, user.id);
          case 'student-progress':
            return this.generatePrincipalAcademicReport(schoolId, user.id);
          case 'subject-analysis':
            return this.generatePrincipalAcademicReport(schoolId, user.id);
          case 'exam-results':
            return this.generatePrincipalAcademicReport(schoolId, user.id);
          case 'attendance-summary':
            return this.generatePrincipalAttendanceReport(
              schoolId, 
              user.id, 
              filters?.dateRange?.from?.toISOString(),
              filters?.dateRange?.to?.toISOString()
            );
          case 'class-attendance':
            return this.generatePrincipalAttendanceReport(
              schoolId, 
              user.id, 
              filters?.dateRange?.from?.toISOString(),
              filters?.dateRange?.to?.toISOString()
            );
          case 'student-attendance':
            return this.generatePrincipalAttendanceReport(
              schoolId, 
              user.id, 
              filters?.dateRange?.from?.toISOString(),
              filters?.dateRange?.to?.toISOString()
            );
          case 'fee-collection':
            return this.generatePrincipalFinancialReport(schoolId, user.id);
          case 'financial-summary':
            return this.generatePrincipalFinancialReport(schoolId, user.id);
          default:
            throw new Error(`Unknown report type: ${reportType}`);
        }

      case 'teacher':
        switch (reportType) {
          case 'my-class-performance':
            if (!filters?.classId) throw new Error('Class ID is required for teacher reports');
            return this.generateTeacherClassReport(filters.classId, user.id);
          case 'student-grades':
            if (!filters?.classId) throw new Error('Class ID is required for teacher reports');
            return this.generateTeacherClassReport(filters.classId, user.id);
          case 'subject-performance':
            if (!filters?.classId) throw new Error('Class ID is required for teacher reports');
            return this.generateTeacherClassReport(filters.classId, user.id);
          case 'my-class-attendance':
            if (!filters?.classId) throw new Error('Class ID is required for teacher reports');
            return this.generateTeacherClassReport(filters.classId, user.id);
          case 'student-attendance':
            if (!filters?.classId) throw new Error('Class ID is required for teacher reports');
            return this.generateTeacherClassReport(filters.classId, user.id);
          default:
            throw new Error(`Unknown report type: ${reportType}`);
        }

      case 'finance_officer':
        if (!schoolId) throw new Error('School ID is required for finance officer reports');
        switch (reportType) {
          case 'fee-collection':
            return this.generateFinanceCollectionReport(
              schoolId, 
              user.id, 
              filters?.dateRange?.from?.toISOString(),
              filters?.dateRange?.to?.toISOString()
            );
          case 'outstanding-fees':
            return this.generateFinanceCollectionReport(
              schoolId, 
              user.id, 
              filters?.dateRange?.from?.toISOString(),
              filters?.dateRange?.to?.toISOString()
            );
          case 'payment-history':
            return this.generateFinanceCollectionReport(
              schoolId, 
              user.id, 
              filters?.dateRange?.from?.toISOString(),
              filters?.dateRange?.to?.toISOString()
            );
          case 'financial-summary':
            return this.generateFinanceAnalyticsReport(schoolId, user.id);
          case 'revenue-analysis':
            return this.generateFinanceAnalyticsReport(schoolId, user.id);
          default:
            throw new Error(`Unknown report type: ${reportType}`);
        }

      case 'parent':
        switch (reportType) {
          case 'my-child-progress':
            if (!filters?.studentId) throw new Error('Student ID is required for parent reports');
            return this.generateParentStudentReport(filters.studentId, user.id);
          case 'my-child-grades':
            if (!filters?.studentId) throw new Error('Student ID is required for parent reports');
            return this.generateParentStudentReport(filters.studentId, user.id);
          case 'my-child-attendance':
            if (!filters?.studentId) throw new Error('Student ID is required for parent reports');
            return this.generateParentStudentReport(filters.studentId, user.id);
          case 'my-child-fees':
            if (!filters?.studentId) throw new Error('Student ID is required for parent reports');
            return this.generateParentStudentReport(filters.studentId, user.id);
          default:
            throw new Error(`Unknown report type: ${reportType}`);
        }

      case 'edufam_admin':
        switch (reportType) {
          case 'system-overview':
            return this.generateSystemOverviewReport(user.id);
          case 'school-registration':
            return this.generateSystemOverviewReport(user.id);
          case 'user-analytics':
            return this.generateSystemOverviewReport(user.id);
          case 'security-audit':
            return this.generateSystemOverviewReport(user.id);
          case 'database-performance':
            return this.generateSystemOverviewReport(user.id);
          case 'platform-revenue':
            return this.generateSystemOverviewReport(user.id);
          case 'financial-overview':
            return this.generateSystemOverviewReport(user.id);
          case 'subscription-analytics':
            return this.generateSystemOverviewReport(user.id);
          default:
            throw new Error(`Unknown report type: ${reportType}`);
        }

      default:
        throw new Error(`Unknown user role: ${userRole}`);
    }
  }

  // Helper methods for filters
  static async getClasses(): Promise<Array<{ id: string; name: string; school_id: string }>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single();

    if (!profile?.school_id) return [];

    const { data: classes } = await supabase
      .from('classes')
      .select('*')
      .eq('school_id', profile.school_id);

    return classes || [];
  }

  static async getStudents(): Promise<Array<{ id: string; name: string; school_id: string }>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single();

    if (!profile?.school_id) return [];

    const { data: students } = await supabase
      .from('students')
      .select('*')
      .eq('school_id', profile.school_id);

    return students || [];
  }

  static async getReportHistory(userRole: string): Promise<ReportHistory[]> {
    // This would typically fetch from a reports_history table
    // For now, return empty array
    return [];
  }
}

// Export the service instance
export const unifiedReportService = UnifiedReportService; 