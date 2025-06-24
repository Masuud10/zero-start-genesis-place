
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
            setTimeout(() => reject(new Error('Analytics query timeout')), 6000)
          )
        ]);
        
        // Type guard to ensure result has the expected structure
        if (result && typeof result === 'object') {
          const typedResult = result as any;
          if ('data' in typedResult && typedResult.data) {
            return typedResult.data;
          }
          // If no data property, return the result directly
          return typedResult;
        }
        
        throw new Error('Invalid response format from analytics service');
      } catch (error) {
        console.error('Analytics fetch error:', error);
        // Return default data structure instead of throwing
        return {
          grades: { total_grades: 0, average_grade: 0 },
          attendance: { total_records: 0, average_attendance_rate: 0 },
          finance: { total_collected: 0, schools_with_finance: 0 }
        };
      }
    },
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    retry: 1, // Reduce retries to prevent hanging
    retryDelay: 1000,
    // Add timeout for the entire query
    meta: {
      errorMessage: 'Failed to load system analytics'
    }
  });
};
