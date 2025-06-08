
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';

interface PrincipalAnalyticsProps {
  filters: {
    term: string;
    class: string;
    subject: string;
  };
}

const PrincipalAnalytics = ({ filters }: PrincipalAnalyticsProps) => {
  // Mock data
  const classPerformanceData = [
    { class: 'Grade 1A', average: 87, students: 32, attendance: 95 },
    { class: 'Grade 1B', average: 83, students: 30, attendance: 92 },
    { class: 'Grade 2A', average: 85, students: 28, attendance: 94 },
    { class: 'Grade 2B', average: 79, students: 31, attendance: 90 },
  ];

  const subjectPerformanceData = [
    { subject: 'Mathematics', average: 78, improvement: 5 },
    { subject: 'English', average: 85, improvement: 2 },
    { subject: 'Science', average: 82, improvement: -1 },
    { subject: 'Social Studies', average: 88, improvement: 3 },
  ];

  const studentRankings = [
    { name: 'Alice Johnson', class: 'Grade 2A', average: 95, position: 1 },
    { name: 'Bob Smith', class: 'Grade 2B', average: 93, position: 2 },
    { name: 'Carol Davis', class: 'Grade 1A', average: 92, position: 3 },
    { name: 'David Wilson', class: 'Grade 1B', average: 90, position: 4 },
    { name: 'Eve Brown', class: 'Grade 2A', average: 89, position: 5 },
  ];

  const teacherActivity = [
    { teacher: 'Ms. Johnson', grades: 125, submissions: 98, onTime: 95 },
    { teacher: 'Mr. Smith', grades: 110, submissions: 102, onTime: 88 },
    { teacher: 'Ms. Davis', grades: 95, submissions: 89, onTime: 92 },
    { teacher: 'Mr. Wilson', grades: 87, submissions: 78, onTime: 85 },
  ];

  const chartConfig = {
    average: { label: 'Average Score', color: '#3b82f6' },
    attendance: { label: 'Attendance Rate', color: '#10b981' },
    improvement: { label: 'Improvement', color: '#8b5cf6' },
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">342</div>
            <p className="text-xs text-muted-foreground">Across all classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">School Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">83.5%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last term</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">92.8%</div>
            <p className="text-xs text-muted-foreground">Above target (90%)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Results Released</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">8/12</div>
            <p className="text-xs text-muted-foreground">Subjects published</p>
          </CardContent>
        </Card>
      </div>

      {/* Class Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Class Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <BarChart data={classPerformanceData}>
              <XAxis dataKey="class" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="average" fill="var(--color-average)" name="Academic Average" />
              <Bar dataKey="attendance" fill="var(--color-attendance)" name="Attendance Rate" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectPerformanceData.map((subject) => (
                <div key={subject.subject} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{subject.subject}</p>
                    <p className="text-sm text-muted-foreground">Average: {subject.average}%</p>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={subject.improvement > 0 ? 'default' : subject.improvement < 0 ? 'destructive' : 'secondary'}
                    >
                      {subject.improvement > 0 ? '+' : ''}{subject.improvement}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Students */}
        <Card>
          <CardHeader>
            <CardTitle>Top Student Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {studentRankings.map((student) => (
                <div key={student.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {student.position}
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.class}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{student.average}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teacher Activity Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Teacher Grading Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teacherActivity.map((teacher) => (
              <div key={teacher.teacher} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{teacher.teacher}</p>
                  <p className="text-sm text-muted-foreground">
                    {teacher.grades} grades submitted
                  </p>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium">{teacher.submissions}</div>
                    <div className="text-muted-foreground">Submissions</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-green-600">{teacher.onTime}%</div>
                    <div className="text-muted-foreground">On Time</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrincipalAnalytics;
