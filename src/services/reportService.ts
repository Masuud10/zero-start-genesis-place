import { supabase } from '@/integrations/supabase/client';
import { ReportData, SchoolInfo } from '@/types/report';

export class ReportService {
  private static async getSchoolInfo(schoolId: string): Promise<SchoolInfo> {
    const { data: school } = await supabase
      .from('schools')
      .select('name, logo_url, address, phone, email')
      .eq('id', schoolId)
      .single();

    return {
      name: school?.name || 'School',
      logo: school?.logo_url,
      address: school?.address,
      phone: school?.phone,
      email: school?.email,
    };
  }

  // Teacher Reports
  static async generateClassPerformanceReport(classId: string, schoolId: string): Promise<ReportData> {
    const schoolInfo = await this.getSchoolInfo(schoolId);
    
    const { data: grades } = await supabase
      .from('grades')
      .select(`
        *,
        student:students(name, admission_number),
        subject:subjects(name, code)
      `)
      .eq('class_id', classId)
      .eq('school_id', schoolId);

    return {
      id: `class-performance-${Date.now()}`,
      title: 'Class Performance Report',
      generatedAt: new Date().toISOString(),
      schoolInfo,
      content: { grades }
    };
  }

  static async generateSubjectPerformanceReport(subjectId: string, schoolId: string): Promise<ReportData> {
    const schoolInfo = await this.getSchoolInfo(schoolId);
    
    const { data: grades } = await supabase
      .from('grades')
      .select(`
        *,
        student:students(name, admission_number),
        class:classes(name)
      `)
      .eq('subject_id', subjectId)
      .eq('school_id', schoolId);

    return {
      id: `subject-performance-${Date.now()}`,
      title: 'Subject Performance Report',
      generatedAt: new Date().toISOString(),
      schoolInfo,
      content: { grades }
    };
  }

  // Principal Reports
  static async generateStudentReport(studentId: string, schoolId: string): Promise<ReportData> {
    const schoolInfo = await this.getSchoolInfo(schoolId);
    
    const { data: student } = await supabase
      .from('students')
      .select(`
        *,
        grades:grades(*),
        attendance:attendance(*),
        fees:fees(*)
      `)
      .eq('id', studentId)
      .eq('school_id', schoolId)
      .single();

    return {
      id: `student-report-${Date.now()}`,
      title: 'Individual Student Report',
      generatedAt: new Date().toISOString(),
      schoolInfo,
      content: { student }
    };
  }

  // Finance Reports
  static async generateFeeCollectionReport(schoolId: string, startDate: string, endDate: string): Promise<ReportData> {
    const schoolInfo = await this.getSchoolInfo(schoolId);
    
    const { data: transactions } = await supabase
      .from('financial_transactions')
      .select(`
        *,
        student:students(name, admission_number)
      `)
      .eq('school_id', schoolId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    return {
      id: `fee-collection-${Date.now()}`,
      title: 'Fee Collection Report',
      generatedAt: new Date().toISOString(),
      schoolInfo,
      content: { transactions }
    };
  }

  // Parent Reports
  static async generateStudentAcademicReport(studentId: string): Promise<ReportData> {
    const { data: student } = await supabase
      .from('students')
      .select(`
        *,
        grades:grades(*),
        attendance:attendance(*)
      `)
      .eq('id', studentId)
      .single();

    const { data: school } = await supabase
      .from('schools')
      .select('name, logo_url, address, phone, email')
      .eq('id', student?.school_id)
      .single();

    const schoolInfo: SchoolInfo = {
      name: school?.name || 'School',
      logo: school?.logo_url,
      address: school?.address,
      phone: school?.phone,
      email: school?.email,
    };

    return {
      id: `student-academic-${Date.now()}`,
      title: 'Student Academic Report',
      generatedAt: new Date().toISOString(),
      schoolInfo,
      content: { student }
    };
  }

  // System Reports
  static async generateSystemOverviewReport(): Promise<ReportData> {
    const { data: schools } = await supabase.from('schools').select('*');
    const { data: users } = await supabase.from('profiles').select('*');
    
    return {
      id: `system-overview-${Date.now()}`,
      title: 'System Overview Report',
      generatedAt: new Date().toISOString(),
      schoolInfo: { name: 'EduFam System' },
      content: { schools, users }
    };
  }
}