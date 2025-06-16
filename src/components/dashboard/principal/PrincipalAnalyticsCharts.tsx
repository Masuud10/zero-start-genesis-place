
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { usePrincipalAnalyticsData } from '@/hooks/usePrincipalAnalyticsData';
import { Loader2, TrendingUp, Users, BookOpen, Award } from 'lucide-react';

const PrincipalAnalyticsCharts = () => {
  const { data, isLoading, error } = usePrincipalAnalyticsData();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="col-span-full">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Analytics data is not available at the moment.</p>
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    average: { label: 'Average Score', color: '#3b82f6' },
    attendance: { label: 'Attendance Rate', color: '#10b981' },
    improvement: { label: 'Improvement', color: '#8b5cf6' },
  };

  // Prepare data for different charts
  const subjectColors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Class Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Class Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.classPerformance}>
                <XAxis dataKey="class" tick={{ fontSize: 12 }} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="average" fill="var(--color-average)" name="Academic Average (%)" />
                <Bar dataKey="attendance" fill="var(--color-attendance)" name="Attendance Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Subject Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Subject Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.subjectPerformance}>
                <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="average" stroke="var(--color-average)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Teacher Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Teacher Grading Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.teacherActivity} layout="horizontal">
                <XAxis type="number" />
                <YAxis dataKey="teacher" type="category" tick={{ fontSize: 12 }} width={80} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="submissions" fill="var(--color-average)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Key Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">School Average</span>
              <span className="text-2xl font-bold text-blue-600">{data.keyMetrics.schoolAverage.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">Attendance Rate</span>
              <span className="text-2xl font-bold text-green-600">{data.keyMetrics.attendanceRate.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">Total Students</span>
              <span className="text-2xl font-bold text-purple-600">{data.keyMetrics.totalStudents}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrincipalAnalyticsCharts;
