import { supabase } from '@/integrations/supabase/client';

interface MultiTenantAnalyticsConfig {
  enforceStrictTenancy: boolean;
  allowCrossTenantQueries: boolean;
  auditAccess: boolean;
}

interface GradeData {
  percentage?: number;
  score?: number;
  subjects?: { name: string } | { error: true } & string;
  letter_grade?: string;
  created_at: string;
  subject_id: string;
}

interface AttendanceData {
  status: string;
  date: string;
  student_id: string;
  created_at?: string;
}

interface StudentData {
  id: string;
  name: string;
  class_id: string;
  created_at: string;
}

interface FeeData {
  amount: number;
  paid_amount: number;
  status: string;
  category: string;
  created_at: string;
}

interface AnalyticsData {
  grades: GradeData[];
  attendance: AttendanceData[];
  students: StudentData[];
  fees: FeeData[];
}

interface SubjectPerformance {
  average: number;
  count: number;
}

interface MonthlyTrends {
  grades: { change: number; direction: 'up' | 'down' | 'stable' };
  attendance: { change: number; direction: 'up' | 'down' | 'stable' };
}

interface AnalyticsSummary {
  totalStudents: number;
  totalGrades: number;
  averageGrade: number;
  attendanceRate: number;
  totalFees: number;
  collectedFees: number;
  feeCollectionRate: number;
  subjectPerformance: Record<string, SubjectPerformance>;
  gradeDistribution: Record<string, number>;
  monthlyTrends: MonthlyTrends;
  lastUpdated: string;
}

export class MultiTenantAnalyticsService {
  private static instance: MultiTenantAnalyticsService;
  private config: MultiTenantAnalyticsConfig = {
    enforceStrictTenancy: true,
    allowCrossTenantQueries: false,
    auditAccess: true
  };

  static getInstance(): MultiTenantAnalyticsService {
    if (!MultiTenantAnalyticsService.instance) {
      MultiTenantAnalyticsService.instance = new MultiTenantAnalyticsService();
    }
    return MultiTenantAnalyticsService.instance;
  }

  private constructor() {}

  async validateSchoolAccess(requestedSchoolId: string, userSchoolId?: string, userRole?: string): Promise<boolean> {
    // System admins can access any school
    if (userRole === 'elimisha_admin' || userRole === 'edufam_admin') {
      if (this.config.auditAccess) {
        await this.auditAccess('system_admin_access', requestedSchoolId, userRole);
      }
      return true;
    }

    // School users can only access their own school
    if (userSchoolId && userSchoolId === requestedSchoolId) {
      if (this.config.auditAccess) {
        await this.auditAccess('school_user_access', requestedSchoolId, userRole);
      }
      return true;
    }

    // Access denied
    if (this.config.auditAccess) {
      await this.auditAccess('access_denied', requestedSchoolId, userRole, 'School access violation');
    }
    
    return false;
  }

  private async auditAccess(
    accessType: string, 
    schoolId: string, 
    userRole?: string, 
    details?: string
  ): Promise<void> {
    try {
      await supabase
        .from('analytics_events')
        .insert({
          event_type: 'analytics_access',
          event_category: 'security',
          school_id: schoolId,
          metadata: {
            access_type: accessType,
            user_role: userRole,
            details,
            timestamp: new Date().toISOString(),
            client_info: navigator.userAgent
          }
        });
    } catch (error) {
      console.error('Failed to audit analytics access:', error);
    }
  }

  async getSchoolAnalytics(
    schoolId: string,
    userSchoolId?: string,
    userRole?: string,
    filters?: {
      startDate?: string;
      endDate?: string;
      categories?: string[];
    }
  ) {
    // Validate access with strict multi-tenancy
    const hasAccess = await this.validateSchoolAccess(schoolId, userSchoolId, userRole);
    if (!hasAccess) {
      throw new Error('Insufficient permissions to access school analytics');
    }

    try {
      console.log('🔍 Fetching analytics for school:', schoolId);
      
      // Fetch real-time data with proper school isolation
      const [gradesData, attendanceData, studentsData, feesData] = await Promise.all([
        // Grades analytics
        supabase
          .from('grades')
          .select(`
            score,
            percentage,
            letter_grade,
            created_at,
            subject_id,
            subjects!inner(name)
          `)
          .eq('school_id', schoolId)
          .eq('status', 'released')
          .not('score', 'is', null)
          .gte('created_at', filters?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .lte('created_at', filters?.endDate || new Date().toISOString()),

        // Attendance analytics
        supabase
          .from('attendance')
          .select('status, date, student_id')
          .eq('school_id', schoolId)
          .gte('date', filters?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .lte('date', filters?.endDate || new Date().toISOString().split('T')[0]),

        // Student analytics
        supabase
          .from('students')
          .select('id, name, class_id, created_at')
          .eq('school_id', schoolId)
          .eq('is_active', true),

        // Financial analytics
        supabase
          .from('fees')
          .select('amount, paid_amount, status, category, created_at')
          .eq('school_id', schoolId)
          .gte('created_at', filters?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .lte('created_at', filters?.endDate || new Date().toISOString())
      ]);

      if (gradesData.error) {
        console.error('Grades data error:', gradesData.error);
        throw gradesData.error;
      }
      if (attendanceData.error) {
        console.error('Attendance data error:', attendanceData.error);
        throw attendanceData.error;
      }
      if (studentsData.error) {
        console.error('Students data error:', studentsData.error);
        throw studentsData.error;
      }
      if (feesData.error) {
        console.error('Fees data error:', feesData.error);
        throw feesData.error;
      }

      return this.processAnalyticsData({
        grades: gradesData.data || [],
        attendance: attendanceData.data || [],
        students: studentsData.data || [],
        fees: feesData.data || []
      });

    } catch (error) {
      console.error('Failed to fetch school analytics:', error);
      throw error;
    }
  }

  private processAnalyticsData(data: AnalyticsData): AnalyticsSummary {
    const summary: AnalyticsSummary = {
      totalStudents: data.students.length,
      totalGrades: data.grades.length,
      averageGrade: data.grades.length > 0 
        ? data.grades.reduce((sum, g) => sum + (g.percentage || g.score || 0), 0) / data.grades.length 
        : 0,
      attendanceRate: data.attendance.length > 0
        ? (data.attendance.filter(a => a.status === 'present').length / data.attendance.length) * 100
        : 0,
      totalFees: data.fees.reduce((sum, f) => sum + (f.amount || 0), 0),
      collectedFees: data.fees.reduce((sum, f) => sum + (f.paid_amount || 0), 0),
      feeCollectionRate: 0,
      
      // Subject breakdown
      subjectPerformance: {} as Record<string, SubjectPerformance>,
      
      // Grade distribution
      gradeDistribution: {} as Record<string, number>,
      
      // Monthly trends
      monthlyTrends: this.calculateMonthlyTrends(data.grades, data.attendance),
      
      lastUpdated: new Date().toISOString()
    };

    // Calculate fee collection rate
    summary.feeCollectionRate = summary.totalFees > 0 
      ? (summary.collectedFees / summary.totalFees) * 100 
      : 0;

    // Process subject performance
    data.grades.forEach(grade => {
      const subjectName = typeof grade.subjects === 'object' && 'name' in grade.subjects 
        ? grade.subjects.name 
        : 'Unknown';
      if (!summary.subjectPerformance[subjectName]) {
        summary.subjectPerformance[subjectName] = { average: 0, count: 0 };
      }
      summary.subjectPerformance[subjectName].average += (grade.percentage || grade.score || 0);
      summary.subjectPerformance[subjectName].count += 1;
    });

    // Calculate averages for subjects
    Object.keys(summary.subjectPerformance).forEach(subject => {
      const perf = summary.subjectPerformance[subject];
      perf.average = perf.count > 0 ? perf.average / perf.count : 0;
    });

    // Process grade distribution
    data.grades.forEach(grade => {
      const letter = grade.letter_grade || 'N/A';
      summary.gradeDistribution[letter] = (summary.gradeDistribution[letter] || 0) + 1;
    });

    return summary;
  }

  private calculateMonthlyTrends(grades: GradeData[], attendance: AttendanceData[]): MonthlyTrends {
    const trends: MonthlyTrends = {
      grades: this.calculateTrend(grades, 'grades'),
      attendance: this.calculateTrend(attendance, 'attendance')
    };

    return trends;
  }

  private calculateTrend(events: (GradeData | AttendanceData)[], category: string): { change: number; direction: 'up' | 'down' | 'stable' } {
    if (events.length < 2) {
      return { change: 0, direction: 'stable' };
    }

    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previousWeek = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const recentEvents = events.filter(e => {
      const eventDate = new Date(e.created_at || (e as AttendanceData).date);
      return eventDate >= lastWeek;
    });

    const previousEvents = events.filter(e => {
      const eventDate = new Date(e.created_at || (e as AttendanceData).date);
      return eventDate >= previousWeek && eventDate < lastWeek;
    });

    if (previousEvents.length === 0) {
      return { change: recentEvents.length > 0 ? 100 : 0, direction: recentEvents.length > 0 ? 'up' : 'stable' };
    }

    const change = ((recentEvents.length - previousEvents.length) / previousEvents.length) * 100;
    const direction = change > 5 ? 'up' : change < -5 ? 'down' : 'stable';

    return { change: Math.abs(change), direction };
  }

  async getSystemWidePulse(userRole?: string) {
    // Only system admins can access system-wide data
    if (userRole !== 'elimisha_admin' && userRole !== 'edufam_admin') {
      throw new Error('Insufficient permissions for system-wide analytics');
    }

    try {
      const { data: schools, error } = await supabase
        .from('schools')
        .select('id, name')
        .eq('status', 'active');

      if (error) throw error;

      const schoolMetrics = new Map();
      
      for (const school of schools || []) {
        try {
          const analytics = await this.getSchoolAnalytics(school.id, undefined, userRole);
          schoolMetrics.set(school.id, {
            ...analytics,
            schoolName: school.name
          });
        } catch (error) {
          console.warn(`Failed to fetch analytics for school ${school.name}:`, error);
        }
      }

      return {
        totalSchools: schoolMetrics.size,
        schoolMetrics: Object.fromEntries(schoolMetrics),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to fetch system-wide analytics:', error);
      throw error;
    }
  }
}

export const multiTenantAnalyticsService = MultiTenantAnalyticsService.getInstance();
