
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { usePrincipalAnalyticsData } from '@/hooks/usePrincipalAnalyticsData';
import { Loader2, TrendingUp, Users, BookOpen, Award, GraduationCap, Target } from 'lucide-react';

const PrincipalAnalyticsCharts = () => {
  const { data, isLoading, error } = usePrincipalAnalyticsData();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="col-span-full">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500">Analytics data is not available at the moment.</p>
            <p className="text-sm text-gray-400">Please ensure academic years and terms are configured.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    average: { label: 'Average Score', color: '#3b82f6' },
    attendance: { label: 'Attendance Rate', color: '#10b981' },
    improvement: { label: 'Improvement', color: '#8b5cf6' },
    submissions: { label: 'Submissions', color: '#f59e0b' },
  };

  const subjectColors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Key Performance Metrics */}
      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Key Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium">School Average</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{data.keyMetrics.schoolAverage.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-green-50 to-green-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium">Attendance Rate</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{data.keyMetrics.attendanceRate.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-purple-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium">Total Students</span>
              </div>
              <span className="text-2xl font-bold text-purple-600">{data.keyMetrics.totalStudents}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Class Performance Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Class Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.classPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="class" tick={{ fontSize: 12 }} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="average" fill="var(--color-average)" name="Academic Average (%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="attendance" fill="var(--color-attendance)" name="Attendance Rate (%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Subject Performance Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-600" />
            Subject Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.subjectPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="average" 
                  stroke="var(--color-average)" 
                  fill="var(--color-average)"
                  fillOpacity={0.3}
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Teacher Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-orange-600" />
            Teacher Grading Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.teacherActivity} layout="horizontal" margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
                <XAxis type="number" />
                <YAxis dataKey="teacher" type="category" tick={{ fontSize: 10 }} width={80} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="submissions" fill="var(--color-submissions)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Top Students Rankings */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Top Performing Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.studentRankings.length > 0 ? (
              data.studentRankings.map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.class}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{student.average.toFixed(1)}%</p>
                    <p className="text-sm text-gray-500">Position {student.position}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No student rankings available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrincipalAnalyticsCharts;
