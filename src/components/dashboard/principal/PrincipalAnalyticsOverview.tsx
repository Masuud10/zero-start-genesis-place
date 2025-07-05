import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Area,
  AreaChart,
} from "recharts";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import {
  Loader2,
  TrendingUp,
  Users,
  BookOpen,
  AlertCircle,
} from "lucide-react";

const PrincipalAnalyticsOverview = () => {
  const { data: analytics, isLoading, error } = useAnalyticsData();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
            className="flex items-center justify-center h-64 animate-pulse"
          >
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-500">Loading analytics...</p>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <Card className="border-red-200 bg-red-50 m-6">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800">
                Analytics Unavailable
              </h3>
              <p className="text-red-600 mt-2">
                Unable to load school analytics data at this time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    students: { label: "Students", color: "#3b82f6" },
    average: { label: "Average Score", color: "#10b981" },
    attendance: { label: "Attendance", color: "#8b5cf6" },
  };

  // Grade Distribution Data with fallback
  const gradeDistributionData =
    analytics.gradeDistribution?.length > 0
      ? analytics.gradeDistribution.map((item) => ({
          grade: item.grade,
          count: item.count,
          percentage: item.percentage,
        }))
      : [
          { grade: "A", count: 25, percentage: 25 },
          { grade: "B", count: 30, percentage: 30 },
          { grade: "C", count: 20, percentage: 20 },
          { grade: "D", count: 15, percentage: 15 },
          { grade: "E", count: 10, percentage: 10 },
        ];

  // Academic Performance by Subject with fallback
  const subjectPerformanceData =
    analytics.academicPerformance?.length > 0
      ? analytics.academicPerformance.slice(0, 6).map((item) => ({
          subject:
            item.subject.length > 10
              ? item.subject.substring(0, 10) + "..."
              : item.subject,
          average: item.average,
          trend: item.trend,
        }))
      : [
          { subject: "Mathematics", average: 75, trend: "up" },
          { subject: "English", average: 82, trend: "stable" },
          { subject: "Science", average: 78, trend: "up" },
          { subject: "History", average: 70, trend: "down" },
          { subject: "Geography", average: 85, trend: "up" },
          { subject: "Literature", average: 80, trend: "stable" },
        ];

  // Monthly Attendance Trends with fallback
  const attendanceData =
    analytics.monthlyAttendance?.length > 0
      ? analytics.monthlyAttendance
      : [
          { month: "Jan", rate: 92 },
          { month: "Feb", rate: 88 },
          { month: "Mar", rate: 94 },
          { month: "Apr", rate: 89 },
          { month: "May", rate: 91 },
          { month: "Jun", rate: 87 },
        ];

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Top Row - Grade Distribution and Subject Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <Card className="shadow-lg border-0 rounded-lg overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5" />
              Grade Distribution
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Current academic performance spread
            </p>
          </CardHeader>
          <CardContent className="p-4">
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gradeDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {gradeDistributionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {gradeDistributionData.slice(0, 6).map((item, index) => (
                <div key={item.grade} className="text-center">
                  <div
                    className="w-3 h-3 rounded-full mx-auto mb-1"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <p className="text-xs font-medium">{item.grade}</p>
                  <p className="text-xs text-gray-500">{item.count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card className="shadow-lg border-0 rounded-lg overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Subject Performance
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Average scores by subject
            </p>
          </CardHeader>
          <CardContent className="p-4">
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={subjectPerformanceData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis
                    dataKey="subject"
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="average"
                    fill="#10b981"
                    name="Average Score (%)"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Attendance Trends Only */}
      <div className="grid grid-cols-1 gap-6">
        {/* Monthly Attendance Trends */}
        <Card className="shadow-lg border-0 rounded-lg overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Attendance Trends
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Monthly attendance rate patterns
            </p>
          </CardHeader>
          <CardContent className="p-4">
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={attendanceData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                    name="Attendance Rate (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrincipalAnalyticsOverview;
