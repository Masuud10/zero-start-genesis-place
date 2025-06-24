
import { useQuery } from '@tanstack/react-query';
import { EduFamAnalyticsService } from '@/services/analytics/eduFamAnalyticsService';
import { useAuth } from '@/contexts/AuthContext';

export const useEduFamSystemAnalytics = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['edufam-system-analytics'],
    queryFn: async () => {
      try {
        const analyticsTimeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Analytics query timeout')), 10000)
        );

        const result = await Promise.race([
          EduFamAnalyticsService.getSystemAnalytics(),
          analyticsTimeout
        ]);
        
        // Type guard to ensure result has the expected structure
        if (result && typeof result === 'object' && 'data' in result) {
          const typedResult = result as { data: any; error: any };
          if (typedResult.data) {
            return typedResult.data;
          }
        }
        
        // If no data property, return the result directly (might be the actual data)
        if (result && typeof result === 'object') {
          return result;
        }
        
        throw new Error('Invalid response format from analytics service');
      } catch (error) {
        console.error('Analytics fetch error:', error);
        throw error;
      }
    },
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    retry: 1, // Reduce retries to prevent hanging
    retryDelay: 2000,
    // Add timeout for the entire query
    meta: {
      errorMessage: 'Failed to load system analytics'
    }
  });
};
