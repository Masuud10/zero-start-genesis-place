
import React, { useEffect, useState } from 'react';
import SchoolSummaryFilter from '../shared/SchoolSummaryFilter';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AttendanceBusinessLogic } from '@/services/AttendanceBusinessLogic';
import { TrendingUp, TrendingDown, Minus, Users, Calendar, AlertTriangle } from 'lucide-react';

interface AttendanceAdminSummaryProps {
  loading: boolean;
  error: string | null;
  attendanceSummary: any;
  schools: Array<{ id: string; name: string }>;
  schoolFilter: string | null;
  setSchoolFilter: (filter: string | null) => void;
}

interface EnhancedSummaryData {
  overall_attendance_percentage: number;
  total_students: number;
  total_school_days: number;
  trend: string;
  class_summaries: Array<{
    class_name: string;
    attendance_rate: number;
    chronic_absentees: number;
    perfect_attendance: number;
  }>;
  weekly_trends: Array<{
    week_start: string;
    attendance_rate: number;
    trend_direction: 'up' | 'down' | 'stable';
  }>;
}

const AttendanceAdminSummary: React.FC<AttendanceAdminSummaryProps> = ({
  loading,
  error,
  attendanceSummary,
  schools,
  schoolFilter,
  setSchoolFilter,
}) => {
  const [enhancedData, setEnhancedData] = useState<EnhancedSummaryData | null>(null);
  const [businessLogic, setBusinessLogic] = useState<AttendanceBusinessLogic | null>(null);
  const [insights, setInsights] = useState<{
    key_metrics: Record<string, number>;
    recommendations: string[];
    trends: string[];
  } | null>(null);

  // Initialize business logic when school filter changes
  useEffect(() => {
    if (schoolFilter) {
      const logic = new AttendanceBusinessLogic(schoolFilter);
      setBusinessLogic(logic);
      
      // Load enhanced data
      logic.calculateAttendanceSummary()
        .then(data => setEnhancedData(data))
        .catch(err => console.error('Error loading enhanced attendance data:', err));
      
      // Load insights
      logic.generateAttendanceInsights()
        .then(data => setInsights(data))
        .catch(err => console.error('Error loading attendance insights:', err));
    } else {
      setBusinessLogic(null);
      setEnhancedData(null);
      setInsights(null);
    }
  }, [schoolFilter]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
      case 'up':
        return 'text-green-600';
      case 'declining':
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            System Attendance Overview
          </h1>
          <p className="text-muted-foreground">
            View attendance summaries across all schools.
          </p>
        </div>
        <SchoolSummaryFilter
          schools={schools}
          value={schoolFilter}
          onChange={setSchoolFilter}
        />
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {loading ? (
          <Card><CardContent>Loading summary...</CardContent></Card>
        ) : error ? (
          <Card><CardContent className="text-red-500">{error}</CardContent></Card>
        ) : enhancedData ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{enhancedData.overall_attendance_percentage}%</div>
                <div className={`flex items-center text-xs ${getTrendColor(enhancedData.trend)}`}>
                  {getTrendIcon(enhancedData.trend)}
                  <span className="ml-1">{enhancedData.trend}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{enhancedData.total_students}</div>
                <p className="text-xs text-muted-foreground">Active students</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">School Days</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{enhancedData.total_school_days}</div>
                <p className="text-xs text-muted-foreground">Days tracked</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chronic Absentees</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {insights?.key_metrics?.chronic_absentees || 0}
                </div>
                <p className="text-xs text-muted-foreground">&lt;80% attendance</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card><CardContent>No summary data found.</CardContent></Card>
        )}
      </div>

      {/* Class Performance Analysis */}
      {enhancedData && enhancedData.class_summaries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Class Attendance Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enhancedData.class_summaries.slice(0, 5).map((classData, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{classData.class_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {classData.chronic_absentees} chronic absentees • {classData.perfect_attendance} perfect attendance
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{classData.attendance_rate}%</div>
                    <Badge 
                      variant={classData.attendance_rate >= 85 ? "default" : classData.attendance_rate >= 75 ? "secondary" : "destructive"}
                    >
                      {classData.attendance_rate >= 85 ? "Excellent" : classData.attendance_rate >= 75 ? "Good" : "Needs Improvement"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Trends */}
      {enhancedData && enhancedData.weekly_trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {enhancedData.weekly_trends.slice(-4).map((week, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="text-sm">Week of {new Date(week.week_start).toLocaleDateString()}</div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{week.attendance_rate}%</span>
                    {getTrendIcon(week.trend_direction)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights and Recommendations */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insights.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {insights.trends.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Key Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insights.trends.map((trend, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-secondary mt-1">•</span>
                      {trend}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceAdminSummary;
