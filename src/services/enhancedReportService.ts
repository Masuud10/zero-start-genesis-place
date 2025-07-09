import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export interface EnhancedReportData {
  id: string;
  title: string;
  generatedAt: string;
  schoolInfo: SchoolInfo;
  content: Record<string, any>;
  generatedBy: string;
  role: string;
  filters?: ReportFilters;
  summary?: ReportSummary;
}

export interface SchoolInfo {
  name: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  motto?: string;
  slogan?: string;
}

export interface ReportFilters {
  dateRange?: { from: Date; to: Date };
  classId?: string;
  studentId?: string;
  subjectId?: string;
  academicYear?: string;
  term?: string;
  status?: string;
}

export interface ReportSummary {
  totalRecords: number;
  totalAmount?: number;
  averageScore?: number;
  attendanceRate?: number;
  collectionRate?: number;
}

export interface ExportOptions {
  format: 'pdf' | 'excel';
  includeLogo?: boolean;
  includeTimestamp?: boolean;
  includeFooter?: boolean;
  includeCharts?: boolean;
  includeSummary?: boolean;
}

export class EnhancedReportService {
  // Get current academic context
  static async getCurrentAcademicContext(schoolId: string) {
    const { data: academicYear } = await supabase
      .from('academic_years')
      .select('*')
      .eq('school_id', schoolId)
      .eq('is_current', true)
      .single();

    const { data: currentTerm } = await supabase
      .from('academic_terms')
      .select('*')
      .eq('academic_year_id', academicYear?.id)
      .eq('is_current', true)
      .single();

    return {
      academicYear: academicYear?.year_name || new Date().getFullYear().toString(),
      term: currentTerm?.term_name || 'Term 1',
      academicYearId: academicYear?.id,
      termId: currentTerm?.id
    };
  }

  // Get school information
  static async getSchoolInfo(schoolId: string): Promise<SchoolInfo> {
    const { data: school } = await supabase
      .from('schools')
      .select('*')
      .eq('id', schoolId)
      .single();

    return {
      name: school?.name || 'School',
      logo: school?.logo_url,
      address: school?.address,
      phone: school?.phone,
      email: school?.email,
      motto: school?.motto,
      slogan: school?.slogan
    };
  }

  // Get user information
  static async getUserInfo(userId: string) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, role')
      .eq('id', userId)
      .single();

    return {
      name: profile?.name || 'User',
      role: profile?.role || 'user'
    };
  }

  // EDUFAM ADMIN REPORTS
  static async generateSystemOverviewReport(userId: string, filters?: ReportFilters): Promise<EnhancedReportData> {
    const userInfo = await this.getUserInfo(userId);

    // Fetch system-wide data
    const [schoolsResult, usersResult, transactionsResult, metricsResult] = await Promise.all([
      supabase.from('schools').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('financial_transactions').select('*').order('created_at', { ascending: false }),
      supabase.from('company_metrics').select('*').order('metric_date', { ascending: false }).limit(30)
    ]);

    const schools = schoolsResult.data || [];
    const users = usersResult.data || [];
    const transactions = transactionsResult.data || [];
    const metrics = metricsResult.data || [];

    // Calculate summary statistics
    const totalRevenue = transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const activeSchools = schools.filter(s => s.status === 'active').length;
    const totalStudents = users.filter(u => u.role === 'student').length;
    const totalTeachers = users.filter(u => u.role === 'teacher').length;

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
      filters,
      summary: {
        totalRecords: schools.length,
        totalAmount: totalRevenue,
        averageScore: 0, // Not applicable for system overview
        attendanceRate: 0, // Not applicable for system overview
        collectionRate: 0 // Not applicable for system overview
      },
      content: {
        schools,
        users,
        transactions,
        metrics,
        statistics: {
          totalSchools: schools.length,
          activeSchools,
          totalUsers: users.length,
          totalStudents,
          totalTeachers,
          totalRevenue
        }
      }
    };
  }

  static async generateSchoolRegistrationReport(userId: string, filters?: ReportFilters): Promise<EnhancedReportData> {
    const userInfo = await this.getUserInfo(userId);

    const { data: schools } = await supabase
      .from('schools')
      .select(`
        *,
        profiles!schools_owner_id_fkey(name as owner_name, email as owner_email)
      `)
      .order('created_at', { ascending: false });

    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    return {
      id: `school-registration-${Date.now()}`,
      title: 'School Registration Report',
      generatedAt: new Date().toISOString(),
      schoolInfo: {
        name: 'EduFam Education Management System',
        logo: '/lovable-uploads/ae278d7f-ba0b-4bb3-b868-639625b0caf0.png'
      },
      generatedBy: userInfo.name,
      role: userInfo.role,
      filters,
      summary: {
        totalRecords: schools?.length || 0,
        totalAmount: subscriptions?.reduce((sum, s) => sum + (Number(s.amount) || 0), 0) || 0
      },
      content: {
        schools: schools || [],
        subscriptions: subscriptions || [],
        statistics: {
          totalSchools: schools?.length || 0,
          activeSchools: schools?.filter(s => s.status === 'active').length || 0,
          totalSubscriptions: subscriptions?.length || 0,
          activeSubscriptions: subscriptions?.filter(s => s.status === 'active').length || 0
        }
      }
    };
  }

  // PRINCIPAL REPORTS
  static async generatePrincipalAcademicReport(schoolId: string, userId: string, filters?: ReportFilters): Promise<EnhancedReportData> {
    const [schoolInfo, userInfo, academicContext] = await Promise.all([
      this.getSchoolInfo(schoolId),
      this.getUserInfo(userId),
      this.getCurrentAcademicContext(schoolId)
    ]);

    // Build query filters
    const queryFilters = {
      school_id: schoolId,
      term: filters?.term || academicContext.term,
      academic_year: filters?.academicYear || academicContext.academicYear
    };

    // Fetch academic data
    const [gradesResult, attendanceResult, studentsResult, classesResult] = await Promise.all([
      supabase
        .from('grades')
        .select(`
          *,
          students!inner(name, admission_number, class_id),
          subjects!inner(name, code),
          classes!inner(name)
        `)
        .eq('school_id', schoolId)
        .eq('term', queryFilters.term)
        .eq('academic_year', queryFilters.academicYear)
        .eq('status', 'released'),
      supabase
        .from('attendance')
        .select(`
          *,
          students!inner(name, admission_number),
          classes!inner(name)
        `)
        .eq('school_id', schoolId)
        .gte('date', filters?.dateRange?.from?.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabase
        .from('students')
        .select('*')
        .eq('school_id', schoolId)
        .eq('is_active', true),
      supabase
        .from('classes')
        .select('*')
        .eq('school_id', schoolId)
    ]);

    const grades = gradesResult.data || [];
    const attendance = attendanceResult.data || [];
    const students = studentsResult.data || [];
    const classes = classesResult.data || [];

    // Calculate summary statistics
    const averageScore = grades.length > 0 
      ? grades.reduce((sum, g) => sum + (Number(g.percentage) || 0), 0) / grades.length 
      : 0;
    const attendanceRate = attendance.length > 0
      ? (attendance.filter(a => a.status === 'present').length / attendance.length) * 100
      : 0;

    return {
      id: `principal-academic-${Date.now()}`,
      title: 'School Academic Performance Report',
      generatedAt: new Date().toISOString(),
      schoolInfo,
      generatedBy: userInfo.name,
      role: userInfo.role,
      filters,
      summary: {
        totalRecords: students.length,
        averageScore,
        attendanceRate,
        collectionRate: 0 // Not applicable for academic report
      },
      content: {
        grades,
        attendance,
        students,
        classes,
        academicContext,
        statistics: {
          totalStudents: students.length,
          totalClasses: classes.length,
          totalGrades: grades.length,
          averageScore,
          attendanceRate
        }
      }
    };
  }

  static async generatePrincipalFinancialReport(schoolId: string, userId: string, filters?: ReportFilters): Promise<EnhancedReportData> {
    const [schoolInfo, userInfo, academicContext] = await Promise.all([
      this.getSchoolInfo(schoolId),
      this.getUserInfo(userId),
      this.getCurrentAcademicContext(schoolId)
    ]);

    // Fetch financial data
    const [feesResult, transactionsResult, expensesResult] = await Promise.all([
      supabase
        .from('fees')
        .select(`
          *,
          students!inner(name, admission_number)
        `)
        .eq('school_id', schoolId)
        .eq('academic_year', filters?.academicYear || academicContext.academicYear),
      supabase
        .from('financial_transactions')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false }),
      supabase
        .from('expenses')
        .select('*')
        .eq('school_id', schoolId)
        .gte('expense_date', filters?.dateRange?.from?.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ]);

    const fees = feesResult.data || [];
    const transactions = transactionsResult.data || [];
    const expenses = expensesResult.data || [];

    // Calculate financial metrics
    const totalExpected = fees.reduce((sum, fee) => sum + (Number(fee.amount) || 0), 0);
    const totalCollected = fees.reduce((sum, fee) => sum + (Number(fee.paid_amount) || 0), 0);
    const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;
    const totalExpenses = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

    return {
      id: `principal-financial-${Date.now()}`,
      title: 'School Financial Overview Report',
      generatedAt: new Date().toISOString(),
      schoolInfo,
      generatedBy: userInfo.name,
      role: userInfo.role,
      filters,
      summary: {
        totalRecords: fees.length,
        totalAmount: totalCollected,
        collectionRate
      },
      content: {
        fees,
        transactions,
        expenses,
        academicContext,
        statistics: {
          totalExpected,
          totalCollected,
          outstandingAmount: totalExpected - totalCollected,
          collectionRate,
          totalExpenses,
          netRevenue: totalCollected - totalExpenses
        }
      }
    };
  }

  // TEACHER REPORTS
  static async generateTeacherClassReport(classId: string, userId: string, filters?: ReportFilters): Promise<EnhancedReportData> {
    const userInfo = await this.getUserInfo(userId);

    // Get class and school info
    const { data: classInfo } = await supabase
      .from('classes')
      .select(`
        *,
        schools!inner(*)
      `)
      .eq('id', classId)
      .single();

    if (!classInfo) {
      throw new Error('Class not found');
    }

    const schoolInfo = await this.getSchoolInfo(classInfo.school_id);
    const academicContext = await this.getCurrentAcademicContext(classInfo.school_id);

    // Fetch class-specific data
    const [gradesResult, attendanceResult, studentsResult] = await Promise.all([
      supabase
        .from('grades')
        .select(`
          *,
          students!inner(name, admission_number),
          subjects!inner(name, code)
        `)
        .eq('class_id', classId)
        .eq('term', filters?.term || academicContext.term)
        .eq('academic_year', filters?.academicYear || academicContext.academicYear),
      supabase
        .from('attendance')
        .select(`
          *,
          students!inner(name, admission_number)
        `)
        .eq('class_id', classId)
        .gte('date', filters?.dateRange?.from?.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabase
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .eq('is_active', true)
    ]);

    const grades = gradesResult.data || [];
    const attendance = attendanceResult.data || [];
    const students = studentsResult.data || [];

    // Calculate class statistics
    const averageScore = grades.length > 0 
      ? grades.reduce((sum, g) => sum + (Number(g.percentage) || 0), 0) / grades.length 
      : 0;
    const attendanceRate = attendance.length > 0
      ? (attendance.filter(a => a.status === 'present').length / attendance.length) * 100
      : 0;

    return {
      id: `teacher-class-${Date.now()}`,
      title: `Class Performance Report - ${classInfo.name}`,
      generatedAt: new Date().toISOString(),
      schoolInfo,
      generatedBy: userInfo.name,
      role: userInfo.role,
      filters,
      summary: {
        totalRecords: students.length,
        averageScore,
        attendanceRate
      },
      content: {
        classInfo,
        grades,
        attendance,
        students,
        academicContext,
        statistics: {
          totalStudents: students.length,
          totalGrades: grades.length,
          averageScore,
          attendanceRate,
          topPerformers: grades
            .sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
            .slice(0, 5)
        }
      }
    };
  }

  // FINANCE OFFICER REPORTS
  static async generateFinanceCollectionReport(schoolId: string, userId: string, filters?: ReportFilters): Promise<EnhancedReportData> {
    const [schoolInfo, userInfo, academicContext] = await Promise.all([
      this.getSchoolInfo(schoolId),
      this.getUserInfo(userId),
      this.getCurrentAcademicContext(schoolId)
    ]);

    // Fetch financial data
    const [feesResult, transactionsResult, mpesaResult] = await Promise.all([
      supabase
        .from('fees')
        .select(`
          *,
          students!inner(name, admission_number, class_id),
          classes!inner(name)
        `)
        .eq('school_id', schoolId)
        .eq('academic_year', filters?.academicYear || academicContext.academicYear),
      supabase
        .from('financial_transactions')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false }),
      supabase
        .from('mpesa_transactions')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false })
    ]);

    const fees = feesResult.data || [];
    const transactions = transactionsResult.data || [];
    const mpesaTransactions = mpesaResult.data || [];

    // Calculate financial metrics
    const totalExpected = fees.reduce((sum, fee) => sum + (Number(fee.amount) || 0), 0);
    const totalCollected = fees.reduce((sum, fee) => sum + (Number(fee.paid_amount) || 0), 0);
    const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;
    const totalMpesa = mpesaTransactions.reduce((sum, txn) => sum + (Number(txn.amount_paid) || 0), 0);

    return {
      id: `finance-collection-${Date.now()}`,
      title: 'Fee Collection Report',
      generatedAt: new Date().toISOString(),
      schoolInfo,
      generatedBy: userInfo.name,
      role: userInfo.role,
      filters,
      summary: {
        totalRecords: fees.length,
        totalAmount: totalCollected,
        collectionRate
      },
      content: {
        fees,
        transactions,
        mpesaTransactions,
        academicContext,
        statistics: {
          totalExpected,
          totalCollected,
          outstandingAmount: totalExpected - totalCollected,
          collectionRate,
          totalMpesa,
          defaultersCount: fees.filter(f => (Number(f.amount) || 0) > (Number(f.paid_amount) || 0)).length
        }
      }
    };
  }

  // PARENT REPORTS
  static async generateParentStudentReport(studentId: string, userId: string, filters?: ReportFilters): Promise<EnhancedReportData> {
    const userInfo = await this.getUserInfo(userId);

    // Get student and school info
    const { data: student } = await supabase
      .from('students')
      .select(`
        *,
        classes!inner(name),
        schools!inner(*)
      `)
      .eq('id', studentId)
      .single();

    if (!student) {
      throw new Error('Student not found');
    }

    const schoolInfo = await this.getSchoolInfo(student.school_id);
    const academicContext = await this.getCurrentAcademicContext(student.school_id);

    // Fetch student-specific data
    const [gradesResult, attendanceResult, feesResult] = await Promise.all([
      supabase
        .from('grades')
        .select(`
          *,
          subjects!inner(name, code)
        `)
        .eq('student_id', studentId)
        .eq('status', 'released')
        .order('created_at', { ascending: false }),
      supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false }),
      supabase
        .from('fees')
        .select('*')
        .eq('student_id', studentId)
        .eq('academic_year', filters?.academicYear || academicContext.academicYear)
    ]);

    const grades = gradesResult.data || [];
    const attendance = attendanceResult.data || [];
    const fees = feesResult.data || [];

    // Calculate student statistics
    const averageScore = grades.length > 0 
      ? grades.reduce((sum, g) => sum + (Number(g.percentage) || 0), 0) / grades.length 
      : 0;
    const attendanceRate = attendance.length > 0
      ? (attendance.filter(a => a.status === 'present').length / attendance.length) * 100
      : 0;
    const totalFees = fees.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
    const totalPaid = fees.reduce((sum, f) => sum + (Number(f.paid_amount) || 0), 0);

    return {
      id: `parent-student-${Date.now()}`,
      title: `Student Report - ${student.name}`,
      generatedAt: new Date().toISOString(),
      schoolInfo,
      generatedBy: userInfo.name,
      role: userInfo.role,
      filters,
      summary: {
        totalRecords: grades.length,
        averageScore,
        attendanceRate,
        totalAmount: totalPaid
      },
      content: {
        student,
        grades,
        attendance,
        fees,
        academicContext,
        statistics: {
          averageScore,
          attendanceRate,
          totalFees,
          totalPaid,
          outstandingAmount: totalFees - totalPaid,
          subjectsCount: [...new Set(grades.map(g => g.subjects?.name))].length
        }
      }
    };
  }

  static async generateSchoolPerformanceReport(schoolId: string, userId: string, filters?: ReportFilters): Promise<EnhancedReportData> {
    const [schoolInfo, userInfo] = await Promise.all([
      this.getSchoolInfo(schoolId),
      this.getUserInfo(userId)
    ]);

    // Fetch comprehensive school data
    const [gradesResult, attendanceResult, studentsResult, teachersResult, feesResult] = await Promise.all([
      supabase
        .from('grades')
        .select(`
          *,
          students!inner(name, admission_number),
          subjects!inner(name, code),
          classes!inner(name)
        `)
        .eq('school_id', schoolId)
        .eq('status', 'released'),
      supabase
        .from('attendance')
        .select(`
          *,
          students!inner(name, admission_number),
          classes!inner(name)
        `)
        .eq('school_id', schoolId),
      supabase
        .from('students')
        .select('*')
        .eq('school_id', schoolId)
        .eq('is_active', true),
      supabase
        .from('profiles')
        .select('*')
        .eq('school_id', schoolId)
        .eq('role', 'teacher'),
      supabase
        .from('fees')
        .select(`
          *,
          students!inner(name, admission_number)
        `)
        .eq('school_id', schoolId)
    ]);

    const grades = gradesResult.data || [];
    const attendance = attendanceResult.data || [];
    const students = studentsResult.data || [];
    const teachers = teachersResult.data || [];
    const fees = feesResult.data || [];

    // Calculate comprehensive statistics
    const totalStudents = students.length;
    const totalTeachers = teachers.length;
    const totalGrades = grades.length;
    const averageScore = grades.length > 0 
      ? grades.reduce((sum, grade) => sum + (grade.percentage || 0), 0) / grades.length 
      : 0;
    const attendanceRate = attendance.length > 0
      ? (attendance.filter(a => a.status === 'present').length / attendance.length) * 100
      : 0;
    const totalFees = fees.reduce((sum, fee) => sum + (Number(fee.amount) || 0), 0);
    const totalCollected = fees.reduce((sum, fee) => sum + (Number(fee.paid_amount) || 0), 0);
    const collectionRate = totalFees > 0 ? (totalCollected / totalFees) * 100 : 0;

    // Subject performance analysis
    const subjectPerformance = grades.reduce((acc, grade) => {
      const subjectName = grade.subjects?.name || 'Unknown';
      if (!acc[subjectName]) {
        acc[subjectName] = { total: 0, count: 0, average: 0 };
      }
      acc[subjectName].total += grade.percentage || 0;
      acc[subjectName].count += 1;
      acc[subjectName].average = acc[subjectName].total / acc[subjectName].count;
      return acc;
    }, {} as Record<string, { total: number; count: number; average: number }>);

    // Class performance analysis
    const classPerformance = grades.reduce((acc, grade) => {
      const className = grade.classes?.name || 'Unknown';
      if (!acc[className]) {
        acc[className] = { total: 0, count: 0, average: 0 };
      }
      acc[className].total += grade.percentage || 0;
      acc[className].count += 1;
      acc[className].average = acc[className].total / acc[className].count;
      return acc;
    }, {} as Record<string, { total: number; count: number; average: number }>);

    return {
      id: `school-performance-${Date.now()}`,
      title: 'School Performance Report',
      generatedAt: new Date().toISOString(),
      schoolInfo,
      generatedBy: userInfo.name,
      role: userInfo.role,
      filters,
      summary: {
        totalRecords: totalGrades,
        totalAmount: totalCollected,
        averageScore,
        attendanceRate,
        collectionRate
      },
      content: { 
        grades, 
        attendance, 
        students, 
        teachers, 
        fees,
        statistics: {
          totalStudents,
          totalTeachers,
          totalGrades,
          averageScore,
          attendanceRate,
          totalFees,
          totalCollected,
          collectionRate
        },
        subjectPerformance,
        classPerformance
      }
    };
  }

  // Unified report generation method
  static async generateReport(params: {
    reportType: string;
    userRole: string;
    userId: string;
    schoolId?: string;
    classId?: string;
    studentId?: string;
    filters?: ReportFilters;
  }): Promise<EnhancedReportData> {
    const { reportType, userRole, userId, schoolId, classId, studentId, filters } = params;

    switch (userRole) {
      case 'edufam_admin':
        switch (reportType) {
          case 'system-overview':
            return this.generateSystemOverviewReport(userId, filters);
          case 'school-registration':
            return this.generateSchoolRegistrationReport(userId, filters);
          case 'user-analytics':
            return this.generateSystemOverviewReport(userId, filters);
          case 'security-audit':
            return this.generateSystemOverviewReport(userId, filters);
          case 'database-performance':
            return this.generateSystemOverviewReport(userId, filters);
          case 'platform-revenue':
            return this.generateSchoolRegistrationReport(userId, filters);
          case 'financial-overview':
            return this.generateSchoolRegistrationReport(userId, filters);
          case 'subscription-analytics':
            return this.generateSchoolRegistrationReport(userId, filters);
          default:
            throw new Error(`Unknown report type: ${reportType}`);
        }

      case 'principal':
        if (!schoolId) throw new Error('School ID is required for principal reports');
        switch (reportType) {
          case 'academic-performance':
          case 'class-performance':
          case 'student-progress':
          case 'subject-analysis':
          case 'exam-results':
            return this.generatePrincipalAcademicReport(schoolId, userId, filters);
          case 'attendance-summary':
          case 'class-attendance':
          case 'student-attendance':
            return this.generatePrincipalAcademicReport(schoolId, userId, filters);
          case 'fee-collection':
          case 'financial-summary':
            return this.generatePrincipalFinancialReport(schoolId, userId, filters);
          case 'school-performance':
            return this.generateSchoolPerformanceReport(schoolId, userId, filters);
          default:
            throw new Error(`Unknown report type: ${reportType}`);
        }

      case 'teacher':
        if (!classId) throw new Error('Class ID is required for teacher reports');
        switch (reportType) {
          case 'my-class-performance':
          case 'student-grades':
          case 'subject-performance':
          case 'my-class-attendance':
          case 'student-attendance':
            return this.generateTeacherClassReport(classId, userId, filters);
          default:
            throw new Error(`Unknown report type: ${reportType}`);
        }

      case 'finance_officer':
        if (!schoolId) throw new Error('School ID is required for finance officer reports');
        switch (reportType) {
          case 'fee-collection':
          case 'outstanding-fees':
          case 'payment-history':
          case 'financial-summary':
          case 'revenue-analysis':
            return this.generateFinanceCollectionReport(schoolId, userId, filters);
          default:
            throw new Error(`Unknown report type: ${reportType}`);
        }

      case 'parent':
        if (!studentId) throw new Error('Student ID is required for parent reports');
        switch (reportType) {
          case 'my-child-progress':
          case 'my-child-grades':
          case 'my-child-attendance':
          case 'my-child-fees':
            return this.generateParentStudentReport(studentId, userId, filters);
          default:
            throw new Error(`Unknown report type: ${reportType}`);
        }

      default:
        throw new Error(`Unknown user role: ${userRole}`);
    }
  }

  // PDF Generation
  static async generatePDF(reportData: EnhancedReportData, options: ExportOptions): Promise<void> {
    const doc = new jsPDF();
    
    // Set up fonts and styling
    doc.setFont('helvetica');
    
    // Header with logo
    if (options.includeLogo && reportData.schoolInfo.logo) {
      // Add logo placeholder (in real implementation, you'd load the actual image)
      doc.setFillColor(240, 240, 240);
      doc.rect(20, 20, 30, 30, 'F');
      doc.text('LOGO', 25, 35);
    }
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(30, 30, 30);
    doc.text(reportData.title, 20, 60);
    
    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    if (options.includeTimestamp) {
      doc.text(`Generated on: ${format(new Date(reportData.generatedAt), 'PPP \'at\' p')}`, 20, 75);
    }
    doc.text(`Generated by: ${reportData.generatedBy} (${reportData.role.replace('_', ' ')})`, 20, 82);
    doc.text(`School: ${reportData.schoolInfo.name}`, 20, 89);
    
    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 95, 190, 95);
    
    let yPosition = 110;
    
    // Summary section
    if (options.includeSummary && reportData.summary) {
      yPosition = this.addSummarySection(doc, reportData.summary, yPosition);
    }
    
    // Content sections based on report type
    yPosition = this.addContentSections(doc, reportData.content, yPosition);
    
    // Footer
    if (options.includeFooter) {
      this.addFooter(doc);
    }
    
    // Save the PDF
    const fileName = `${reportData.title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`;
    doc.save(fileName);
  }

  // Excel Generation
  static async generateExcel(reportData: EnhancedReportData, options: ExportOptions): Promise<void> {
    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      { 'Report Title': reportData.title },
      { 'Generated On': format(new Date(reportData.generatedAt), 'PPP \'at\' p') },
      { 'Generated By': `${reportData.generatedBy} (${reportData.role.replace('_', ' ')})` },
      { 'School': reportData.schoolInfo.name },
      {},
      { 'Summary Statistics': '' }
    ];
    
    if (reportData.summary) {
      summaryData.push(
        { 'Total Records': reportData.summary.totalRecords },
        { 'Total Amount': reportData.summary.totalAmount || 0 },
        { 'Average Score': reportData.summary.averageScore || 0 },
        { 'Attendance Rate': reportData.summary.attendanceRate || 0 },
        { 'Collection Rate': reportData.summary.collectionRate || 0 }
      );
    }
    
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    // Data sheets based on content
    this.addDataSheets(workbook, reportData.content);
    
    // Save the Excel file
    const fileName = `${reportData.title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  // Helper methods for PDF generation
  private static addSummarySection(doc: jsPDF, summary: ReportSummary, yPosition: number): number {
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text('Summary', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Total Records: ${summary.totalRecords}`, 20, yPosition);
    yPosition += 7;
    
    if (summary.totalAmount !== undefined) {
      doc.text(`Total Amount: KES ${summary.totalAmount.toLocaleString()}`, 20, yPosition);
      yPosition += 7;
    }
    
    if (summary.averageScore !== undefined) {
      doc.text(`Average Score: ${summary.averageScore.toFixed(2)}%`, 20, yPosition);
      yPosition += 7;
    }
    
    if (summary.attendanceRate !== undefined) {
      doc.text(`Attendance Rate: ${summary.attendanceRate.toFixed(2)}%`, 20, yPosition);
      yPosition += 7;
    }
    
    if (summary.collectionRate !== undefined) {
      doc.text(`Collection Rate: ${summary.collectionRate.toFixed(2)}%`, 20, yPosition);
      yPosition += 7;
    }
    
    return yPosition + 10;
  }

  private static addContentSections(doc: jsPDF, content: Record<string, any>, yPosition: number): number {
    // Add schools data if present
    if (content.schools && Array.isArray(content.schools)) {
      yPosition = this.addSchoolsTable(doc, content.schools, yPosition);
    }
    
    // Add grades data if present
    if (content.grades && Array.isArray(content.grades)) {
      yPosition = this.addGradesTable(doc, content.grades, yPosition);
    }
    
    // Add attendance data if present
    if (content.attendance && Array.isArray(content.attendance)) {
      yPosition = this.addAttendanceTable(doc, content.attendance, yPosition);
    }
    
    // Add financial data if present
    if (content.fees && Array.isArray(content.fees)) {
      yPosition = this.addFinancialTable(doc, content.fees, yPosition);
    }
    
    return yPosition;
  }

  private static addSchoolsTable(doc: jsPDF, schools: any[], yPosition: number): number {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text('Schools', 20, yPosition);
    yPosition += 10;
    
    // Table headers
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Name', 20, yPosition);
    doc.text('Status', 80, yPosition);
    doc.text('Created', 120, yPosition);
    yPosition += 5;
    
    // Table data
    doc.setTextColor(30, 30, 30);
    schools.slice(0, 10).forEach(school => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(school.name || 'N/A', 20, yPosition);
      doc.text(school.status || 'N/A', 80, yPosition);
      doc.text(format(new Date(school.created_at), 'MMM dd, yyyy'), 120, yPosition);
      yPosition += 5;
    });
    
    return yPosition + 10;
  }

  private static addGradesTable(doc: jsPDF, grades: any[], yPosition: number): number {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text('Academic Performance', 20, yPosition);
    yPosition += 10;
    
    // Table headers
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Student', 20, yPosition);
    doc.text('Subject', 60, yPosition);
    doc.text('Score', 100, yPosition);
    doc.text('Grade', 130, yPosition);
    yPosition += 5;
    
    // Table data
    doc.setTextColor(30, 30, 30);
    grades.slice(0, 15).forEach(grade => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(grade.students?.name || 'N/A', 20, yPosition);
      doc.text(grade.subjects?.name || 'N/A', 60, yPosition);
      doc.text((grade.percentage || grade.score || 0).toString(), 100, yPosition);
      doc.text(grade.grade || 'N/A', 130, yPosition);
      yPosition += 5;
    });
    
    return yPosition + 10;
  }

  private static addAttendanceTable(doc: jsPDF, attendance: any[], yPosition: number): number {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text('Attendance Records', 20, yPosition);
    yPosition += 10;
    
    // Table headers
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Student', 20, yPosition);
    doc.text('Date', 60, yPosition);
    doc.text('Status', 100, yPosition);
    yPosition += 5;
    
    // Table data
    doc.setTextColor(30, 30, 30);
    attendance.slice(0, 15).forEach(record => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(record.students?.name || 'N/A', 20, yPosition);
      doc.text(format(new Date(record.date), 'MMM dd, yyyy'), 60, yPosition);
      doc.text(record.status || 'N/A', 100, yPosition);
      yPosition += 5;
    });
    
    return yPosition + 10;
  }

  private static addFinancialTable(doc: jsPDF, fees: any[], yPosition: number): number {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text('Financial Records', 20, yPosition);
    yPosition += 10;
    
    // Table headers
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Student', 20, yPosition);
    doc.text('Amount', 60, yPosition);
    doc.text('Paid', 90, yPosition);
    doc.text('Status', 120, yPosition);
    yPosition += 5;
    
    // Table data
    doc.setTextColor(30, 30, 30);
    fees.slice(0, 15).forEach(fee => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(fee.students?.name || 'N/A', 20, yPosition);
      doc.text(`KES ${(fee.amount || 0).toLocaleString()}`, 60, yPosition);
      doc.text(`KES ${(fee.paid_amount || 0).toLocaleString()}`, 90, yPosition);
      doc.text(fee.status || 'N/A', 120, yPosition);
      yPosition += 5;
    });
    
    return yPosition + 10;
  }

  private static addFooter(doc: jsPDF): void {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Powered by EduFam Education Management System', 20, pageHeight - 20);
    doc.text(`Generated on ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 20, pageHeight - 15);
  }

  // Helper methods for Excel generation
  private static addDataSheets(workbook: XLSX.WorkBook, content: Record<string, any>): void {
    // Add schools sheet
    if (content.schools && Array.isArray(content.schools)) {
      const schoolsSheet = XLSX.utils.json_to_sheet(content.schools);
      XLSX.utils.book_append_sheet(workbook, schoolsSheet, 'Schools');
    }
    
    // Add grades sheet
    if (content.grades && Array.isArray(content.grades)) {
      const gradesSheet = XLSX.utils.json_to_sheet(content.grades);
      XLSX.utils.book_append_sheet(workbook, gradesSheet, 'Grades');
    }
    
    // Add attendance sheet
    if (content.attendance && Array.isArray(content.attendance)) {
      const attendanceSheet = XLSX.utils.json_to_sheet(content.attendance);
      XLSX.utils.book_append_sheet(workbook, attendanceSheet, 'Attendance');
    }
    
    // Add financial sheet
    if (content.fees && Array.isArray(content.fees)) {
      const feesSheet = XLSX.utils.json_to_sheet(content.fees);
      XLSX.utils.book_append_sheet(workbook, feesSheet, 'Financial');
    }
    
    // Add transactions sheet
    if (content.transactions && Array.isArray(content.transactions)) {
      const transactionsSheet = XLSX.utils.json_to_sheet(content.transactions);
      XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transactions');
    }
  }

  // Unified export method
  static async exportReport(reportData: EnhancedReportData, options: ExportOptions): Promise<void> {
    if (options.format === 'pdf') {
      await this.generatePDF(reportData, options);
    } else {
      await this.generateExcel(reportData, options);
    }
  }
} 