
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSchoolAnalytics } from '@/hooks/useSchoolAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, School, Users, GraduationCap, CalendarCheck, DollarSign, AlertTriangle, Building2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const SchoolAnalyticsDetail = () => {
  const { user } = useAuth();
  const { data: schoolAnalytics, isLoading, error } = useSchoolAnalytics();

  // Permission check
  if (!user || user.role !== 'edufam_admin') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-48"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !schoolAnalytics || schoolAnalytics.length === 0) {
    return (
      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">No School Data</AlertTitle>
        <AlertDescription className="text-yellow-700">
          Unable to load individual school analytics. Please check if schools are properly configured.
        </AlertDescription>
      </Alert>
    );
  }

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const formatPercentage = (rate: number) => {
    return `${Math.round(rate)}%`;
  };

  const getPerformanceColor = (average: number) => {
    if (average >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (average >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (rate >= 75) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getCollectionColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (rate >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Individual School Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schoolAnalytics.map((school) => (
            <Card key={school.school_id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <School className="h-4 w-4 text-blue-600" />
                    <CardTitle className="text-base truncate">{school.school_name}</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {school.location || 'N/A'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Grade Performance */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Academic Performance</span>
                    <Badge className={`text-xs ${getPerformanceColor(school.grades_summary.average_grade)}`}>
                      {Math.round(school.grades_summary.average_grade)}%
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    {school.grades_summary.total_grades} grades • {school.grades_summary.students_with_grades} students
                  </div>
                </div>

                {/* Attendance */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Attendance Rate</span>
                    <Badge className={`text-xs ${getAttendanceColor(school.attendance_summary.attendance_rate)}`}>
                      {formatPercentage(school.attendance_summary.attendance_rate)}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    {school.attendance_summary.total_records} records • {school.attendance_summary.students_tracked} tracked
                  </div>
                </div>

                {/* Finance */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Fee Collection</span>
                    <Badge className={`text-xs ${getCollectionColor(
                      school.financial_summary.total_fees_assigned > 0 
                        ? (school.financial_summary.total_fees_collected / school.financial_summary.total_fees_assigned) * 100 
                        : 0
                    )}`}>
                      {school.financial_summary.total_fees_assigned > 0 
                        ? formatPercentage((school.financial_summary.total_fees_collected / school.financial_summary.total_fees_assigned) * 100)
                        : '0%'
                      }
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(school.financial_summary.total_fees_collected)} collected
                  </div>
                  <div className="text-xs text-red-600">
                    {formatCurrency(school.financial_summary.outstanding_balance)} outstanding
                  </div>
                </div>

                {/* Performance Indicators */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      {school.grades_summary.average_grade >= 70 ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : school.grades_summary.average_grade >= 50 ? (
                        <Minus className="h-3 w-3 text-yellow-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span className="text-gray-600">Academic</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {school.attendance_summary.attendance_rate >= 90 ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : school.attendance_summary.attendance_rate >= 75 ? (
                        <Minus className="h-3 w-3 text-yellow-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span className="text-gray-600">Attendance</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {((school.financial_summary.total_fees_collected / school.financial_summary.total_fees_assigned) * 100) >= 90 ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : ((school.financial_summary.total_fees_collected / school.financial_summary.total_fees_assigned) * 100) >= 70 ? (
                        <Minus className="h-3 w-3 text-yellow-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span className="text-gray-600">Finance</span>
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
