
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, Users, DollarSign, Activity, AlertCircle } from 'lucide-react';
import SystemGrowthTrendsChart from '../charts/SystemGrowthTrendsChart';
import PlatformUsageChart from '../charts/PlatformUsageChart';
import RevenueAnalyticsChart from '../charts/RevenueAnalyticsChart';
import PerformanceInsightsChart from '../charts/PerformanceInsightsChart';
import UserRoleDistributionChart from '../charts/UserRoleDistributionChart';
import EnrollmentBySchoolChart from '../charts/EnrollmentBySchoolChart';
import CurriculumDistributionPieChart from '../charts/CurriculumDistributionPieChart';
import FinancialSummaryPieChart from '../charts/FinancialSummaryPieChart';
import { useSystemAnalytics } from '@/hooks/useSystemAnalytics';

const SystemAnalyticsChartsSection = () => {
  console.log('📊 SystemAnalyticsChartsSection: Rendering system analytics charts section');
  
  const { data: analytics, isLoading, error } = useSystemAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading State */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse h-80">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="bg-red-50 border-red-200">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700">
          Unable to load system analytics. Please try refreshing the page or contact support if the issue persists.
        </AlertDescription>
      </Alert>
    );
  }

  if (!analytics) {
    return (
      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-700">
          No analytics data available at this time. Data will appear once system activity is recorded.
        </AlertDescription>
      </Alert>
    );
  }

  // Calculate key metrics from analytics data
  const totalUsers = analytics.userDistribution?.reduce((sum, item) => sum + item.count, 0) || 0;
  const totalSchools = analytics.schoolsOnboarded?.reduce((sum, item) => sum + item.count, 0) || 0;
  const totalRevenue = analytics.financeSummary?.total_subscriptions || 0;
  const avgPerformance = analytics.performanceTrends?.length > 0 
    ? analytics.performanceTrends[analytics.performanceTrends.length - 1]?.average_grade || 0
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Icons at the Top */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-600">{totalUsers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Schools</p>
                <p className="text-2xl font-bold text-green-600">{totalSchools.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-600">KES {totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Performance</p>
                <p className="text-2xl font-bold text-orange-600">{avgPerformance.toFixed(1)}%</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bar Charts and Line Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Usage Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <PlatformUsageChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Network-wide Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <SystemGrowthTrendsChart />
          </CardContent>
        </Card>
      </div>

      {/* Revenue and Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueAnalyticsChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceInsightsChart />
          </CardContent>
        </Card>
      </div>

      {/* Pie Charts for Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <UserRoleDistributionChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Curriculum Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <CurriculumDistributionPieChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <FinancialSummaryPieChart />
          </CardContent>
        </Card>
      </div>

      {/* School-specific Analytics */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>School Enrollment Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <EnrollmentBySchoolChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemAnalyticsChartsSection;
