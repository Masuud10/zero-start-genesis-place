import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { SystemAnalyticsService, SystemAnalyticsData, AnalyticsFilters } from '@/services/analytics/systemAnalyticsService';
import { AnalyticsExportService, ExportOptions } from '@/services/analytics/analyticsExportService';
import { useToast } from '@/hooks/use-toast';

export const useSystemAnalytics = (filters: AnalyticsFilters = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    data: analyticsData,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['system-analytics', filters],
    queryFn: async () => {
      console.log('📊 useSystemAnalytics: Fetching analytics with filters:', filters);
      return await SystemAnalyticsService.getSystemAnalytics(filters);
    },
    enabled: user?.role === 'edufam_admin',
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    meta: {
      errorMessage: 'Failed to load system analytics'
    }
  });

  const exportMutation = useMutation({
    mutationFn: async (options: ExportOptions) => {
      console.log('📊 useSystemAnalytics: Exporting analytics data with options:', options);
      
      if (!analyticsData) {
        throw new Error('No analytics data available for export');
      }

      let blob: Blob;
      let filename: string;

      switch (options.format) {
        case 'pdf':
          blob = await AnalyticsExportService.exportToPDF(analyticsData, options);
          filename = AnalyticsExportService.generateFilename('pdf', options.dateRange);
          break;
        case 'excel':
          blob = await AnalyticsExportService.exportToExcel(analyticsData, options);
          filename = AnalyticsExportService.generateFilename('xlsx', options.dateRange);
          break;
        case 'json':
          blob = await AnalyticsExportService.exportToJSON(analyticsData, options);
          filename = AnalyticsExportService.generateFilename('json', options.dateRange);
          break;
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }

      await AnalyticsExportService.downloadFile(blob, filename);
      return { format: options.format, filename };
    },
    onSuccess: (result) => {
      toast({
        title: 'Export Successful',
        description: `Analytics data has been exported as ${result.format.toUpperCase()} successfully.`,
      });
    },
    onError: (error) => {
      console.error('❌ useSystemAnalytics: Export error:', error);
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export analytics data.',
        variant: 'destructive',
      });
    }
  });

  const handleExport = (format: 'pdf' | 'excel' | 'json' = 'json', includeCharts = true, includeTables = true) => {
    const options: ExportOptions = {
      format,
      includeCharts,
      includeTables,
      dateRange: filters.dateRange,
      filters
    };
    exportMutation.mutate(options);
  };

  const handleQuickExport = () => {
    handleExport('json', true, true);
  };

  return {
    analyticsData,
    isLoading,
    error,
    refetch,
    isRefetching,
    exportData: handleExport,
    quickExport: handleQuickExport,
    isExporting: exportMutation.isPending
  };
};

// Specialized hooks for specific analytics categories
export const useUserAnalytics = (filters: AnalyticsFilters = {}) => {
  const { analyticsData, isLoading, error, refetch } = useSystemAnalytics(filters);
  
  return {
    userData: analyticsData ? {
      totalUsers: analyticsData.totalUsers,
      activeUsers: analyticsData.activeUsers,
      newUsersThisMonth: analyticsData.newUsersThisMonth,
      userGrowthRate: analyticsData.userGrowthRate,
      userRoleDistribution: analyticsData.userRoleDistribution,
      userGrowthTrend: analyticsData.userGrowthTrend
    } : null,
    isLoading,
    error,
    refetch
  };
};

export const useSchoolAnalytics = (filters: AnalyticsFilters = {}) => {
  const { analyticsData, isLoading, error, refetch } = useSystemAnalytics(filters);
  
  return {
    schoolData: analyticsData ? {
      totalSchools: analyticsData.totalSchools,
      activeSchools: analyticsData.activeSchools,
      newSchoolsThisMonth: analyticsData.newSchoolsThisMonth,
      schoolGrowthRate: analyticsData.schoolGrowthRate,
      schoolRegistrationTrend: analyticsData.schoolRegistrationTrend,
      schoolsByStatus: analyticsData.schoolsByStatus
    } : null,
    isLoading,
    error,
    refetch
  };
};

export const useBillingAnalytics = (filters: AnalyticsFilters = {}) => {
  const { analyticsData, isLoading, error, refetch } = useSystemAnalytics(filters);
  
  return {
    billingData: analyticsData ? {
      totalRevenue: analyticsData.totalRevenue,
      monthlyRevenue: analyticsData.monthlyRevenue,
      revenueGrowthRate: analyticsData.revenueGrowthRate,
      subscriptionData: analyticsData.subscriptionData,
      billingTrend: analyticsData.billingTrend
    } : null,
    isLoading,
    error,
    refetch
  };
};

export const useUsageAnalytics = (filters: AnalyticsFilters = {}) => {
  const { analyticsData, isLoading, error, refetch } = useSystemAnalytics(filters);
  
  return {
    usageData: analyticsData ? {
      totalLogins: analyticsData.totalLogins,
      averageLoginsPerDay: analyticsData.averageLoginsPerDay,
      loginTrend: analyticsData.loginTrend,
      featureUsage: analyticsData.featureUsage,
      activityFrequency: analyticsData.activityFrequency
    } : null,
    isLoading,
    error,
    refetch
  };
};

export const usePerformanceAnalytics = () => {
  const { analyticsData, isLoading, error, refetch } = useSystemAnalytics();
  
  return {
    performanceData: analyticsData ? {
      systemUptime: analyticsData.systemUptime,
      averageResponseTime: analyticsData.averageResponseTime,
      databasePerformance: analyticsData.databasePerformance,
      apiSuccessRate: analyticsData.apiSuccessRate,
      performanceMetrics: analyticsData.performanceMetrics,
      currentOnlineUsers: analyticsData.currentOnlineUsers,
      activeSessions: analyticsData.activeSessions,
      systemLoad: analyticsData.systemLoad
    } : null,
    isLoading,
    error,
    refetch
  };
};
