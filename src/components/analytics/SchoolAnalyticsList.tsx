
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSchoolAnalytics } from '@/hooks/useSchoolAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, School, Users, GraduationCap, CalendarCheck, DollarSign, AlertTriangle, Building2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

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
    return `${Math.round(rate)}%`;
  };

  const getPerformanceColor = (average: number) => {
    if (average >= 80) return 'text-green-600 bg-green-50';
    if (average >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 bg-green-50';
    if (rate >= 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getCollectionColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 bg-green-50';
    if (rate >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Individual School Analytics</h2>
        <p className="text-muted-foreground mb-6">
          Detailed performance metrics for each registered school
        </p>
      </div>

      <div className="space-y-4">
        {schoolAnalytics.map((school) => (
          <Collapsible key={school.school_id} className="w-full">
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <School className="h-5 w-5 text-blue-600" />
                      <div>
                        <CardTitle className="text-lg">{school.school_name}</CardTitle>
                        <p className="text-sm text-gray-500">{school.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline" className="text-xs">
                        {school.grades_summary.students_with_grades} Students
                      </Badge>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Grade Performance Summary */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <GraduationCap className="h-4 w-4 text-blue-600" />
                          Grade Performance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Average Grade</span>
                          <Badge className={getPerformanceColor(school.grades_summary.average_grade)}>
                            {Math.round(school.grades_summary.average_grade)}%
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Grades</span>
                          <span className="font-medium">{school.grades_summary.total_grades}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Students Assessed</span>
                          <span className="font-medium">{school.grades_summary.students_with_grades}</span>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex items-center gap-2">
                            {school.grades_summary.average_grade >= 70 ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : school.grades_summary.average_grade >= 50 ? (
                              <Minus className="h-4 w-4 text-yellow-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-xs text-gray-500">
                              {school.grades_summary.average_grade >= 70 ? 'Good Performance' : 
                               school.grades_summary.average_grade >= 50 ? 'Average Performance' : 'Needs Improvement'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Attendance Summary */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <CalendarCheck className="h-4 w-4 text-green-600" />
                          Attendance Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Attendance Rate</span>
                          <Badge className={getAttendanceColor(school.attendance_summary.attendance_rate)}>
                            {formatPercentage(school.attendance_summary.attendance_rate)}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Records</span>
                          <span className="font-medium">{school.attendance_summary.total_records}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Students Tracked</span>
                          <span className="font-medium">{school.attendance_summary.students_tracked}</span>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex items-center gap-2">
                            {school.attendance_summary.attendance_rate >= 90 ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : school.attendance_summary.attendance_rate >= 75 ? (
                              <Minus className="h-4 w-4 text-yellow-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-xs text-gray-500">
                              {school.attendance_summary.attendance_rate >= 90 ? 'Excellent Attendance' : 
                               school.attendance_summary.attendance_rate >= 75 ? 'Good Attendance' : 'Poor Attendance'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Finance Summary */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <DollarSign className="h-4 w-4 text-purple-600" />
                          Finance Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Collection Rate</span>
                          <Badge className={getCollectionColor(
                            school.financial_summary.total_fees_assigned > 0 
                              ? (school.financial_summary.total_fees_collected / school.financial_summary.total_fees_assigned) * 100 
                              : 0
                          )}>
                            {school.financial_summary.total_fees_assigned > 0 
                              ? formatPercentage((school.financial_summary.total_fees_collected / school.financial_summary.total_fees_assigned) * 100)
                              : '0%'
                            }
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Collected</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(school.financial_summary.total_fees_collected)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Outstanding</span>
                          <span className="font-medium text-red-600">
                            {formatCurrency(school.financial_summary.outstanding_balance)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Students with Fees</span>
                          <span className="font-medium">{school.financial_summary.students_with_fees}</span>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex items-center gap-2">
                            {((school.financial_summary.total_fees_collected / school.financial_summary.total_fees_assigned) * 100) >= 90 ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : ((school.financial_summary.total_fees_collected / school.financial_summary.total_fees_assigned) * 100) >= 70 ? (
                              <Minus className="h-4 w-4 text-yellow-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-xs text-gray-500">
                              {((school.financial_summary.total_fees_collected / school.financial_summary.total_fees_assigned) * 100) >= 90 ? 'Excellent Collection' : 
                               ((school.financial_summary.total_fees_collected / school.financial_summary.total_fees_assigned) * 100) >= 70 ? 'Good Collection' : 'Poor Collection'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};

export default SchoolAnalyticsList;
