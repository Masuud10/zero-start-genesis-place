import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";

interface ClassAnalyticsData {
  classPerformance: Array<{
    className: string;
    averageGrade: number;
    studentCount: number;
    attendanceRate: number;
  }>;
  attendanceTrend: Array<{
    date: string;
    rate: number;
  }>;
  gradeDistribution: Array<{
    grade: string;
    count: number;
    percentage: number;
  }>;
  gradingStatus: Array<{
    exam: string;
    submitted: number;
    total: number;
    status: "complete" | "pending" | "not-started";
  }>;
  termPerformance: Array<{
    term: string;
    average: number;
    improvement: number;
  }>;
}

const ClassAnalyticsOverview: React.FC = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();

  const {
    data: analyticsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["teacher-class-analytics", user?.id, schoolId],
    queryFn: async (): Promise<ClassAnalyticsData> => {
      if (!user?.id || !schoolId) {
        throw new Error("User ID and School ID are required");
      }

      console.log("Fetching class analytics for teacher:", user.id);

      // Get teacher's assigned classes with proper filtering
      const { data: teacherAssignments, error: assignmentsError } =
        await supabase
          .from("subject_teacher_assignments")
          .select(
            `
          class_id,
          classes!inner(id, name, level, stream)
        `
          )
          .eq("teacher_id", user.id)
          .eq("school_id", schoolId)
          .eq("is_active", true)
          .not("class_id", "is", null);

      if (assignmentsError) {
        console.error("Error fetching teacher assignments:", assignmentsError);
        throw assignmentsError;
      }

      const uniqueClasses =
        teacherAssignments
          ?.filter((ta) => ta.classes)
          .map((ta) => ta.classes)
          .filter(
            (cls, index, self) =>
              index === self.findIndex((c) => c.id === cls.id)
          ) || [];

      const classIds = uniqueClasses.map((c) => c.id);

      if (classIds.length === 0) {
        return {
          classPerformance: [],
          attendanceTrend: [],
          gradeDistribution: [],
          gradingStatus: [],
          termPerformance: [],
        };
      }

      // Get class performance data
      const classPerformance = [];
      for (const classItem of uniqueClasses) {
        // Get average grades for this class (only approved grades)
        const { data: grades } = await supabase
          .from("grades")
          .select("percentage, score, max_score")
          .eq("class_id", classItem.id)
          .eq("school_id", schoolId)
          .in("status", ["approved", "released"])
          .not("percentage", "is", null);

        // Get student count
        const { count: studentCount } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("class_id", classItem.id)
          .eq("school_id", schoolId)
          .eq("is_active", true);

        // Get attendance rate for last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: attendance } = await supabase
          .from("attendance")
          .select("status")
          .eq("class_id", classItem.id)
          .eq("school_id", schoolId)
          .gte("date", thirtyDaysAgo.toISOString().split("T")[0]);

        const attendanceRate =
          attendance && attendance.length > 0
            ? Math.round(
                (attendance.filter((a) => a.status === "present").length /
                  attendance.length) *
                  100
              )
            : 0;

        const averageGrade =
          grades && grades.length > 0
            ? Math.round(
                grades.reduce((sum, g) => sum + (g.percentage || 0), 0) /
                  grades.length
              )
            : 0;

        classPerformance.push({
          className: classItem.name || "Unknown Class",
          averageGrade,
          studentCount: studentCount || 0,
          attendanceRate,
        });
      }

      // Get attendance trend for last 7 days
      const attendanceTrend = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        const { data: dayAttendance } = await supabase
          .from("attendance")
          .select("status")
          .in("class_id", classIds)
          .eq("date", dateStr)
          .eq("school_id", schoolId);

        const rate =
          dayAttendance && dayAttendance.length > 0
            ? Math.round(
                (dayAttendance.filter((a) => a.status === "present").length /
                  dayAttendance.length) *
                  100
              )
            : 0;

        attendanceTrend.push({
          date: date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          rate,
        });
      }

      // Get grade distribution (only for approved/released grades)
      const { data: allGrades } = await supabase
        .from("grades")
        .select("letter_grade, cbc_performance_level, curriculum_type")
        .in("class_id", classIds)
        .eq("school_id", schoolId)
        .in("status", ["approved", "released"])
        .or("letter_grade.not.is.null,cbc_performance_level.not.is.null");

      const gradeCounts: { [key: string]: number } = {};
      allGrades?.forEach((g) => {
        const grade =
          g.curriculum_type === "cbc"
            ? g.cbc_performance_level
            : g.letter_grade;
        if (grade) {
          gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
        }
      });

      const totalGrades = Object.values(gradeCounts).reduce(
        (sum, count) => sum + count,
        0
      );
      const gradeDistribution = Object.entries(gradeCounts).map(
        ([grade, count]) => ({
          grade,
          count,
          percentage:
            totalGrades > 0 ? Math.round((count / totalGrades) * 100) : 0,
        })
      );

      // Get grading status data
      const gradingStatus = [];
      for (const classItem of uniqueClasses) {
        // Get total students in class
        const { count: totalStudents } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("class_id", classItem.id)
          .eq("school_id", schoolId)
          .eq("is_active", true);

        // Get submitted grades for this class
        const { count: submittedGrades } = await supabase
          .from("grades")
          .select("*", { count: "exact", head: true })
          .eq("class_id", classItem.id)
          .eq("school_id", schoolId)
          .eq("submitted_by", user.id)
          .in("status", ["submitted", "approved", "released"]);

        const total = totalStudents || 0;
        const submitted = submittedGrades || 0;

        let status: "complete" | "pending" | "not-started";
        if (submitted === 0) {
          status = "not-started";
        } else if (submitted === total) {
          status = "complete";
        } else {
          status = "pending";
        }

        gradingStatus.push({
          exam: `${classItem.name} - All Subjects`,
          submitted,
          total,
          status,
        });
      }

      // Get term performance data (mock data for now, would be enhanced with actual term data)
      const termPerformance = [
        { term: "Term 1", average: 75, improvement: 5 },
        { term: "Term 2", average: 78, improvement: 3 },
        { term: "Term 3", average: 82, improvement: 4 },
      ];

      return {
        classPerformance,
        attendanceTrend,
        gradeDistribution,
        gradingStatus,
        termPerformance,
      };
    },
    enabled: !!user?.id && !!schoolId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const chartConfig = {
    averageGrade: { label: "Average Grade", color: "#3b82f6" },
    attendanceRate: { label: "Attendance Rate", color: "#10b981" },
    rate: { label: "Attendance Rate", color: "#8b5cf6" },
    average: { label: "Term Average", color: "#f59e0b" },
  };

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Class Analytics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Loading analytics...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error("Class analytics error:", error);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Class Analytics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-red-600">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Unable to load analytics data</p>
              {process.env.NODE_ENV === "development" && (
                <p className="text-xs mt-1 text-gray-500">
                  {error instanceof Error ? error.message : "Unknown error"}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData || analyticsData.classPerformance.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Class Analytics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No class data available</p>
            <p className="text-sm mt-1">
              Analytics will appear once you have assigned classes with students
              and grades
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Class Analytics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Class Performance Chart */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Class Performance
              </h3>
              <ChartContainer config={chartConfig} className="h-64">
                <BarChart data={analyticsData.classPerformance}>
                  <XAxis
                    dataKey="className"
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="averageGrade"
                    fill="var(--color-averageGrade)"
                    name="Average Grade %"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </div>

            {/* Attendance Trend Chart */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Attendance Trends (7 Days)
              </h3>
              <ChartContainer config={chartConfig} className="h-64">
                <LineChart data={analyticsData.attendanceTrend}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="var(--color-rate)"
                    strokeWidth={3}
                    name="Attendance Rate %"
                    dot={{ fill: "var(--color-rate)", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </div>

          {/* Grade Distribution and Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Grade Distribution Pie Chart */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Grade Distribution
              </h3>
              {analyticsData.gradeDistribution.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.gradeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ grade, percentage }) =>
                          `${grade}: ${percentage}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analyticsData.gradeDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No grade data available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Performance Summary */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Performance Summary
              </h3>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {analyticsData.classPerformance.map((classData, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {classData.className}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {classData.studentCount} students
                      </p>
                    </div>
                    <div className="text-right flex flex-col gap-1">
                      <Badge variant="outline" className="text-xs">
                        {classData.averageGrade}% avg
                      </Badge>
                      <Badge
                        variant={
                          classData.attendanceRate >= 90
                            ? "default"
                            : classData.attendanceRate >= 80
                            ? "secondary"
                            : "destructive"
                        }
                        className="text-xs"
                      >
                        {classData.attendanceRate}% attendance
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassAnalyticsOverview;
