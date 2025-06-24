
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useEduFamAnalyticsData = () => {
  return useQuery({
    queryKey: ['edufam-analytics'],
    queryFn: async () => {
      // Fetch real data from Supabase
      const [gradesResult, revenueResult, attendanceResult] = await Promise.all([
        supabase.from('grades').select('letter_grade'),
        supabase.from('fees').select('amount, paid_amount, created_at'),
        supabase.from('attendance').select('status, date')
      ]);

      // Process grades data
      const gradesChartData = gradesResult.data?.reduce((acc: any, grade: any) => {
        const existing = acc.find((item: any) => item.name === grade.letter_grade);
        if (existing) {
          existing.value++;
        } else {
          acc.push({ name: grade.letter_grade || 'Unknown', value: 1 });
        }
        return acc;
      }, []) || [];

      // Process revenue data
      const revenueByMonth = revenueResult.data?.reduce((acc: any, fee: any) => {
        const month = new Date(fee.created_at).toLocaleDateString('en-US', { month: 'short' });
        const existing = acc.find((item: any) => item.month === month);
        const amount = fee.paid_amount || 0;
        
        if (existing) {
          existing.revenue += amount;
        } else {
          acc.push({ month, revenue: amount });
        }
        return acc;
      }, []) || [];

      const totalRevenue = revenueResult.data?.reduce((sum: number, fee: any) => 
        sum + (fee.paid_amount || 0), 0) || 0;

      // Process attendance data
      const attendanceByDay = attendanceResult.data?.reduce((acc: any, record: any) => {
        const day = new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' });
        const existing = acc.find((item: any) => item.day === day);
        
        if (existing) {
          existing.total++;
          if (record.status === 'present') existing.present++;
        } else {
          acc.push({ 
            day, 
            total: 1, 
            present: record.status === 'present' ? 1 : 0,
            attendance: 0
          });
        }
        return acc;
      }, []) || [];

      // Calculate attendance percentages
      const attendanceChartData = attendanceByDay.map((item: any) => ({
        ...item,
        attendance: item.total > 0 ? Math.round((item.present / item.total) * 100) : 0
      }));

      return {
        gradesChartData,
        revenueChartData: revenueByMonth,
        totalRevenue,
        attendanceChartData
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
