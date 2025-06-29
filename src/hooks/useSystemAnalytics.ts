
import { useQuery } from '@tanstack/react-query';
import { SystemAnalyticsService } from '@/services/analytics/systemAnalyticsService';
import { useAuth } from '@/contexts/AuthContext';

export const useSystemAnalytics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['system-analytics'],
    queryFn: async () => {
      console.log('🔄 Fetching comprehensive system analytics...');
      return await SystemAnalyticsService.getComprehensiveAnalytics();
    },
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
};
