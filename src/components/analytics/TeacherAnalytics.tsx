
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, LineChart, Line } from 'recharts';

interface TeacherAnalyticsProps {
  filters: {
    term: string;
    class: string;
    subject: string;
  };
}

const TeacherAnalytics = ({ filters }: TeacherAnalyticsProps) => {
  // Mock data for teacher's classes and subjects
  const classPerformanceData = [
    { class: 'Grade 2A Math', average: 85, students: 28, submitted: 28 },
    { class: 'Grade 2B Math', average: 78, students: 30, submitted: 30 },
    { class: 'Grade 3A Math', average: 82, students: 25, submitted: 23 },
  ];

  const termComparisonData = [
    { term: 'Term 1', math: 78, science: 82 },
    { term: 'Term 2', math: 81, science: 85 },
    { term: 'Term 3', math: 85, science: 87 },
  ];

  const weakSubjectAreas = [
    { topic: 'Fractions', average: 65, improvement: -2 },
    { topic: 'Geometry', average: 72, improvement: 5 },
    { topic: 'Algebra', average: 78, improvement: 3 },
    { topic: 'Statistics', average: 85, improvement: 1 },
  ];

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
            <CardTitle className="text-sm font-medium">My Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">83</div>
            <p className="text-xs text-muted-foreground">Across 3 classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">81.7%</div>
            <p className="text-xs text-muted-foreground">+3.2% improvement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Grades Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">81/84</div>
            <p className="text-xs text-muted-foreground">96% completion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Class Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">94.2%</div>
            <p className="text-xs text-muted-foreground">Above school average</p>
          </CardContent>
        </Card>
      </div>

      {/* Class Performance */}
      <Card>
        <CardHeader>
          <CardTitle>My Classes Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <BarChart data={classPerformanceData}>
              <XAxis dataKey="class" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="average" fill="var(--color-average)" name="Class Average" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Term Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Term-wise Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Weak Subject Areas */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Areas Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weakSubjectAreas.map((area) => (
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
              ))}
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
