
import { useQuery } from '@tanstack/react-query';
import { AdminAnalyticsService } from '@/services/analytics/adminAnalyticsService';
import { useAuth } from '@/contexts/AuthContext';

export const useUserGrowthData = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin-analytics-user-growth'],
    queryFn: AdminAnalyticsService.getUserGrowthData,
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    meta: {
      errorMessage: 'Failed to load user growth analytics'
    }
  });
};

export const useSchoolGrowthData = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin-analytics-school-growth'],
    queryFn: AdminAnalyticsService.getSchoolGrowthData,
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
    meta: {
      errorMessage: 'Failed to load school growth analytics'
    }
  });
};

export const useEnrollmentBySchoolData = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin-analytics-enrollment-by-school'],
    queryFn: AdminAnalyticsService.getEnrollmentBySchoolData,
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
    meta: {
      errorMessage: 'Failed to load enrollment analytics'
    }
  });
};

export const useUserRoleDistributionData = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin-analytics-user-role-distribution'],
    queryFn: AdminAnalyticsService.getUserRoleDistributionData,
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
    meta: {
      errorMessage: 'Failed to load user role analytics'
    }
  });
};

export const useCurriculumDistributionData = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin-analytics-curriculum-distribution'],
    queryFn: AdminAnalyticsService.getCurriculumDistributionData,
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
    meta: {
      errorMessage: 'Failed to load curriculum analytics'
    }
  });
};

export const useFinancialSummaryData = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin-analytics-financial-summary'],
    queryFn: AdminAnalyticsService.getFinancialSummaryData,
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
    meta: {
      errorMessage: 'Failed to load financial analytics'
    }
  });
};
