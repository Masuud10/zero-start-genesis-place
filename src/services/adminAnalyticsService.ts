
import { supabase } from '@/integrations/supabase/client';

export interface SchoolAnalyticsSummary {
  grades: {
    total_submitted: number;
    total_approved: number;
    total_released: number;
    pending_approval: number;
  };
  attendance: {
    total_recorded: number;
    total_present: number;
    total_absent: number;
    attendance_rate: number;
  };
  finance: {
    total_fees_assigned: number;
    total_collected: number;
    outstanding_balance: number;
    collection_rate: number;
  };
  schools: {
    total_schools: number;
    active_schools: number;
    recent_registrations: number;
  };
}

export interface SchoolSummary {
  id: string;
  name: string;
  total_students: number;
  total_teachers: number;
  avg_attendance_rate: number;
  total_fees_collected: number;
  outstanding_fees: number;
}

export class AdminAnalyticsService {
  static async getSystemAnalytics(): Promise<{ data: SchoolAnalyticsSummary | null; error: any }> {
    try {
      console.log('📊 AdminAnalyticsService: Fetching system analytics');

      // Get grades summary
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select('status')
        .not('status', 'is', null);

      if (gradesError) {
        console.error('Error fetching grades data:', gradesError);
      }

      // Get attendance summary
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('status')
        .not('status', 'is', null);

      if (attendanceError) {
        console.error('Error fetching attendance data:', attendanceError);
      }

      // Get finance summary
      const { data: financeData, error: financeError } = await supabase
        .from('fees')
        .select('amount, paid_amount, status')
        .not('amount', 'is', null);

      if (financeError) {
        console.error('Error fetching finance data:', financeError);
      }

      // Get schools summary
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('id, created_at')
        .not('id', 'is', null);

      if (schoolsError) {
        console.error('Error fetching schools data:', schoolsError);
      }

      // Process grades data
      const grades = gradesData || [];
      const gradesSummary = {
        total_submitted: grades.filter(g => g.status === 'submitted').length,
        total_approved: grades.filter(g => g.status === 'approved').length,
        total_released: grades.filter(g => g.status === 'released').length,
        pending_approval: grades.filter(g => g.status === 'submitted').length
      };

      // Process attendance data
      const attendance = attendanceData || [];
      const attendanceSummary = {
        total_recorded: attendance.length,
        total_present: attendance.filter(a => a.status === 'present').length,
        total_absent: attendance.filter(a => a.status === 'absent').length,
        attendance_rate: attendance.length > 0 
          ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100)
          : 0
      };

      // Process finance data
      const finance = financeData || [];
      const totalAssigned = finance.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
      const totalCollected = finance.reduce((sum, f) => sum + (Number(f.paid_amount) || 0), 0);
      const financeSummary = {
        total_fees_assigned: totalAssigned,
        total_collected: totalCollected,
        outstanding_balance: totalAssigned - totalCollected,
        collection_rate: totalAssigned > 0 ? Math.round((totalCollected / totalAssigned) * 100) : 0
      };

      // Process schools data
      const schools = schoolsData || [];
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      const schoolsSummary = {
        total_schools: schools.length,
        active_schools: schools.length, // All schools are considered active for now
        recent_registrations: schools.filter(s => new Date(s.created_at) > thirtyDaysAgo).length
      };

      const analyticsData: SchoolAnalyticsSummary = {
        grades: gradesSummary,
        attendance: attendanceSummary,
        finance: financeSummary,
        schools: schoolsSummary
      };

      console.log('📊 AdminAnalyticsService: Analytics data processed successfully');
      return { data: analyticsData, error: null };

    } catch (error: any) {
      console.error('📊 AdminAnalyticsService: Error fetching analytics:', error);
      return { data: null, error };
    }
  }

  static async getSchoolsSummary(): Promise<{ data: SchoolSummary[] | null; error: any }> {
    try {
      console.log('📊 AdminAnalyticsService: Fetching schools summary');

      // Fix the Supabase query by selecting schools with students and profiles separately
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name');

      if (schoolsError) {
        console.error('Error fetching schools summary:', schoolsError);
        return { data: null, error: schoolsError };
      }

      const schoolsSummary: SchoolSummary[] = [];

      for (const school of schoolsData || []) {
        // Get students count for this school
        const { data: studentsData } = await supabase
          .from('students')
          .select('id')
          .eq('school_id', school.id);

        // Get teachers count for this school
        const { data: teachersData } = await supabase
          .from('profiles')
          .select('id')
          .eq('school_id', school.id)
          .eq('role', 'teacher');

        // Get attendance rate for this school
        const { data: attendanceData } = await supabase
          .from('attendance')
          .select('status')
          .eq('school_id', school.id);

        const totalAttendance = attendanceData?.length || 0;
        const presentCount = attendanceData?.filter(a => a.status === 'present').length || 0;
        const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

        // Get finance data for this school
        const { data: financeData } = await supabase
          .from('fees')
          .select('amount, paid_amount')
          .eq('school_id', school.id);

        const totalCollected = financeData?.reduce((sum, f) => sum + (Number(f.paid_amount) || 0), 0) || 0;
        const totalAssigned = financeData?.reduce((sum, f) => sum + (Number(f.amount) || 0), 0) || 0;
        const outstandingFees = totalAssigned - totalCollected;

        schoolsSummary.push({
          id: school.id,
          name: school.name,
          total_students: studentsData?.length || 0,
          total_teachers: teachersData?.length || 0,
          avg_attendance_rate: attendanceRate,
          total_fees_collected: totalCollected,
          outstanding_fees: outstandingFees
        });
      }

      console.log('📊 AdminAnalyticsService: Schools summary processed successfully');
      return { data: schoolsSummary, error: null };

    } catch (error: any) {
      console.error('📊 AdminAnalyticsService: Error fetching schools summary:', error);
      return { data: null, error };
    }
  }
}
