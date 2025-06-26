
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSchoolAnalytics } from '@/hooks/useSchoolAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, GraduationCap, CalendarCheck, DollarSign, AlertTriangle, Building2, Users, TrendingUp, MapPin } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const SchoolAnalyticsDetail = () => {
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
        <p className="text-gray-600">Loading detailed school analytics...</p>
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
            Failed to load detailed school analytics. Please try again.
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
    return `${rate.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-6">Individual School Analytics</h3>
        
        <div className="space-y-6">
          {schoolAnalytics.map((school) => (
            <Card key={school.school_id} className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-6 w-6 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg text-blue-900">
                        {school.school_name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-700">
                          {school.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Grade Summary */}
                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-900">Grade Summary</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-blue-600">
                        {school.grades_summary.average_grade.toFixed(1)}
                      </div>
                      <p className="text-sm text-blue-700">Average Grade</p>
                      <div className="text-sm text-blue-600">
                        <div>{school.grades_summary.total_grades} total grades</div>
                        <div>{school.grades_summary.students_with_grades} students assessed</div>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Summary */}
                  <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                    <div className="flex items-center gap-2 mb-3">
                      <CalendarCheck className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-green-900">Attendance Summary</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-green-600">
                        {formatPercentage(school.attendance_summary.attendance_rate)}
                      </div>
                      <p className="text-sm text-green-700">Attendance Rate</p>
                      <div className="text-sm text-green-600">
                        <div>{school.attendance_summary.total_records.toLocaleString()} total records</div>
                        <div>{school.attendance_summary.students_tracked} students tracked</div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="h-5 w-5 text-purple-600" />
                      <h4 className="font-semibold text-purple-900">Financial Summary</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatCurrency(school.financial_summary.total_fees_collected)}
                      </div>
                      <p className="text-sm text-purple-700">Total Collected</p>
                      <div className="text-sm text-purple-600">
                        <div className="text-red-600">
                          {formatCurrency(school.financial_summary.outstanding_balance)} outstanding
                        </div>
                        <div>{school.financial_summary.students_with_fees} students with fees</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Metrics */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <Users className="h-4 w-4 mx-auto mb-1 text-gray-600" />
                      <div className="font-semibold text-gray-900">
                        {school.grades_summary.students_with_grades}
                      </div>
                      <div className="text-gray-600">Students</div>
                    </div>
                    <div className="text-center">
                      <GraduationCap className="h-4 w-4 mx-auto mb-1 text-gray-600" />
                      <div className="font-semibold text-gray-900">
                        {school.grades_summary.total_grades}
                      </div>
                      <div className="text-gray-600">Grades</div>
                    </div>
                    <div className="text-center">
                      <CalendarCheck className="h-4 w-4 mx-auto mb-1 text-gray-600" />
                      <div className="font-semibold text-gray-900">
                        {school.attendance_summary.total_records}
                      </div>
                      <div className="text-gray-600">Records</div>
                    </div>
                    <div className="text-center">
                      <DollarSign className="h-4 w-4 mx-auto mb-1 text-gray-600" />
                      <div className="font-semibold text-gray-900">
                        {school.financial_summary.students_with_fees}
                      </div>
                      <div className="text-gray-600">Fee Accounts</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SchoolAnalyticsDetail;
