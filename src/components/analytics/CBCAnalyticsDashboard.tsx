import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  Download,
  Filter,
  TrendingUp,
  Target,
  Users,
  Award,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Calendar,
  BookOpen,
  Star,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { useCBCData } from "@/hooks/useCBCData";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import {
  CBCPerformanceAnalytics,
  CBCStrand,
  CBCSubStrand,
  CBCAssessmentType,
  CBC_PERFORMANCE_LEVELS,
} from "@/types/cbc";

// Type for assessment data that can come from different sources
type AssessmentData = {
  student_id: string;
  performance_level?: string;
  strand_name?: string;
  assessment_type?: string;
  learning_area?: {
    learning_area_name?: string;
  };
};

interface CBCAnalyticsDashboardProps {
  classId?: string;
  subjectId?: string;
  term?: string;
  academicYear?: string;
  isPrincipal?: boolean;
}

export const CBCAnalyticsDashboard: React.FC<CBCAnalyticsDashboardProps> = ({
  classId,
  subjectId,
  term,
  academicYear,
  isPrincipal = false,
}) => {
  const { schoolId } = useSchoolScopedData();
  const [selectedClass, setSelectedClass] = useState(classId || "all");
  const [selectedSubject, setSelectedSubject] = useState(subjectId || "all");
  const [selectedTerm, setSelectedTerm] = useState(term || "all");
  const [selectedYear, setSelectedYear] = useState(
    academicYear || new Date().getFullYear().toString()
  );
  const [activeTab, setActiveTab] = useState("overview");

  // Data fetching - using available hooks
  const { data: strandAssessments = [], isLoading: strandAssessmentsLoading } =
    useCBCData().useCBCStrandAssessments(
      selectedClass === "all" ? undefined : selectedClass,
      selectedSubject === "all" ? undefined : selectedSubject,
      selectedTerm === "all" ? undefined : selectedTerm,
      selectedYear
    );
  const { data: grades = [], isLoading: gradesLoading } =
    useCBCData().useCBCGrades(
      selectedClass === "all" ? undefined : selectedClass,
      selectedSubject === "all" ? undefined : selectedSubject,
      selectedTerm === "all" ? undefined : selectedTerm,
      selectedYear
    );
  const { data: learningAreas = [] } = useCBCData().useCBCLearningAreas(
    selectedSubject === "all" ? undefined : selectedSubject,
    selectedClass === "all" ? undefined : selectedClass
  );
  const { data: performanceSummary = [] } =
    useCBCData().useCBCPerformanceSummary(
      selectedClass === "all" ? undefined : selectedClass,
      selectedSubject === "all" ? undefined : selectedSubject,
      selectedTerm === "all" ? undefined : selectedTerm,
      selectedYear
    );

  // Create analytics data from available data
  const analytics = useMemo(() => {
    const allAssessments = [...strandAssessments, ...grades];

    if (allAssessments.length === 0) {
      return {
        total_assessments: 0,
        performance_distribution: { EM: 0, AP: 0, PR: 0, AD: 0 },
        strand_performance: {},
        assessment_type_distribution: {},
        progress_over_time: [],
      };
    }

    // Calculate performance distribution
    const performanceCounts = { EM: 0, AP: 0, PR: 0, AD: 0 };
    const strandCounts: Record<
      string,
      { EM: 0; AP: 0; PR: 0; AD: 0; total: 0 }
    > = {};
    const assessmentTypeCounts: Record<string, number> = {};

    allAssessments.forEach((assessment: AssessmentData) => {
      // Count performance levels
      if (assessment.performance_level) {
        performanceCounts[assessment.performance_level]++;
      }

      // Count by strand/learning area
      const strandName =
        assessment.strand_name ||
        assessment.learning_area?.learning_area_name ||
        "General";
      if (!strandCounts[strandName]) {
        strandCounts[strandName] = { EM: 0, AP: 0, PR: 0, AD: 0, total: 0 };
      }
      if (assessment.performance_level) {
        strandCounts[strandName][assessment.performance_level]++;
        strandCounts[strandName].total++;
      }

      // Count by assessment type
      const assessmentType = assessment.assessment_type || "General";
      assessmentTypeCounts[assessmentType] =
        (assessmentTypeCounts[assessmentType] || 0) + 1;
    });

    // Calculate strand averages
    const strandPerformance: Record<
      string,
      { EM: number; AP: number; PR: number; AD: number; average: number }
    > = {};
    Object.entries(strandCounts).forEach(([strand, counts]) => {
      const total = counts.total;
      const average =
        total > 0
          ? (counts.EM * 1 + counts.AP * 2 + counts.PR * 3 + counts.AD * 4) /
            total
          : 0;

      strandPerformance[strand] = {
        EM: counts.EM,
        AP: counts.AP,
        PR: counts.PR,
        AD: counts.AD,
        average,
      };
    });

    return {
      total_assessments: allAssessments.length,
      performance_distribution: performanceCounts,
      strand_performance: strandPerformance,
      assessment_type_distribution: assessmentTypeCounts,
      progress_over_time: [], // We don't have time-series data in the current structure
    };
  }, [strandAssessments, grades]);

  const analyticsLoading = strandAssessmentsLoading || gradesLoading;

  // Chart colors
  const chartColors = {
    EM: "#EF4444",
    AP: "#F59E0B",
    PR: "#3B82F6",
    AD: "#10B981",
  };

  // Performance distribution data for charts
  const performanceDistributionData = useMemo(() => {
    if (!analytics) return [];

    return Object.entries(analytics.performance_distribution).map(
      ([level, count]) => ({
        level,
        count,
        percentage:
          analytics.total_assessments > 0
            ? (count / analytics.total_assessments) * 100
            : 0,
        color: chartColors[level as keyof typeof chartColors],
      })
    );
  }, [analytics]);

  // Strand performance data for charts
  const strandPerformanceData = useMemo(() => {
    if (!analytics) return [];

    return Object.entries(analytics.strand_performance).map(
      ([strand, data]) => ({
        strand,
        EM: data.EM,
        AP: data.AP,
        PR: data.PR,
        AD: data.AD,
        average: data.average,
        total: data.EM + data.AP + data.PR + data.AD,
      })
    );
  }, [analytics]);

  // Assessment type distribution data
  const assessmentTypeData = useMemo(() => {
    if (!analytics) return [];

    return Object.entries(analytics.assessment_type_distribution).map(
      ([typeId, count]) => {
        return {
          type: typeId,
          count,
          percentage:
            analytics.total_assessments > 0
              ? (count / analytics.total_assessments) * 100
              : 0,
        };
      }
    );
  }, [analytics]);

  // Progress over time data
  const progressOverTimeData = useMemo(() => {
    if (!analytics?.progress_over_time) return [];

    return analytics.progress_over_time.map((item, index) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString(),
      index,
    }));
  }, [analytics]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!analytics) return null;

    const allAssessments = [...strandAssessments, ...grades];
    const totalStudents = new Set(
      allAssessments.map((sa: AssessmentData) => sa.student_id)
    ).size;
    const totalStrands = Object.keys(analytics.strand_performance).length;
    const averagePerformance =
      analytics.total_assessments > 0
        ? (analytics.performance_distribution.EM * 1 +
            analytics.performance_distribution.AP * 2 +
            analytics.performance_distribution.PR * 3 +
            analytics.performance_distribution.AD * 4) /
          analytics.total_assessments
        : 0;

    return {
      totalAssessments: analytics.total_assessments,
      totalStudents,
      totalStrands,
      averagePerformance: averagePerformance.toFixed(1),
      topPerformingStrand:
        Object.entries(analytics.strand_performance).sort(
          ([, a], [, b]) => b.average - a.average
        )[0]?.[0] || "N/A",
    };
  }, [analytics, strandAssessments, grades]);

  // Loading state
  if (analyticsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading CBC Analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-blue-900">
            <BarChart3 className="w-6 h-6" />
            CBC Performance Analytics Dashboard
          </CardTitle>
          <CardDescription className="text-blue-700">
            Comprehensive insights into Competency-Based Curriculum performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {/* Class options would be populated here */}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {/* Subject options would be populated here */}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Term</label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="All Terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terms</SelectItem>
                  <SelectItem value="Term 1">Term 1</SelectItem>
                  <SelectItem value="Term 2">Term 2</SelectItem>
                  <SelectItem value="Term 3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Academic Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {summaryStats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {summaryStats.totalAssessments}
                  </p>
                  <p className="text-sm text-gray-600">Total Assessments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {summaryStats.totalStudents}
                  </p>
                  <p className="text-sm text-gray-600">Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {summaryStats.totalStrands}
                  </p>
                  <p className="text-sm text-gray-600">Strands</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {summaryStats.averagePerformance}
                  </p>
                  <p className="text-sm text-gray-600">Avg Performance</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-lg font-bold truncate">
                    {summaryStats.topPerformingStrand}
                  </p>
                  <p className="text-sm text-gray-600">Top Strand</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="strands">Strand Analysis</TabsTrigger>
          <TabsTrigger value="assessments">Assessment Types</TabsTrigger>
          <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Performance Level Distribution
                </CardTitle>
                <CardDescription>
                  Distribution of students across performance levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={performanceDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ level, percentage }) =>
                        `${level}: ${percentage.toFixed(1)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {performanceDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Level Legend */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Level Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {CBC_PERFORMANCE_LEVELS.map((level) => (
                    <div
                      key={level.level_code}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor:
                              chartColors[
                                level.level_code as keyof typeof chartColors
                              ],
                          }}
                        />
                        <div>
                          <div className="font-medium">{level.level_name}</div>
                          <div className="text-sm text-gray-600">
                            {level.level_description}
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-gray-100 text-gray-800">
                        {performanceDistributionData.find(
                          (d) => d.level === level.level_code
                        )?.count || 0}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Strand Analysis Tab */}
        <TabsContent value="strands" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Strand Performance Analysis
              </CardTitle>
              <CardDescription>
                Performance breakdown by learning strands
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={strandPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="strand" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="EM"
                    stackId="a"
                    fill={chartColors.EM}
                    name="Emerging"
                  />
                  <Bar
                    dataKey="AP"
                    stackId="a"
                    fill={chartColors.AP}
                    name="Approaching"
                  />
                  <Bar
                    dataKey="PR"
                    stackId="a"
                    fill={chartColors.PR}
                    name="Proficient"
                  />
                  <Bar
                    dataKey="AD"
                    stackId="a"
                    fill={chartColors.AD}
                    name="Advanced"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Strand Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Strand Performance Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Strand</th>
                      <th className="text-center p-2">Emerging</th>
                      <th className="text-center p-2">Approaching</th>
                      <th className="text-center p-2">Proficient</th>
                      <th className="text-center p-2">Advanced</th>
                      <th className="text-center p-2">Total</th>
                      <th className="text-center p-2">Average</th>
                    </tr>
                  </thead>
                  <tbody>
                    {strandPerformanceData.map((strand) => (
                      <tr key={strand.strand} className="border-b">
                        <td className="p-2 font-medium">{strand.strand}</td>
                        <td className="text-center p-2">
                          <Badge
                            variant="outline"
                            className="bg-red-50 text-red-700"
                          >
                            {strand.EM}
                          </Badge>
                        </td>
                        <td className="text-center p-2">
                          <Badge
                            variant="outline"
                            className="bg-yellow-50 text-yellow-700"
                          >
                            {strand.AP}
                          </Badge>
                        </td>
                        <td className="text-center p-2">
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700"
                          >
                            {strand.PR}
                          </Badge>
                        </td>
                        <td className="text-center p-2">
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700"
                          >
                            {strand.AD}
                          </Badge>
                        </td>
                        <td className="text-center p-2 font-medium">
                          {strand.total}
                        </td>
                        <td className="text-center p-2">
                          <Badge className="bg-purple-100 text-purple-800">
                            {strand.average.toFixed(1)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessment Types Tab */}
        <TabsContent value="assessments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assessment Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Assessment Type Distribution
                </CardTitle>
                <CardDescription>
                  Distribution of different assessment methods used
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={assessmentTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percentage }) =>
                        `${type}: ${percentage.toFixed(1)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {assessmentTypeData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`hsl(${index * 60}, 70%, 60%)`}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Assessment Type Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Assessment Type Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={assessmentTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Progress Tracking Tab */}
        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="w-5 h-5" />
                Performance Progress Over Time
              </CardTitle>
              <CardDescription>
                Track performance trends across assessment periods
              </CardDescription>
            </CardHeader>
            <CardContent>
              {progressOverTimeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={progressOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="average_performance"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <LineChartIcon className="w-12 h-12 mx-auto mb-4" />
                  <p>No progress data available for the selected period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Analytics</CardTitle>
          <CardDescription>
            Download analytics reports in various formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export as PDF
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export as Excel
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Charts
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
