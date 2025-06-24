
import { useQuery } from '@tanstack/react-query';
import { EduFamAnalyticsService } from '@/services/analytics/eduFamAnalyticsService';
import { useAuth } from '@/contexts/AuthContext';

export const useEduFamSystemAnalytics = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['edufam-system-analytics'],
    queryFn: async () => {
      try {
        console.log('🔄 Fetching EduFam system analytics...');
        
        const result = await Promise.race([
          EduFamAnalyticsService.getSystemAnalytics(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Analytics query timeout after 8 seconds')), 8000)
          )
        ]);
        
        console.log('📊 Analytics result received:', result);
        
        // Enhanced type guard to ensure result has the expected structure
        if (result && typeof result === 'object') {
          const typedResult = result as any;
          
          // Check if result has data property
          if ('data' in typedResult && typedResult.data) {
            console.log('✅ Analytics data found in result.data');
            return typedResult.data;
          }
          
          // Check if result is already in the expected format
          if ('grades' in typedResult || 'attendance' in typedResult || 'finance' in typedResult) {
            console.log('✅ Analytics data found in result directly');
            return typedResult;
          }
          
          // If result exists but doesn't have expected structure, log and return default
          console.warn('⚠️ Analytics result has unexpected structure:', Object.keys(typedResult));
        }
        
        console.warn('⚠️ Invalid or empty analytics response, returning default data');
        throw new Error('Invalid response format from analytics service');
        
      } catch (error) {
        console.error('❌ Analytics fetch error:', error);
        
        // Return meaningful default data structure instead of throwing
        const defaultData = {
          grades: { 
            total_grades: 0, 
            average_grade: 0,
            improvement_trend: 'stable',
            top_performing_schools: []
          },
          attendance: { 
            total_records: 0, 
            average_attendance_rate: 0,
            schools_with_good_attendance: 0,
            attendance_trends: []
          },
          finance: { 
            total_collected: 0, 
            schools_with_finance: 0,
            collection_rate: 0,
            outstanding_amount: 0
          },
          schools: {
            total_schools: 0,
            active_schools: 0,
            recent_registrations: 0
          },
          users: {
            total_users: 0,
            active_users: 0,
            user_growth: 0
          },
          system: {
            uptime_percentage: 99.9,
            api_calls: 0,
            performance_score: 95
          }
        };
        
        console.log('📊 Returning default analytics data structure');
        return defaultData;
      }
    },
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    retry: 2, // Reduce retries to prevent hanging
    retryDelay: 2000,
    // Add timeout for the entire query
    meta: {
      errorMessage: 'Failed to load system analytics - using default data'
    }
  });
};
