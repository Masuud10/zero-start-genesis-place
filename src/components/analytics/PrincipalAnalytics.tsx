
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { usePrincipalAnalyticsData } from "@/hooks/usePrincipalAnalyticsData";
import { Loader2, AlertCircle, TrendingUp, RefreshCw } from "lucide-react";
import { useCurrentAcademicInfo } from "@/hooks/useCurrentAcademicInfo";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PrincipalAnalyticsProps {
  schoolId?: string;
}

const PrincipalAnalytics: React.FC<PrincipalAnalyticsProps> = ({ schoolId: propSchoolId }) => {
  const { schoolId: contextSchoolId, isReady, validateSchoolAccess } = useSchoolScopedData();
  const effectiveSchoolId = propSchoolId || contextSchoolId;
  
  const { data, isLoading, error, refetch } = usePrincipalAnalyticsData();
  const { academicInfo, loading: academicInfoLoading } = useCurrentAcademicInfo(effectiveSchoolId);

  const chartConfig = {
    average: { label: "Average Score", color: "#3b82f6" },
    attendance: { label: "Attendance Rate", color: "#10b981" },
    improvement: { label: "Improvement", color: "#8b5cf6" },
  };

  // Enhanced validation
  if (!isReady) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading Analytics...</span>
      </div>
    );
  }

  if (!effectiveSchoolId) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No school context available for analytics. Please refresh the page.
        </AlertDescription>
      </Alert>
    );
  }

  if (!validateSchoolAccess(effectiveSchoolId)) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Access denied. You do not have permission to view this school's analytics.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading || academicInfoLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading Analytics...</span>
      </div>
    );
  }

  if (error) {
    console.error('❌ PrincipalAnalytics: Error loading analytics:', error);
    return (
      <Card className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <CardTitle className="mt-4">Could not load analytics</CardTitle>
        <p className="text-muted-foreground mt-2">
          {error?.message || "Unknown error occurred"}
        </p>
        <Button 
          variant="outline" 
          className="mt-4" 
          onClick={() => refetch()}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </Card>
    );
  }

  if (!data || !data.keyMetrics) {
    return (
      <Card className="flex flex-col items-center justify-center p-8 text-center">
        <TrendingUp className="h-12 w-12 text-blue-500" />
        <CardTitle className="mt-4">Getting Started with Analytics</CardTitle>
        <p className="text-muted-foreground mt-2">
          Analytics will appear as you add students, classes, and start recording grades and attendance.
        </p>
        <Button 
          variant="outline" 
          className="mt-4" 
          onClick={() => refetch()}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </Card>
    );
  }

  const {
    keyMetrics,
    classPerformance = [],
    subjectPerformance = [],
    studentRankings = [],
    teacherActivity = [],
  } = data;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>School Analytics Overview</CardTitle>
              <p className="text-sm text-muted-foreground">
                Displaying data for term:{" "}
                <span className="font-semibold text-primary">
                  {academicInfo?.term || "Current Term"}
                </span>
                , year:{" "}
                <span className="font-semibold text-primary">
                  {academicInfo?.year || new Date().getFullYear()}
                </span>
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics with enhanced validation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {keyMetrics?.totalStudents || 0}
            </div>
            <p className="text-xs text-muted-foreground">Across all classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              School Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {keyMetrics?.schoolAverage ? keyMetrics.schoolAverage.toFixed(1) : '0.0'}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {keyMetrics?.attendanceRate ? keyMetrics.attendanceRate.toFixed(1) : '0.0'}%
            </div>
            <p className="text-xs text-muted-foreground">Current term</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Results Released
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {keyMetrics?.resultsReleased || 0}/{subjectPerformance?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Subjects published</p>
          </CardContent>
        </Card>
      </div>

      {/* Class Performance Overview with enhanced error handling */}
      {classPerformance && classPerformance.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Class Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={classPerformance}>
                <XAxis dataKey="class" tick={{ fontSize: 12 }} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="average"
                  fill="var(--color-average)"
                  name="Academic Average (%)"
                />
                <Bar
                  dataKey="attendance"
                  fill="var(--color-attendance)"
                  name="Attendance Rate (%)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Class Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No class performance data available.</p>
              <p className="text-sm">Add students and grades to see performance metrics.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance with enhanced validation */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectPerformance && subjectPerformance.length > 0 ? (
                subjectPerformance.map((subject, index) => (
                  <div
                    key={`${subject.subject}-${index}`}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{subject.subject || 'Unknown Subject'}</p>
                      <p className="text-sm text-muted-foreground">
                        Average: {subject.average ? subject.average.toFixed(1) : '0.0'}%
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          (subject.improvement || 0) > 0
                            ? "default"
                            : (subject.improvement || 0) < 0
                            ? "destructive"
                            : "secondary"
                        }
                        className={
                          (subject.improvement || 0) > 0
                            ? "bg-green-100 text-green-800"
                            : (subject.improvement || 0) < 0
                            ? "bg-red-100 text-red-800"
                            : ""
                        }
                      >
                        {(subject.improvement || 0) >= 0 ? "+" : ""}
                        {(subject.improvement || 0).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No subject performance data available.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Students with enhanced validation */}
        <Card>
          <CardHeader>
            <CardTitle>Top Student Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {studentRankings && studentRankings.length > 0 ? (
                studentRankings.map((student, index) => (
                  <div
                    key={`${student.name}-${index}`}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        {student.position || index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{student.name || 'Unknown Student'}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.class || 'Unknown Class'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {student.average ? student.average.toFixed(1) : '0.0'}%
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No student ranking data available.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teacher Activity Logs with enhanced validation */}
      <Card>
        <CardHeader>
          <CardTitle>Teacher Grading Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teacherActivity && teacherActivity.length > 0 ? (
              teacherActivity.map((teacher, index) => (
                <div
                  key={`${teacher.teacher}-${index}`}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{teacher.teacher || 'Unknown Teacher'}</p>
                    <p className="text-sm text-muted-foreground">
                      {teacher.grades || 0} grades submitted
                    </p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium">{teacher.submissions || 0}</div>
                      <div className="text-muted-foreground">Submissions</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-green-600">
                        {teacher.onTime || 0}%
                      </div>
                      <div className="text-muted-foreground">On Time</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No teacher activity data available.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrincipalAnalytics;
