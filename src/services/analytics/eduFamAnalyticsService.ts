
import { supabase } from '@/integrations/supabase/client';

export interface EduFamAnalyticsSummary {
  grades: {
    total_grades: number;
    average_grade: number;
    schools_with_grades: number;
  };
  attendance: {
    total_records: number;
    average_attendance_rate: number;
    schools_with_attendance: number;
  };
  finance: {
    total_collected: number;
    total_outstanding: number;
    schools_with_finance: number;
  };
  schools: {
    total_schools: number;
    active_schools: number;
  };
}

export class EduFamAnalyticsService {
  static async getSystemAnalytics(): Promise<{ data: EduFamAnalyticsSummary | null; error: any }> {
    try {
      console.log('📊 EduFamAnalyticsService: Fetching system-wide analytics');

      // Get schools count
      const { count: totalSchools, error: schoolsError } = await supabase
        .from('schools')
        .select('id', { count: 'exact', head: true });

      if (schoolsError) {
        console.error('Error fetching schools count:', schoolsError);
        throw schoolsError;
      }

      // Get grades analytics
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select('score, school_id')
        .eq('status', 'released')
        .not('score', 'is', null);

      if (gradesError) {
        console.error('Error fetching grades data:', gradesError);
        throw gradesError;
      }

      // Get attendance analytics
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('status, school_id')
        .not('status', 'is', null);

      if (attendanceError) {
        console.error('Error fetching attendance data:', attendanceError);
        throw attendanceError;
      }

      // Get finance analytics
      const { data: financeData, error: financeError } = await supabase
        .from('fees')
        .select('amount, paid_amount, school_id')
        .not('amount', 'is', null);

      if (financeError) {
        console.error('Error fetching finance data:', financeError);
        throw financeError;
      }

      // Process grades data
      const grades = gradesData || [];
      const gradesAnalytics = {
        total_grades: grades.length,
        average_grade: grades.length > 0 
          ? grades.reduce((sum, g) => sum + (g.score || 0), 0) / grades.length 
          : 0,
        schools_with_grades: new Set(grades.map(g => g.school_id)).size
      };

      // Process attendance data
      const attendance = attendanceData || [];
      const presentCount = attendance.filter(a => a.status === 'present').length;
      const attendanceAnalytics = {
        total_records: attendance.length,
        average_attendance_rate: attendance.length > 0 
          ? (presentCount / attendance.length) * 100 
          : 0,
        schools_with_attendance: new Set(attendance.map(a => a.school_id)).size
      };

      // Process finance data
      const finance = financeData || [];
      const totalAssigned = finance.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
      const totalCollected = finance.reduce((sum, f) => sum + (Number(f.paid_amount) || 0), 0);
      const financeAnalytics = {
        total_collected: totalCollected,
        total_outstanding: totalAssigned - totalCollected,
        schools_with_finance: new Set(finance.map(f => f.school_id)).size
      };

      const analyticsData: EduFamAnalyticsSummary = {
        grades: gradesAnalytics,
        attendance: attendanceAnalytics,
        finance: financeAnalytics,
        schools: {
          total_schools: totalSchools || 0,
          active_schools: totalSchools || 0
        }
      };

      console.log('📊 EduFamAnalyticsService: Analytics processed successfully');
      return { data: analyticsData, error: null };

    } catch (error: any) {
      console.error('📊 EduFamAnalyticsService: Error fetching analytics:', error);
      return { data: null, error };
    }
  }
}
