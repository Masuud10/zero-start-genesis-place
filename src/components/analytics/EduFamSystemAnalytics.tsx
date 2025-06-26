
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEduFamSystemAnalytics } from '@/hooks/useEduFamSystemAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, GraduationCap, CalendarCheck, DollarSign, AlertTriangle, Building2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const EduFamSystemAnalytics = () => {
  const { user } = useAuth();
  const { data: analyticsData, isLoading, error } = useEduFamSystemAnalytics();

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
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-600">Analytics Error</AlertTitle>
          <AlertDescription className="text-red-700">
            Failed to load system analytics data. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-500">Analytics data is currently unavailable.</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const formatPercentage = (rate: number) => {
    return `${rate.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Overall System Statistics */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-6">System-Wide Analytics Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Grades Summary */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Grades</CardTitle>
              <GraduationCap className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {analyticsData.grades.average_grade.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                Average across {analyticsData.grades.schools_with_grades} schools
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {analyticsData.grades.total_grades.toLocaleString()} total grades
              </p>
            </CardContent>
          </Card>

          {/* Attendance Summary */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
              <CalendarCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatPercentage(analyticsData.attendance.average_attendance_rate)}
              </div>
              <p className="text-xs text-muted-foreground">
                Average across {analyticsData.attendance.schools_with_attendance} schools
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {analyticsData.attendance.total_records.toLocaleString()} total records
              </p>
            </CardContent>
          </Card>

          {/* Finance Summary */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Financial Overview</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(analyticsData.finance.total_collected)}
              </div>
              <p className="text-xs text-muted-foreground">
                Collected across {analyticsData.finance.schools_with_finance} schools
              </p>
              <p className="text-xs text-red-600 mt-1">
                {formatCurrency(analyticsData.finance.total_outstanding)} outstanding
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Individual School Analytics */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Individual School Performance</h3>
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">
            Individual school analytics are available in the detailed Schools Analytics section.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Navigate to the Schools Analytics page for comprehensive per-school breakdowns.
          </p>
        </div>
      </div>

      {/* System Health Indicators */}
      <div>
        <h3 className="text-xl font-semibold mb-4">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active Schools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {analyticsData.schools.active_schools}
              </div>
              <p className="text-sm text-muted-foreground">
                of {analyticsData.schools.total_schools} total schools
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {analyticsData.system.uptime_percentage.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">
                System uptime
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EduFamSystemAnalytics;
