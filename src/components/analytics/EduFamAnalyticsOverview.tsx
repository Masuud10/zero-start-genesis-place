
import React from 'react';
import { useAdminSchoolsData } from '@/hooks/useAdminSchoolsData';
import { useAdminUsersData } from '@/hooks/useAdminUsersData';
import { useEduFamAnalyticsData } from '@/hooks/useEduFamAnalyticsData';
import { useSystemAnalytics } from '@/hooks/useSystemAnalytics';
import { TrendingUp, Loader2, AlertTriangle } from 'lucide-react';
import SystemGrowthChart from './charts/SystemGrowthChart';
import GradeDistributionChart from './charts/GradeDistributionChart';
import RevenueTrendsChart from './charts/RevenueTrendsChart';
import AttendanceAnalyticsChart from './charts/AttendanceAnalyticsChart';
import SystemHealthCard from './cards/SystemHealthCard';
import SchoolAnalyticsDetail from './SchoolAnalyticsDetail';
import UserLoginChart from './charts/UserLoginChart';
import PerformanceTrendsChart from './charts/PerformanceTrendsChart';
import SchoolsOnboardedChart from './charts/SchoolsOnboardedChart';
import UserDistributionChart from './charts/UserDistributionChart';
import CurriculumDistributionChart from './charts/CurriculumDistributionChart';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const EduFamAnalyticsOverview = () => {
  const { data: schoolsData = [], isLoading: schoolsLoading } = useAdminSchoolsData(0);
  const { data: usersData = [], isLoading: usersLoading } = useAdminUsersData(0);
  const { data: analyticsData, isLoading: analyticsLoading } = useEduFamAnalyticsData();
  const { 
    data: systemAnalytics, 
    isLoading: systemAnalyticsLoading, 
    error: systemAnalyticsError,
    refetch: refetchSystemAnalytics 
  } = useSystemAnalytics();

  const isLoading = schoolsLoading || usersLoading || analyticsLoading || systemAnalyticsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">Real-Time Analytics Overview</h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-2" />
          <span className="text-gray-600">Loading comprehensive analytics...</span>
        </div>
      </div>
    );
  }

  if (systemAnalyticsError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">Real-Time Analytics Overview</h3>
        </div>
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700 flex items-center justify-between">
            <span>Failed to load system analytics. Please try refreshing the data.</span>
            <Button 
              onClick={() => refetchSystemAnalytics()} 
              variant="outline" 
              size="sm"
              className="ml-4"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-900">Real-Time Analytics Overview</h3>
        <div className="ml-auto text-sm text-gray-500">
          Live data • Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* System Overview Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SystemGrowthChart 
          schoolsCount={schoolsData.length} 
          usersCount={usersData.length} 
        />
        <GradeDistributionChart data={analyticsData?.gradesChartData || []} />
        <RevenueTrendsChart 
          data={analyticsData?.revenueChartData || []} 
          totalRevenue={analyticsData?.totalRevenue || 0}
        />
        <AttendanceAnalyticsChart data={analyticsData?.attendanceChartData || []} />
        <SystemHealthCard 
          schoolsCount={schoolsData.length} 
          usersCount={usersData.length} 
        />
      </div>

      {/* Enhanced Visual Analytics Section */}
      {systemAnalytics && (
        <div className="space-y-6">
          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Enhanced System Analytics</h4>
            
            {/* Line Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <UserLoginChart data={systemAnalytics.userLogins} />
              <PerformanceTrendsChart data={systemAnalytics.performanceTrends} />
            </div>

            {/* Bar Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <SchoolsOnboardedChart data={systemAnalytics.schoolsOnboarded} />
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h5 className="text-sm font-medium mb-4 text-gray-900">Financial Summary</h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Total Subscriptions:</span>
                    <span className="font-semibold text-green-600">KES {systemAnalytics.financeSummary.total_subscriptions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Setup Fees:</span>
                    <span className="font-semibold text-blue-600">KES {systemAnalytics.financeSummary.setup_fees.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Monthly Revenue:</span>
                    <span className="font-semibold text-purple-600">KES {systemAnalytics.financeSummary.monthly_revenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pie Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <UserDistributionChart data={systemAnalytics.userDistribution} />
              <CurriculumDistributionChart data={systemAnalytics.curriculumTypes} />
            </div>

            {/* Additional Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Top Active Schools */}
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h5 className="text-sm font-medium mb-4 text-gray-900">Top 5 Most Active Schools</h5>
                <div className="space-y-3">
                  {systemAnalytics.topActiveSchools.length > 0 ? (
                    systemAnalytics.topActiveSchools.map((school, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="truncate text-gray-700">{school.school_name}</span>
                        <span className="font-medium text-blue-600">{school.total_users} users</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No active schools data available</p>
                  )}
                </div>
              </div>

              {/* Grade Approval Stats */}
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h5 className="text-sm font-medium mb-4 text-gray-900">Grade Approval Status</h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="text-sm text-green-700">Approved:</span>
                    <span className="font-semibold text-green-600">{systemAnalytics.gradeApprovalStats.approved}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                    <span className="text-sm text-yellow-700">Pending:</span>
                    <span className="font-semibold text-yellow-600">{systemAnalytics.gradeApprovalStats.pending}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                    <span className="text-sm text-red-700">Rejected:</span>
                    <span className="font-semibold text-red-600">{systemAnalytics.gradeApprovalStats.rejected}</span>
                  </div>
                </div>
              </div>

              {/* Announcement Engagement */}
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h5 className="text-sm font-medium mb-4 text-gray-900">Recent Announcement Engagement</h5>
                <div className="space-y-3">
                  {systemAnalytics.announcementEngagement.length > 0 ? (
                    systemAnalytics.announcementEngagement.slice(-3).map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">{item.month}:</span>
                        <span className="font-medium text-purple-600">{item.engagement_rate.toFixed(1)}%</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No engagement data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Individual School Analytics Section */}
      <SchoolAnalyticsDetail />
    </div>
  );
};

export default EduFamAnalyticsOverview;
