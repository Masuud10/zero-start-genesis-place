
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSchoolAnalytics } from '@/hooks/useSchoolAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, School, Users, GraduationCap, CalendarCheck, DollarSign, AlertTriangle, Building2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import SchoolAnalyticsDetail from './SchoolAnalyticsDetail';

const SchoolAnalyticsOverview = () => {
  const { user } = useAuth();
  const { data: schoolAnalytics, isLoading, error } = useSchoolAnalytics();

  // Permission check
  if (!user || user.role !== 'edufam_admin') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Alert className="bg-red-50 border-red-200 max-w-md">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-600">Access Denied</AlertTitle>
          <AlertDescription className="text-red-700">
            Only EduFam Admins can access school analytics.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600">Loading school analytics...</p>
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
            Failed to load school analytics data. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!schoolAnalytics || schoolAnalytics.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Schools Found</h3>
        <p className="text-gray-500">No schools are registered in the system yet.</p>
      </div>
    );
  }

  // Calculate aggregate stats for the overview cards
  const totalSchools = schoolAnalytics.length;
  const totalStudentsWithGrades = schoolAnalytics.reduce((sum, school) => 
    sum + school.grades_summary.students_with_grades, 0
  );
  const averageAttendanceRate = schoolAnalytics.reduce((sum, school) => 
    sum + school.attendance_summary.attendance_rate, 0
  ) / totalSchools;
  const totalOutstandingFees = schoolAnalytics.reduce((sum, school) => 
    sum + school.financial_summary.outstanding_balance, 0
  );
  const averageGrade = schoolAnalytics.reduce((sum, school) => 
    sum + school.grades_summary.average_grade, 0
  ) / totalSchools;
  const totalFeesCollected = schoolAnalytics.reduce((sum, school) => 
    sum + school.financial_summary.total_fees_collected, 0
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Schools Analytics Overview</h2>
        <p className="text-muted-foreground">
          Comprehensive analytics across all registered schools
        </p>
      </div>

      {/* Overall Stats Icons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <School className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalSchools}</div>
            <p className="text-xs text-muted-foreground">
              Active institutions
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grades</CardTitle>
            <GraduationCap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{averageGrade.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Across all schools
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
            <CalendarCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{averageAttendanceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              System-wide rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">KES {totalFeesCollected.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Revenue generated
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">KES {totalOutstandingFees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Individual School Analytics */}
      <SchoolAnalyticsDetail />
    </div>
  );
};

export default SchoolAnalyticsOverview;
