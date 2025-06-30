
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useEduFamSystemAnalytics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['edufam-system-analytics'],
    queryFn: async () => {
      console.log('🔄 Fetching EduFam system analytics...');
      
      try {
        // Fetch overall system metrics
        const [gradesResult, attendanceResult, financeResult] = await Promise.all([
          // Grades analytics
          supabase
            .from('grades')
            .select('score, percentage, school_id, created_at')
            .not('score', 'is', null),
          
          // Attendance analytics
          supabase
            .from('attendance')
            .select('status, school_id, date'),
          
          // Finance analytics
          supabase
            .from('fees')
            .select('amount, paid_amount, school_id, created_at')
        ]);

        if (gradesResult.error) throw gradesResult.error;
        if (attendanceResult.error) throw attendanceResult.error;
        if (financeResult.error) throw financeResult.error;

        const grades = gradesResult.data || [];
        const attendance = attendanceResult.data || [];
        const fees = financeResult.data || [];

        // Calculate grades analytics
        const schoolGrades = grades.reduce((acc, grade) => {
          if (!acc[grade.school_id]) {
            acc[grade.school_id] = [];
          }
          acc[grade.school_id].push(grade.percentage || grade.score || 0);
          return acc;
        }, {} as Record<string, number[]>);

        const gradesAnalytics = {
          total_grades: grades.length,
          schools_with_grades: Object.keys(schoolGrades).length,
          average_grade: grades.length > 0 
            ? grades.reduce((sum, g) => sum + (g.percentage || g.score || 0), 0) / grades.length 
            : 0
        };

        // Calculate attendance analytics
        const schoolAttendance = attendance.reduce((acc, record) => {
          if (!acc[record.school_id]) {
            acc[record.school_id] = { total: 0, present: 0 };
          }
          acc[record.school_id].total++;
          if (record.status === 'present') {
            acc[record.school_id].present++;
          }
          return acc;
        }, {} as Record<string, { total: number; present: number }>);

        const attendanceAnalytics = {
          total_records: attendance.length,
          schools_with_attendance: Object.keys(schoolAttendance).length,
          average_attendance_rate: Object.values(schoolAttendance).length > 0
            ? Object.values(schoolAttendance).reduce((sum, school) => 
                sum + (school.total > 0 ? (school.present / school.total) * 100 : 0), 0
              ) / Object.values(schoolAttendance).length
            : 0
        };

        // Calculate finance analytics
        const schoolFinance = fees.reduce((acc, fee) => {
          if (!acc[fee.school_id]) {
            acc[fee.school_id] = { total: 0, collected: 0 };
          }
          acc[fee.school_id].total += fee.amount || 0;
          acc[fee.school_id].collected += fee.paid_amount || 0;
          return acc;
        }, {} as Record<string, { total: number; collected: number }>);

        const financeAnalytics = {
          schools_with_finance: Object.keys(schoolFinance).length,
          total_collected: Object.values(schoolFinance).reduce((sum, school) => sum + school.collected, 0),
          total_outstanding: Object.values(schoolFinance).reduce((sum, school) => sum + (school.total - school.collected), 0)
        };

        return {
          grades: gradesAnalytics,
          attendance: attendanceAnalytics,
          finance: financeAnalytics,
          last_updated: new Date().toISOString()
        };
        
      } catch (error) {
        console.error('❌ Error fetching EduFam system analytics:', error);
        throw error;
      }
    },
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
    meta: {
      errorMessage: 'Failed to load system analytics'
    }
  });
};
