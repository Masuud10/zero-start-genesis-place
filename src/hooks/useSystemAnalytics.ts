
import { useQuery } from '@tanstack/react-query';
import { SystemAnalyticsService } from '@/services/analytics/systemAnalyticsService';
import { useAuth } from '@/contexts/AuthContext';

export const useSystemAnalytics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['system-analytics'],
    queryFn: async () => {
      console.log('🔄 useSystemAnalytics: Fetching comprehensive system analytics...');
      try {
        const data = await SystemAnalyticsService.getComprehensiveAnalytics();
        console.log('✅ useSystemAnalytics: Data fetched successfully:', data);
        return data;
      } catch (error) {
        console.error('❌ useSystemAnalytics: Failed to fetch data:', error);
        throw new Error(`Failed to fetch system analytics: ${error}`);
      }
    },
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    meta: {
      errorMessage: 'Failed to load system analytics data'
    }
  });
};
