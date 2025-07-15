import { supabase } from '@/integrations/supabase/client';

interface AttendanceRecord {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  session: 'morning' | 'afternoon' | 'full-day';
  school_id: string;
  academic_year: string;
  term: string;
}

interface AttendanceSummaryData {
  overall_attendance_percentage: number;
  total_students: number;
  total_school_days: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  excused_count: number;
  trend: string;
  weekly_trends: WeeklyTrend[];
  class_summaries: ClassAttendanceSummary[];
}

interface WeeklyTrend {
  week_start: string;
  week_end: string;
  attendance_rate: number;
  trend_direction: 'up' | 'down' | 'stable';
}

interface ClassAttendanceSummary {
  class_id: string;
  class_name: string;
  student_count: number;
  attendance_rate: number;
  chronic_absentees: number;
  perfect_attendance: number;
}

export class AttendanceBusinessLogic {
  private schoolId: string;

  constructor(schoolId: string) {
    this.schoolId = schoolId;
  }

  /**
   * Calculate comprehensive attendance summary for admin dashboard
   */
  async calculateAttendanceSummary(dateRange?: { start: string; end: string }): Promise<AttendanceSummaryData> {
    try {
      // Get base attendance data
      const baseQuery = supabase
        .from('attendance')
        .select(`
          id,
          student_id,
          class_id,
          date,
          status,
          session,
          academic_year,
          term,
          classes!inner(name),
          students!inner(name)
        `)
        .eq('school_id', this.schoolId);

      if (dateRange) {
        baseQuery.gte('date', dateRange.start).lte('date', dateRange.end);
      }

      const { data: attendanceData, error } = await baseQuery;

      if (error) throw error;
      if (!attendanceData) throw new Error('No attendance data found');

      // Calculate overall statistics
      const totalRecords = attendanceData.length;
      const presentCount = attendanceData.filter(r => r.status === 'present').length;
      const absentCount = attendanceData.filter(r => r.status === 'absent').length;
      const lateCount = attendanceData.filter(r => r.status === 'late').length;
      const excusedCount = attendanceData.filter(r => r.status === 'excused').length;

      const overallAttendancePercentage = totalRecords > 0 
        ? Math.round((presentCount + lateCount) / totalRecords * 100) 
        : 0;

      // Calculate unique school days and students
      const uniqueDates = new Set(attendanceData.map(r => r.date));
      const uniqueStudents = new Set(attendanceData.map(r => r.student_id));

      // Calculate weekly trends
      const weeklyTrends = await this.calculateWeeklyTrends(attendanceData);

      // Calculate class summaries
      const classSummaries = await this.calculateClassSummaries(attendanceData);

      // Determine trend direction
      const trend = this.calculateTrendDirection(weeklyTrends);

      return {
        overall_attendance_percentage: overallAttendancePercentage,
        total_students: uniqueStudents.size,
        total_school_days: uniqueDates.size,
        present_count: presentCount,
        absent_count: absentCount,
        late_count: lateCount,
        excused_count: excusedCount,
        trend,
        weekly_trends: weeklyTrends,
        class_summaries: classSummaries
      };

    } catch (error) {
      console.error('Error calculating attendance summary:', error);
      throw error;
    }
  }

  /**
   * Calculate weekly attendance trends
   */
  private async calculateWeeklyTrends(attendanceData: any[]): Promise<WeeklyTrend[]> {
    // Group data by week
    const weeklyData = new Map<string, any[]>();
    
    attendanceData.forEach(record => {
      const date = new Date(record.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData.has(weekKey)) {
        weeklyData.set(weekKey, []);
      }
      weeklyData.get(weekKey)!.push(record);
    });

    const trends: WeeklyTrend[] = [];
    
    for (const [weekStart, records] of weeklyData) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const presentCount = records.filter(r => r.status === 'present' || r.status === 'late').length;
      const attendanceRate = records.length > 0 ? Math.round(presentCount / records.length * 100) : 0;
      
      trends.push({
        week_start: weekStart,
        week_end: weekEnd.toISOString().split('T')[0],
        attendance_rate: attendanceRate,
        trend_direction: 'stable' // Will be calculated relative to previous weeks
      });
    }

    // Sort by week and calculate trend directions
    trends.sort((a, b) => a.week_start.localeCompare(b.week_start));
    
    for (let i = 1; i < trends.length; i++) {
      const current = trends[i].attendance_rate;
      const previous = trends[i - 1].attendance_rate;
      const difference = current - previous;
      
      if (difference > 2) {
        trends[i].trend_direction = 'up';
      } else if (difference < -2) {
        trends[i].trend_direction = 'down';
      } else {
        trends[i].trend_direction = 'stable';
      }
    }

    return trends.slice(-8); // Return last 8 weeks
  }

  /**
   * Calculate class-specific attendance summaries
   */
  private async calculateClassSummaries(attendanceData: any[]): Promise<ClassAttendanceSummary[]> {
    const classData = new Map<string, any[]>();
    
    // Group by class
    attendanceData.forEach(record => {
      const classId = record.class_id;
      if (!classData.has(classId)) {
        classData.set(classId, []);
      }
      classData.get(classId)!.push(record);
    });

    const summaries: ClassAttendanceSummary[] = [];

    for (const [classId, records] of classData) {
      const className = records[0]?.classes?.name || 'Unknown Class';
      const uniqueStudents = new Set(records.map(r => r.student_id));
      const presentCount = records.filter(r => r.status === 'present' || r.status === 'late').length;
      const attendanceRate = records.length > 0 ? Math.round(presentCount / records.length * 100) : 0;

      // Calculate chronic absentees (students with <80% attendance)
      const studentAttendance = new Map<string, { total: number; present: number }>();
      
      records.forEach(record => {
        const studentId = record.student_id;
        if (!studentAttendance.has(studentId)) {
          studentAttendance.set(studentId, { total: 0, present: 0 });
        }
        const stats = studentAttendance.get(studentId)!;
        stats.total++;
        if (record.status === 'present' || record.status === 'late') {
          stats.present++;
        }
      });

      let chronicAbsentees = 0;
      let perfectAttendance = 0;

      for (const [_, stats] of studentAttendance) {
        const rate = stats.total > 0 ? stats.present / stats.total : 0;
        if (rate < 0.8) chronicAbsentees++;
        if (rate === 1.0) perfectAttendance++;
      }

      summaries.push({
        class_id: classId,
        class_name: className,
        student_count: uniqueStudents.size,
        attendance_rate: attendanceRate,
        chronic_absentees: chronicAbsentees,
        perfect_attendance: perfectAttendance
      });
    }

    return summaries.sort((a, b) => a.class_name.localeCompare(b.class_name));
  }

  /**
   * Calculate overall trend direction
   */
  private calculateTrendDirection(weeklyTrends: WeeklyTrend[]): string {
    if (weeklyTrends.length < 2) return 'stable';

    const recentTrends = weeklyTrends.slice(-4); // Last 4 weeks
    const upCount = recentTrends.filter(t => t.trend_direction === 'up').length;
    const downCount = recentTrends.filter(t => t.trend_direction === 'down').length;

    if (upCount > downCount + 1) return 'improving';
    if (downCount > upCount + 1) return 'declining';
    return 'stable';
  }

  /**
   * Get attendance alerts and notifications
   */
  async getAttendanceAlerts(): Promise<{
    chronic_absenteeism: number;
    declining_classes: string[];
    perfect_attendance_students: number;
  }> {
    try {
      const summary = await this.calculateAttendanceSummary();
      
      const chronicAbsenteeism = summary.class_summaries.reduce((sum, cls) => sum + cls.chronic_absentees, 0);
      const decliningClasses = summary.class_summaries
        .filter(cls => cls.attendance_rate < 75)
        .map(cls => cls.class_name);
      const perfectAttendanceStudents = summary.class_summaries.reduce((sum, cls) => sum + cls.perfect_attendance, 0);

      return {
        chronic_absenteeism: chronicAbsenteeism,
        declining_classes: decliningClasses,
        perfect_attendance_students: perfectAttendanceStudents
      };
    } catch (error) {
      console.error('Error getting attendance alerts:', error);
      throw error;
    }
  }

  /**
   * Generate attendance insights for dashboard
   */
  async generateAttendanceInsights(): Promise<{
    key_metrics: Record<string, number>;
    recommendations: string[];
    trends: string[];
  }> {
    try {
      const summary = await this.calculateAttendanceSummary();
      const alerts = await this.getAttendanceAlerts();

      const keyMetrics = {
        overall_rate: summary.overall_attendance_percentage,
        total_students: summary.total_students,
        chronic_absentees: alerts.chronic_absenteeism,
        perfect_attendance: alerts.perfect_attendance_students
      };

      const recommendations: string[] = [];
      const trends: string[] = [];

      // Generate recommendations based on data
      if (summary.overall_attendance_percentage < 85) {
        recommendations.push('Consider implementing attendance improvement initiatives');
      }
      if (alerts.chronic_absenteeism > summary.total_students * 0.1) {
        recommendations.push('Review chronic absenteeism intervention strategies');
      }
      if (alerts.declining_classes.length > 0) {
        recommendations.push(`Focus on improving attendance in: ${alerts.declining_classes.join(', ')}`);
      }

      // Generate trend observations
      trends.push(`Overall attendance trend: ${summary.trend}`);
      if (summary.weekly_trends.length > 0) {
        const latestRate = summary.weekly_trends[summary.weekly_trends.length - 1].attendance_rate;
        trends.push(`Current weekly rate: ${latestRate}%`);
      }

      return {
        key_metrics: keyMetrics,
        recommendations,
        trends
      };
    } catch (error) {
      console.error('Error generating attendance insights:', error);
      throw error;
    }
  }
}