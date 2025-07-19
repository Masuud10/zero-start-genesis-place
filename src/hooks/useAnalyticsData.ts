
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsData {
  totalUsers: number;
  totalSchools: number;
  totalRevenue: number;
  totalTransactions: number;
  userGrowth: {
    date: string;
    count: number;
  }[];
  revenueGrowth: {
    date: string;
    amount: number;
  }[];
  topSchools: {
    id: string;
    name: string;
    revenue: number;
    students: number;
  }[];
  userDistribution: {
    role: string;
    count: number;
  }[];
  systemHealth: {
    uptime: number;
    responseTime: number;
    errorRate: number;
  };
}

export const useAnalyticsData = () => {
  return useQuery({
    queryKey: ['analytics-data'],
    queryFn: async (): Promise<AnalyticsData> => {
      try {
        // Fetch system-wide analytics for admin application
        const [
          usersResult,
          schoolsResult,
          revenueResult,
          transactionsResult
        ] = await Promise.all([
          // Get total users
          supabase
            .from('profiles')
            .select('id', { count: 'exact' }),
          
          // Get total schools
          supabase
            .from('schools')
            .select('id', { count: 'exact' }),
          
          // Get total revenue
          supabase
            .from('financial_transactions')
            .select('amount')
            .eq('status', 'completed'),
          
          // Get total transactions
          supabase
            .from('financial_transactions')
            .select('id', { count: 'exact' })
        ]);

        // Calculate totals
        const totalUsers = usersResult.count || 0;
        const totalSchools = schoolsResult.count || 0;
        const totalRevenue = revenueResult.data?.reduce((sum, txn) => sum + (txn.amount || 0), 0) || 0;
        const totalTransactions = transactionsResult.count || 0;

        // Get user growth data (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: userGrowthData } = await supabase
          .from('profiles')
          .select('created_at')
          .gte('created_at', thirtyDaysAgo.toISOString());

        // Process user growth data
        const userGrowth = processGrowthData(userGrowthData || [], 'created_at');

        // Get revenue growth data
        const { data: revenueData } = await supabase
          .from('financial_transactions')
          .select('amount, created_at')
          .eq('status', 'completed')
          .gte('created_at', thirtyDaysAgo.toISOString());

        // Process revenue growth data
        const revenueGrowth = processRevenueGrowthData(revenueData || []);

        // Get top schools by revenue
        const { data: topSchoolsData } = await supabase
          .from('schools')
          .select(`
            id,
            name,
            financial_transactions!inner(amount)
          `)
          .eq('financial_transactions.status', 'completed')
          .limit(10);

        const topSchools = topSchoolsData?.map(school => ({
          id: school.id,
          name: school.name,
          revenue: school.financial_transactions?.reduce((sum, txn) => sum + (txn.amount || 0), 0) || 0,
          students: 0 // Would need to join with students table
        })).sort((a, b) => b.revenue - a.revenue) || [];

        // Get user distribution by role
        const { data: userDistributionData } = await supabase
          .from('profiles')
          .select('role');

        const userDistribution = processUserDistribution(userDistributionData || []);

        // Mock system health data
        const systemHealth = {
          uptime: 99.9,
          responseTime: 150,
          errorRate: 0.1
        };

        return {
          totalUsers,
          totalSchools,
          totalRevenue,
          totalTransactions,
          userGrowth,
          revenueGrowth,
          topSchools,
          userDistribution,
          systemHealth
        };
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        throw error;
      }
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes - increased for better performance
    refetchInterval: 10 * 60 * 1000, // 10 minutes - reduced frequency
  });
};

// Helper functions
function processGrowthData(data: any[], dateField: string) {
  const dailyCounts = new Map<string, number>();
  
  data.forEach(item => {
    const date = new Date(item[dateField]).toISOString().split('T')[0];
    dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1);
  });

  return Array.from(dailyCounts.entries()).map(([date, count]) => ({
    date,
    count
  })).sort((a, b) => a.date.localeCompare(b.date));
}

function processRevenueGrowthData(data: any[]) {
  const dailyRevenue = new Map<string, number>();
  
  data.forEach(item => {
    const date = new Date(item.created_at).toISOString().split('T')[0];
    dailyRevenue.set(date, (dailyRevenue.get(date) || 0) + (item.amount || 0));
  });

  return Array.from(dailyRevenue.entries()).map(([date, amount]) => ({
    date,
    amount
  })).sort((a, b) => a.date.localeCompare(b.date));
}

function processUserDistribution(data: any[]) {
  const roleCounts = new Map<string, number>();
  
  data.forEach(item => {
    const role = item.role || 'unknown';
    roleCounts.set(role, (roleCounts.get(role) || 0) + 1);
  });

  return Array.from(roleCounts.entries()).map(([role, count]) => ({
    role,
    count
  }));
}
