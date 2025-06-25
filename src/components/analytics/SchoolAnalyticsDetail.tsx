
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSchoolAnalytics } from '@/hooks/useSchoolAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, School, Users, GraduationCap, CalendarCheck, DollarSign, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
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
            Only EduFam Admins can access detailed school analytics.
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
            Failed to load detailed school analytics data. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!schoolAnalytics || schoolAnalytics.length === 0) {
    return (
      <div className="text-center py-12">
        <School className="h-12 w-12 mx-auto text-gray-400 mb-4" />
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

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCollectionRate = (collected: number, assigned: number) => {
    if (assigned === 0) return 0;
    return (collected / assigned) * 100;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Detailed School Analytics</h2>
        <p className="text-muted-foreground">
          Comprehensive performance metrics for all registered schools
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {schoolAnalytics.map((school) => {
          const collectionRate = getCollectionRate(
            school.financial_summary.total_fees_collected,
            school.financial_summary.total_fees_assigned
          );

          return (
            <Card key={school.school_id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-blue-100">
                      <School className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900">{school.school_name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {school.location}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    ID: {school.school_id.slice(0, 8)}...
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Academic Performance Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <GraduationCap className="h-5 w-5 text-purple-600" />
                      <h4 className="font-semibold text-gray-900">Academic Performance</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Average Grade</span>
                          <span className={`text-lg font-bold ${getPerformanceColor(school.grades_summary.average_grade)}`}>
                            {school.grades_summary.average_grade.toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={school.grades_summary.average_grade} 
                          className="h-2" 
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-xl font-bold text-gray-900">
                            {school.grades_summary.total_grades}
                          </div>
                          <p className="text-xs text-gray-600">Total Grades</p>
                        </div>
                        
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-xl font-bold text-gray-900">
                            {school.grades_summary.students_with_grades}
                          </div>
                          <p className="text-xs text-gray-600">Students Assessed</p>
                        </div>
                      </div>

                      {school.grades_summary.average_grade > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          {school.grades_summary.average_grade >= 70 ? (
                            <>
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span className="text-green-600">Good Performance</span>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="h-4 w-4 text-red-600" />
                              <span className="text-red-600">Needs Improvement</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Attendance Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <CalendarCheck className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-gray-900">Attendance Overview</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Attendance Rate</span>
                          <span className={`text-lg font-bold ${getPerformanceColor(school.attendance_summary.attendance_rate)}`}>
                            {formatPercentage(school.attendance_summary.attendance_rate)}
                          </span>
                        </div>
                        <Progress 
                          value={school.attendance_summary.attendance_rate} 
                          className="h-2" 
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-xl font-bold text-gray-900">
                            {school.attendance_summary.total_records}
                          </div>
                          <p className="text-xs text-gray-600">Total Records</p>
                        </div>
                        
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-xl font-bold text-gray-900">
                            {school.attendance_summary.students_tracked}
                          </div>
                          <p className="text-xs text-gray-600">Students Tracked</p>
                        </div>
                      </div>

                      {school.attendance_summary.attendance_rate > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          {school.attendance_summary.attendance_rate >= 85 ? (
                            <>
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span className="text-green-600">Excellent Attendance</span>
                            </>
                          ) : school.attendance_summary.attendance_rate >= 75 ? (
                            <>
                              <span className="text-yellow-600">Good Attendance</span>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="h-4 w-4 text-red-600" />
                              <span className="text-red-600">Poor Attendance</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Financial Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Financial Overview</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Collection Rate</span>
                          <span className={`text-lg font-bold ${getPerformanceColor(collectionRate)}`}>
                            {formatPercentage(collectionRate)}
                          </span>
                        </div>
                        <Progress 
                          value={collectionRate} 
                          className="h-2" 
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">Total Assigned</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(school.financial_summary.total_fees_assigned)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span className="text-sm text-gray-600">Total Collected</span>
                          <span className="font-semibold text-green-700">
                            {formatCurrency(school.financial_summary.total_fees_collected)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                          <span className="text-sm text-gray-600">Outstanding</span>
                          <span className="font-semibold text-red-700">
                            {formatCurrency(school.financial_summary.outstanding_balance)}
                          </span>
                        </div>
                        
                        <div className="text-center p-2 bg-gray-100 rounded-lg">
                          <span className="text-xs text-gray-600">
                            {school.financial_summary.students_with_fees} students with fees
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SchoolAnalyticsDetail;
