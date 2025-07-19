import { useQuery } from '@tanstack/react-query';
import { AdminAnalyticsService } from '@/services/analytics/adminAnalyticsService';

export const useUserGrowthData = () => {
  return useQuery({
    queryKey: ['admin-analytics-user-growth'],
    queryFn: AdminAnalyticsService.getUserGrowthData,
    enabled: true, // No user context, so always enabled
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    meta: {
      errorMessage: 'Failed to load user growth analytics'
    }
  });
};

export const useSchoolGrowthData = () => {
  return useQuery({
    queryKey: ['admin-analytics-school-growth'],
    queryFn: AdminAnalyticsService.getSchoolGrowthData,
    enabled: true, // No user context, so always enabled
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
    meta: {
      errorMessage: 'Failed to load school growth analytics'
    }
  });
};

export const useEnrollmentBySchoolData = () => {
  return useQuery({
    queryKey: ['admin-analytics-enrollment-by-school'],
    queryFn: AdminAnalyticsService.getEnrollmentBySchoolData,
    enabled: true, // No user context, so always enabled
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
    meta: {
      errorMessage: 'Failed to load enrollment analytics'
    }
  });
};

export const useUserRoleDistributionData = () => {
  return useQuery({
    queryKey: ['admin-analytics-user-role-distribution'],
    queryFn: AdminAnalyticsService.getUserRoleDistributionData,
    enabled: true, // No user context, so always enabled
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
    meta: {
      errorMessage: 'Failed to load user role analytics'
    }
  });
};

export const useCurriculumDistributionData = () => {
  return useQuery({
    queryKey: ['admin-analytics-curriculum-distribution'],
    queryFn: AdminAnalyticsService.getCurriculumDistributionData,
    enabled: true, // No user context, so always enabled
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
    meta: {
      errorMessage: 'Failed to load curriculum analytics'
    }
  });
};

export const useFinancialSummaryData = () => {
  return useQuery({
    queryKey: ['admin-analytics-financial-summary'],
    queryFn: AdminAnalyticsService.getFinancialSummaryData,
    enabled: true, // No user context, so always enabled
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
    meta: {
      errorMessage: 'Failed to load financial analytics'
    }
  });
};

export const useSystemGrowthTrends = () => {
  return useQuery({
    queryKey: ['admin-analytics-system-growth-trends'],
    queryFn: AdminAnalyticsService.getSystemGrowthTrends,
    enabled: true, // No user context, so always enabled
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
    meta: {
      errorMessage: 'Failed to load system growth trends'
    }
  });
};

export const usePlatformUsageTrends = () => {
  return useQuery({
    queryKey: ['admin-analytics-platform-usage-trends'],
    queryFn: AdminAnalyticsService.getPlatformUsageTrends,
    enabled: true, // No user context, so always enabled
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
    retry: 2,
    meta: {
      errorMessage: 'Failed to load platform usage trends'
    }
  });
};

export const useRevenueAnalytics = () => {
  return useQuery({
    queryKey: ['admin-analytics-revenue-analytics'],
    queryFn: AdminAnalyticsService.getRevenueAnalytics,
    enabled: true, // No user context, so always enabled
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
    meta: {
      errorMessage: 'Failed to load revenue analytics'
    }
  });
};

export const usePerformanceInsights = () => {
  return useQuery({
    queryKey: ['admin-analytics-performance-insights'],
    queryFn: AdminAnalyticsService.getPerformanceInsights,
    enabled: true, // No user context, so always enabled
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
    meta: {
      errorMessage: 'Failed to load performance insights'
    }
  });
};
