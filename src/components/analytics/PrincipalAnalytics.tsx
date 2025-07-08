import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { usePrincipalAnalyticsData } from "@/hooks/usePrincipalAnalyticsData";
import {
  Loader2,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Users,
  BookOpen,
  GraduationCap,
  Clock,
} from "lucide-react";
import { useCurrentAcademicInfo } from "@/hooks/useCurrentAcademicInfo";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAcademicModuleIntegration } from "@/hooks/useAcademicModuleIntegration";

interface PrincipalAnalyticsProps {
  schoolId?: string;
}

const PrincipalAnalytics: React.FC<PrincipalAnalyticsProps> = ({
  schoolId: propSchoolId,
}) => {
  const {
    schoolId: contextSchoolId,
    isReady,
    validateSchoolAccess,
  } = useSchoolScopedData();
  const effectiveSchoolId = propSchoolId || contextSchoolId;

  const { data, isLoading, error, refetch } = usePrincipalAnalyticsData();
  const { academicInfo, loading: academicInfoLoading } =
    useCurrentAcademicInfo(effectiveSchoolId);

  const {
    context,
    isLoading: academicLoading,
    error: academicError,
    data: academicData,
    isValid,
    refreshData,
    currentPeriod,
    validation,
  } = useAcademicModuleIntegration(["analytics"]);

  const chartConfig = {
    average: { label: "Average Score", color: "#3b82f6" },
    attendance: { label: "Attendance Rate", color: "#10b981" },
    improvement: { label: "Improvement", color: "#8b5cf6" },
  };

  // Colors for charts
  const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"];

  // Chart configurations
  const classChartConfig = {
    average: { label: "Academic Average (%)", color: "#3b82f6" },
    attendance: { label: "Attendance Rate (%)", color: "#10b981" },
  };

  const subjectChartConfig = {
    average: { label: "Average Score (%)", color: "#10b981" },
  };

  // Debug logging
  React.useEffect(() => {
    if (data) {
      console.log("📊 Principal Analytics Data:", {
        keyMetrics: data.keyMetrics,
        classPerformance: data.classPerformance,
        subjectPerformance: data.subjectPerformance,
        studentRankings: data.studentRankings,
        teacherActivity: data.teacherActivity,
        financialSummary: data.financialSummary,
      });
    }
  }, [data]);

  // Debug school context
  React.useEffect(() => {
    console.log("📊 School Context:", {
      schoolId: effectiveSchoolId,
      isSystemAdmin: true, // Assuming isSystemAdmin is always true for this component
      isReady,
      currentTerm: academicInfo?.term,
      currentYear: academicInfo?.year,
    });
  }, [effectiveSchoolId, isReady, academicInfo]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-700">
            Failed to load analytics data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data || !data.keyMetrics) {
    return (
      <Card className="flex flex-col items-center justify-center p-8 text-center">
        <TrendingUp className="h-12 w-12 text-blue-500" />
        <CardTitle className="mt-4">Getting Started with Analytics</CardTitle>
        <p className="text-muted-foreground mt-2">
          Analytics will appear as you add students, classes, and start
          recording grades and attendance.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => refetch()}>
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

  // Prepare chart data for class performance
  const classChartData = classPerformance.map((cls) => ({
    name: cls.class,
    average: cls.average,
    attendance: cls.attendance,
    students: cls.studentCount,
  }));

  // Prepare chart data for subject performance
  const subjectChartData = subjectPerformance.map((subject) => ({
    name: subject.subject,
    average: subject.average,
    improvement: subject.improvement,
    grades: subject.totalGrades,
  }));

  return (
    <div className="space-y-6">
      {/* Key Metrics with enhanced validation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
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

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-green-600" />
              School Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {keyMetrics?.schoolAverage
                ? keyMetrics.schoolAverage.toFixed(1)
                : "0.0"}
              %
            </div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {keyMetrics?.attendanceRate
                ? keyMetrics.attendanceRate.toFixed(1)
                : "0.0"}
              %
            </div>
            <p className="text-xs text-muted-foreground">Current term</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-orange-600" />
              Results Released
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {keyMetrics?.resultsReleased || 0}/
              {subjectPerformance?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Subjects published</p>
          </CardContent>
        </Card>
      </div>

      {/* Class Performance Overview with enhanced error handling */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Class Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.classPerformance.length > 0 ? (
            <div className="space-y-4">
              <ChartContainer config={classChartConfig} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.classPerformance}>
                    <XAxis
                      dataKey="class"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="average"
                      fill={classChartConfig.average.color}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.classPerformance.map((cls, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{cls.class}</p>
                        <p className="text-xs text-muted-foreground">
                          {cls.studentCount} students
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{cls.average}%</p>
                        <p className="text-xs text-muted-foreground">
                          {cls.attendance}% attendance
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Class Performance Data Available
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                To see class performance metrics, you need to:
              </p>
              <div className="text-sm text-muted-foreground space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Add students to your classes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Have teachers submit grades for assessments</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Record attendance data for students</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Subject Performance
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {data.subjectPerformance.length > 0 ? (
              <ChartContainer config={subjectChartConfig} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.subjectPerformance}>
                    <XAxis
                      dataKey="subject"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="average"
                      fill={subjectChartConfig.average.color}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Subject Performance Data
                </h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md">
                  Subject performance data will appear once teachers submit
                  grades for assessments.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => refetch()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Student Rankings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Top Student Rankings
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {data.studentRankings.length > 0 ? (
              <div className="space-y-4">
                {data.studentRankings.map((student, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                        {student.position}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {student.class}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{student.average}%</p>
                      <p className="text-xs text-muted-foreground">Average</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Student Rankings Available
                </h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md">
                  Student rankings will appear once grades are submitted and
                  processed.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => refetch()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Teacher Activity Logs with enhanced validation */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-600" />
            Teacher Grading Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teacherActivity && teacherActivity.length > 0 ? (
            <div className="space-y-4">
              {teacherActivity.map((teacher, index) => (
                <div
                  key={`${teacher.teacher}-${index}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium">
                      {teacher.teacher || "Unknown Teacher"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {teacher.grades || 0} grades submitted
                      {teacher.lastActivity && (
                        <span className="ml-2">
                          • Last activity:{" "}
                          {new Date(teacher.lastActivity).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium">
                        {teacher.submissions || 0}
                      </div>
                      <div className="text-muted-foreground">Submissions</div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`font-medium ${
                          teacher.onTime >= 90
                            ? "text-green-600"
                            : teacher.onTime >= 70
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {teacher.onTime || 0}%
                      </div>
                      <div className="text-muted-foreground">On Time</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No teacher activity data available.</p>
              <p className="text-sm">
                Teachers will appear here once they start submitting grades.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PrincipalAnalytics;
