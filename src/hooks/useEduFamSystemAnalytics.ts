
import { useQuery } from '@tanstack/react-query';
import { EduFamAnalyticsService } from '@/services/analytics/eduFamAnalyticsService';
import { useAuth } from '@/contexts/AuthContext';

export const useEduFamSystemAnalytics = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['edufam-system-analytics'],
    queryFn: () => EduFamAnalyticsService.getSystemAnalytics(),
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    select: (data) => data.data,
  });
};
