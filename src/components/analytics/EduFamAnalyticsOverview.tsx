
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSystemAnalytics } from '@/hooks/useSystemAnalytics';
import { useEduFamSystemAnalytics } from '@/hooks/useEduFamSystemAnalytics';
import { 
  TrendingUp, 
  Users, 
  Building2, 
  DollarSign, 
  Activity,
  AlertCircle,
  RefreshCw,
  Download 
} from 'lucide-react';

interface EduFamAnalyticsOverviewProps {
  onAnalyticsAction?: (action: string) => void;
}

const EduFamAnalyticsOverview: React.FC<EduFamAnalyticsOverviewProps> = ({ onAnalyticsAction }) => {
  const { data: systemAnalytics, isLoading: systemLoading, error: systemError } = useSystemAnalytics();
  const { data: eduFamAnalytics, isLoading: eduFamLoading, error: eduFamError } = useEduFamSystemAnalytics();

  const isLoading = systemLoading || eduFamLoading;
  const hasError = systemError || eduFamError;

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Activity className="h-5 w-5 animate-pulse" />
            Real-Time Analytics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="text-center p-4 bg-white rounded-lg shadow-sm animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded-full mx-auto mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasError) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-6">
          <Alert className="border-red-300">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              Unable to load analytics data. Please check your connection and try again.
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.reload()}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate metrics with fallbacks
  const totalUsers = systemAnalytics?.userDistribution?.reduce((sum, item) => sum + item.count, 0) || 0;
  const totalSchools = systemAnalytics?.schoolsOnboarded?.reduce((sum, item) => sum + item.count, 0) || 0;
  const totalRevenue = systemAnalytics?.financeSummary?.total_subscriptions || 0;
  const avgGrade = eduFamAnalytics?.grades?.average_grade || 0;
  const attendanceRate = eduFamAnalytics?.attendance?.average_attendance_rate || 0;

  const handleAnalyticsAction = (action: string) => {
    onAnalyticsAction?.(action);
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Activity className="h-5 w-5" />
            Real-Time Analytics Overview
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleAnalyticsAction('view-detailed-analytics')}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              View Details
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleAnalyticsAction('export-analytics')}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        <p className="text-blue-700 text-sm">
          Live system performance and usage metrics across all schools
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm border-l-4 border-l-blue-500">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-900">
              {totalUsers.toLocaleString()}
            </div>
            <p className="text-sm text-blue-700 mt-1">Total Users</p>
          </div>

          <div className="text-center p-4 bg-white rounded-lg shadow-sm border-l-4 border-l-green-500">
            <Building2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-900">
              {totalSchools.toLocaleString()}
            </div>
            <p className="text-sm text-green-700 mt-1">Active Schools</p>
          </div>

          <div className="text-center p-4 bg-white rounded-lg shadow-sm border-l-4 border-l-purple-500">
            <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-900">
              KES {totalRevenue.toLocaleString()}
            </div>
            <p className="text-sm text-purple-700 mt-1">Total Revenue</p>
          </div>

          <div className="text-center p-4 bg-white rounded-lg shadow-sm border-l-4 border-l-orange-500">
            <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-900">
              {avgGrade.toFixed(1)}%
            </div>
            <p className="text-sm text-orange-700 mt-1">Avg Grade</p>
          </div>

          <div className="text-center p-4 bg-white rounded-lg shadow-sm border-l-4 border-l-teal-500">
            <Activity className="h-8 w-8 text-teal-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-teal-900">
              {attendanceRate.toFixed(1)}%
            </div>
            <p className="text-sm text-teal-700 mt-1">Attendance Rate</p>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="mt-6 p-4 bg-white rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Quick Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">
                System performance: <span className="font-medium text-green-600">Excellent</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">
                User engagement: <span className="font-medium text-blue-600">High</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600">
                Revenue growth: <span className="font-medium text-purple-600">Positive</span>
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EduFamAnalyticsOverview;
