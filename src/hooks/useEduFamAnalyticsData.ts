
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface EduFamAnalyticsData {
  gradesChartData: Array<{
    grade_range: string;
    count: number;
  }>;
  revenueChartData: Array<{
    month: string;
    revenue: number;
  }>;
  attendanceChartData: Array<{
    week: string;
    attendance_rate: number;
  }>;
  totalRevenue: number;
}

export const useEduFamAnalyticsData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['edufam-analytics'],
    queryFn: async (): Promise<EduFamAnalyticsData> => {
      console.log('📊 Fetching EduFam analytics data');

      // Fetch grades data across all schools
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select('score, percentage')
        .eq('status', 'released')
        .not('score', 'is', null);

      if (gradesError) {
        console.error('Error fetching grades:', gradesError);
        throw gradesError;
      }

      // Fetch financial transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('financial_transactions')
        .select('amount, processed_at')
        .eq('transaction_type', 'payment')
        .gte('processed_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
        throw transactionsError;
      }

      // Fetch attendance data
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('status, date')
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      if (attendanceError) {
        console.error('Error fetching attendance:', attendanceError);
        throw attendanceError;
      }

      // Process grades data for chart
      const gradeRanges = {
        'A (80-100%)': 0,
        'B (60-79%)': 0,
        'C (40-59%)': 0,
        'D (20-39%)': 0,
        'E (0-19%)': 0
      };

      gradesData?.forEach(grade => {
        const score = grade.percentage || grade.score || 0;
        if (score >= 80) gradeRanges['A (80-100%)']++;
        else if (score >= 60) gradeRanges['B (60-79%)']++;
        else if (score >= 40) gradeRanges['C (40-59%)']++;
        else if (score >= 20) gradeRanges['D (20-39%)']++;
        else gradeRanges['E (0-19%)']++;
      });

      const gradesChartData = Object.entries(gradeRanges).map(([grade_range, count]) => ({
        grade_range,
        count
      }));

      // Process revenue data by month
      const monthlyRevenue = new Map();
      transactionsData?.forEach(transaction => {
        const month = new Date(transaction.processed_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        monthlyRevenue.set(month, (monthlyRevenue.get(month) || 0) + Number(transaction.amount));
      });

      const revenueChartData = Array.from(monthlyRevenue.entries()).map(([month, revenue]) => ({
        month,
        revenue: Number(revenue)
      }));

      // Process attendance data by week
      const weeklyAttendance = new Map();
      attendanceData?.forEach(record => {
        const week = `Week ${Math.ceil(new Date(record.date).getDate() / 7)}`;
        if (!weeklyAttendance.has(week)) {
          weeklyAttendance.set(week, { present: 0, total: 0 });
        }
        const weekData = weeklyAttendance.get(week);
        weekData.total++;
        if (record.status === 'present') weekData.present++;
      });

      const attendanceChartData = Array.from(weeklyAttendance.entries()).map(([week, data]) => ({
        week,
        attendance_rate: data.total > 0 ? (data.present / data.total) * 100 : 0
      }));

      const totalRevenue = transactionsData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      return {
        gradesChartData,
        revenueChartData,
        attendanceChartData,
        totalRevenue
      };
    },
    enabled: user?.role === 'edufam_admin',
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
