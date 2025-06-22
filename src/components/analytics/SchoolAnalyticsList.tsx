
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSchoolAnalytics } from '@/hooks/useSchoolAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, School, Users, GraduationCap, CalendarCheck, DollarSign, AlertTriangle, Building2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const SchoolAnalyticsList = () => {
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

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const formatPercentage = (rate: number) => {
    return `${rate}%`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Individual School Analytics</h2>
        <p className="text-muted-foreground">
          Performance overview for all registered schools
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {schoolAnalytics.map((school) => (
          <Card key={school.school_id} className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <School className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{school.school_name}</h3>
                  <p className="text-sm text-muted-foreground font-normal">
                    {school.location}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Grades Summary */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-gray-900">Academic Performance</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Grades:</span>
                      <span className="text-sm font-medium">{school.grades_summary.total_grades}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Grade:</span>
                      <span className="text-sm font-medium text-blue-600">
                        {school.grades_summary.average_grade}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Students with Grades:</span>
                      <span className="text-sm font-medium">{school.grades_summary.students_with_grades}</span>
                    </div>
                  </div>
                </div>

                {/* Attendance Summary */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium text-gray-900">Attendance Overview</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Records:</span>
                      <span className="text-sm font-medium">{school.attendance_summary.total_records}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Attendance Rate:</span>
                      <span className="text-sm font-medium text-green-600">
                        {formatPercentage(school.attendance_summary.attendance_rate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Students Tracked:</span>
                      <span className="text-sm font-medium">{school.attendance_summary.students_tracked}</span>
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                    <h4 className="font-medium text-gray-900">Financial Overview</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Assigned:</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(school.financial_summary.total_fees_assigned)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Collected:</span>
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(school.financial_summary.total_fees_collected)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Outstanding:</span>
                      <span className="text-sm font-medium text-red-600">
                        {formatCurrency(school.financial_summary.outstanding_balance)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Students with Fees:</span>
                      <span className="text-sm font-medium">{school.financial_summary.students_with_fees}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SchoolAnalyticsList;
