
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminSchoolsData } from '@/hooks/useAdminSchoolsData';
import { useAdminUsersData } from '@/hooks/useAdminUsersData';

export const useEduFamAnalyticsData = () => {
  const { data: schoolsData = [] } = useAdminSchoolsData(0);
  const { data: usersData = [] } = useAdminUsersData(0);

  return useQuery({
    queryKey: ['edufam-analytics-data'],
    queryFn: async () => {
      // Get monthly revenue data
      const { data: revenueData } = await supabase
        .from('financial_transactions')
        .select('amount, created_at, transaction_type')
        .eq('transaction_type', 'payment')
        .order('created_at', { ascending: false })
        .limit(100);

      // Get grade distribution data
      const { data: gradesData } = await supabase
        .from('grades')
        .select('letter_grade, percentage, created_at')
        .eq('status', 'released')
        .not('letter_grade', 'is', null)
        .limit(500);

      // Get attendance data
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('status, date, school_id')
        .limit(1000);

      // Process monthly revenue trends
      const monthlyRevenue = revenueData?.reduce((acc: Record<string, { month: string; revenue: number; transactions: number }>, transaction: any) => {
        const month = new Date(transaction.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        if (!acc[month]) {
          acc[month] = { month, revenue: 0, transactions: 0 };
        }
        acc[month].revenue += parseFloat(String(transaction.amount || 0));
        acc[month].transactions += 1;
        return acc;
      }, {}) || {};

      const revenueChartData = Object.values(monthlyRevenue).slice(-6);

      // Process grade distribution
      const gradeDistribution = gradesData?.reduce((acc: Record<string, number>, grade: any) => {
        const letter = grade.letter_grade || 'Unknown';
        acc[letter] = (acc[letter] || 0) + 1;
        return acc;
      }, {}) || {};

      const gradesChartData = Object.entries(gradeDistribution).map(([grade, count]) => ({
        grade,
        count: count as number,
        color: getGradeColor(grade)
      }));

      // Process attendance trends (last 6 days)
      const dailyAttendance = attendanceData?.reduce((acc: Record<string, { day: string; present: number; absent: number; total: number }>, record: any) => {
        const day = new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' });
        if (!acc[day]) {
          acc[day] = { day, present: 0, absent: 0, total: 0 };
        }
        acc[day].total++;
        if (record.status === 'present') {
          acc[day].present++;
        } else {
          acc[day].absent++;
        }
        return acc;
      }, {}) || {};

      const attendanceChartData = Object.values(dailyAttendance).map((data) => ({
        ...data,
        rate: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0
      })).slice(-6);

      // Calculate growth data
      const currentMonth = new Date().getMonth();
      const lastMonth = currentMonth - 1;
      
      const currentMonthSchools = schoolsData.filter(school => 
        new Date(school.created_at).getMonth() === currentMonth
      ).length;
      
      const lastMonthSchools = schoolsData.filter(school => 
        new Date(school.created_at).getMonth() === lastMonth
      ).length;

      const schoolsGrowth = lastMonthSchools > 0 
        ? Math.round(((currentMonthSchools - lastMonthSchools) / lastMonthSchools) * 100)
        : 0;

      return {
        revenueChartData,
        gradesChartData,
        attendanceChartData,
        schoolsGrowth,
        totalRevenue: revenueData?.reduce((sum, t) => sum + parseFloat(String(t.amount || 0)), 0) || 0
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
};

const getGradeColor = (grade: string) => {
  const colorMap: Record<string, string> = {
    'A+': '#10b981', 'A': '#059669', 'B+': '#3b82f6', 'B': '#2563eb',
    'C+': '#f59e0b', 'C': '#d97706', 'D+': '#ef4444', 'D': '#dc2626',
    'E': '#6b7280', 'Unknown': '#9ca3af'
  };
  return colorMap[grade] || '#9ca3af';
};
