
import { useQuery } from '@tanstack/react-query';
import { EduFamAnalyticsService } from '@/services/analytics/eduFamAnalyticsService';
import { useAuth } from '@/contexts/AuthContext';

export const useEduFamSystemAnalytics = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['edufam-system-analytics'],
    queryFn: async () => {
      try {
        const result = await Promise.race([
          EduFamAnalyticsService.getSystemAnalytics(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Analytics query timeout')), 15000)
          )
        ]);
        return result;
      } catch (error) {
        console.error('Analytics fetch error:', error);
        throw error;
      }
    },
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    select: (data) => data?.data || null,
    retry: 2,
    retryDelay: 1000,
  });
};
