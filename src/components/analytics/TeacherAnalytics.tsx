
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, LineChart, Line } from 'recharts';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { Loader2, BookOpen, Users, TrendingUp } from 'lucide-react';

interface TeacherAnalyticsProps {
  filters: {
    term: string;
    class: string;
    subject: string;
  };
}

const TeacherAnalytics = ({ filters }: TeacherAnalyticsProps) => {
  const { data: analytics, isLoading, error } = useAnalyticsData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Loading teacher analytics...</span>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Failed to load teacher analytics</p>
      </div>
    );
  }

  // Mock data for teacher-specific metrics (would be enhanced with teacher-specific queries)
  const classPerformanceData = analytics.academicPerformance.map(subject => ({
    class: subject.subject,
    average: subject.average,
    students: Math.floor(analytics.totalStudents / analytics.academicPerformance.length),
    submitted: Math.floor(analytics.totalStudents / analytics.academicPerformance.length)
  }));

  const termComparisonData = analytics.monthlyAttendance.slice(-3).map((month, index) => ({
    term: `Term ${index + 1}`,
    math: month.rate + Math.random() * 10,
    science: month.rate + Math.random() * 15
  }));

  const weakSubjectAreas = analytics.academicPerformance
    .sort((a, b) => a.average - b.average)
    .slice(0, 4)
    .map(subject => ({
      topic: subject.subject,
      average: Math.round(subject.average),
      improvement: Math.floor(Math.random() * 10) - 5
    }));

  const gradingStatus = [
    { exam: 'CAT 1 - Mathematics', submitted: 28, total: 28, status: 'complete' },
    { exam: 'Mid-term - Science', submitted: 25, total: 28, status: 'pending' },
    { exam: 'CAT 2 - Mathematics', submitted: 0, total: 28, status: 'not-started' },
  ];

  const chartConfig = {
    average: { label: 'Class Average', color: '#3b82f6' },
    math: { label: 'Mathematics', color: '#10b981' },
    science: { label: 'Science', color: '#8b5cf6' },
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2" />
              My Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analytics.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Across {analytics.totalClasses} classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Average Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.averageGrade.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.averageGrade > 75 ? '+' : ''}{(analytics.averageGrade - 70).toFixed(1)}% from target
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Grades Submitted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {Math.floor(analytics.totalStudents * 0.96)}/{analytics.totalStudents}
            </div>
            <p className="text-xs text-muted-foreground">96% completion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Class Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{analytics.attendanceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.attendanceRate > 90 ? 'Above' : 'Below'} school average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Class Performance */}
      <Card>
        <CardHeader>
          <CardTitle>My Classes Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {classPerformanceData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-80">
              <BarChart data={classPerformanceData}>
                <XAxis dataKey="class" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="average" fill="var(--color-average)" name="Class Average" />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              No class performance data available
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Term Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Term-wise Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {termComparisonData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-64">
                <LineChart data={termComparisonData}>
                  <XAxis dataKey="term" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="math" 
                    stroke="var(--color-math)" 
                    strokeWidth={2}
                    name="Mathematics"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="science" 
                    stroke="var(--color-science)" 
                    strokeWidth={2}
                    name="Science"
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No term comparison data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weak Subject Areas */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Areas Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weakSubjectAreas.length > 0 ? (
                weakSubjectAreas.map((area) => (
                  <div key={area.topic} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{area.topic}</p>
                      <p className="text-sm text-muted-foreground">Class Average: {area.average}%</p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={area.improvement > 0 ? 'default' : area.improvement < 0 ? 'destructive' : 'secondary'}
                      >
                        {area.improvement > 0 ? '+' : ''}{area.improvement}%
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground">
                  No subject analysis data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grading Status Tracker */}
      <Card>
        <CardHeader>
          <CardTitle>Grading Status Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gradingStatus.map((exam) => (
              <div key={exam.exam} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{exam.exam}</p>
                  <p className="text-sm text-muted-foreground">
                    {exam.submitted} of {exam.total} grades submitted
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <Progress value={(exam.submitted / exam.total) * 100} className="h-2" />
                  </div>
                  <Badge 
                    variant={
                      exam.status === 'complete' ? 'default' : 
                      exam.status === 'pending' ? 'secondary' : 'destructive'
                    }
                  >
                    {exam.status === 'complete' ? 'Complete' : 
                     exam.status === 'pending' ? 'In Progress' : 'Not Started'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherAnalytics;
