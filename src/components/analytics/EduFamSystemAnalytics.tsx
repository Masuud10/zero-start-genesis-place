
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEduFamSystemAnalytics } from '@/hooks/useEduFamSystemAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, G , CalendarCheck, DollarSign, Building2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const EduFamSystemAnalytics = () => {
  const { user } = useAuth();
  const { data: analytics, isLoading, error, refetch } = useEduFamSystemAnalytics();

  // Permission check
  if (!user || user.role !== 'edufam_admin') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Alert className="bg-red-50 border-red-200 max-w-md">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-600">Access Denied</AlertTitle>
          <AlertDescription className="text-red-700">
            Only EduFam Admins can access system analytics.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600">Loading system analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Analytics</h1>
            <p className="text-gray-600 mt-1">EduFam network-wide overview</p>
          </div>
        </div>

        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-600">Analytics Error</AlertTitle>
          <AlertDescription className="text-red-700 mb-4">
            Failed to load system analytics data. Please try again.
          </AlertDescription>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  // Safe defaults for analytics data
  const safeAnalytics = {
    schools: {
      total_schools: 0,
      active_schools: 0,
      ...analytics?.schools
    },
    grades: {
      total_grades: 0,
      average_grade: 0,
      schools_with_grades: 0,
      ...analytics?.grades
    },
    attendance: {
      total_records: 0,
      average_attendance_rate: 0,
      schools_with_attendance: 0,
      ...analytics?.attendance
    },
    finance: {
      total_collected: 0,
      total_outstanding: 0,
      schools_with_finance: 0,
      ...analytics?.finance
    }
  };

  const formatNumber = (value: number) => {
    return (value || 0).toLocaleString();
  };

  const formatCurrency = (value: number) => {
    return `KES ${(value || 0).toLocaleString()}`;
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value || 0)}%`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Analytics</h1>
          <p className="text-gray-600 mt-1">EduFam network-wide overview</p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Schools Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Total Schools
            </CardTitle>
            <Building2 className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(safeAnalytics.schools.total_schools)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Active schools in network
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Active Schools
            </CardTitle>
            <Building2 className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(safeAnalytics.schools.active_schools)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Currently operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Academic Performance Card */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Academic Performance
            </CardTitle>
            <GraduationCap className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(safeAnalytics.grades.total_grades)}
              </div>
              <p className="text-xs text-gray-600">Total Grades Recorded</p>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-semibold text-blue-600">
                {Math.round(safeAnalytics.grades.average_grade)}%
              </div>
              <p className="text-xs text-gray-600">Network Average</p>
            </div>
            <div className="text-sm text-gray-500">
              {safeAnalytics.grades.schools_with_grades} schools with data
            </div>
          </CardContent>
        </Card>

        {/* Attendance Card */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Attendance Tracking
            </CardTitle>
            <CalendarCheck className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(safeAnalytics.attendance.total_records)}
              </div>
              <p className="text-xs text-gray-600">Attendance Records</p>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-semibold text-green-600">
                {formatPercentage(safeAnalytics.attendance.average_attendance_rate)}
              </div>
              <p className="text-xs text-gray-600">Network Attendance Rate</p>
            </div>
            <div className="text-sm text-gray-500">
              {safeAnalytics.attendance.schools_with_attendance} schools with data
            </div>
          </CardContent>
        </Card>

        {/* Financial Overview Card */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Financial Overview
            </CardTitle>
            <DollarSign className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(safeAnalytics.finance.total_collected)}
              </div>
              <p className="text-xs text-gray-600">Total Collected</p>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-semibold text-orange-600">
                {formatCurrency(safeAnalytics.finance.total_outstanding)}
              </div>
              <p className="text-xs text-gray-600">Outstanding Balance</p>
            </div>
            <div className="text-sm text-gray-500">
              {safeAnalytics.finance.schools_with_finance} schools with data
            </div>
          </CardContent>
        </Card>
      </div>

      {/* No Data State */}
      {(
        safeAnalytics.grades.total_grades === 0 && 
        safeAnalytics.attendance.total_records === 0 && 
        safeAnalytics.finance.total_collected === 0
      ) && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-500 mb-4">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No System Data Available</h3>
              <p className="text-sm">
                No academic, attendance, or financial data has been recorded across the network yet.
              </p>
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
            >
              Refresh Data
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EduFamSystemAnalytics;
