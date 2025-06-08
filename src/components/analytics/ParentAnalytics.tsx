
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, BarChart, Bar } from 'recharts';

interface ParentAnalyticsProps {
  filters: {
    term: string;
  };
}

const ParentAnalytics = ({ filters }: ParentAnalyticsProps) => {
  // Mock data for parent's child
  const childPerformanceData = [
    { subject: 'Mathematics', term1: 78, term2: 82, term3: 85, target: 80 },
    { subject: 'English', term1: 85, term2: 87, term3: 89, target: 85 },
    { subject: 'Science', term1: 72, term2: 76, term3: 79, target: 75 },
    { subject: 'Social Studies', term1: 88, term2: 90, term3: 92, target: 85 },
  ];

  const attendanceData = [
    { month: 'January', rate: 95 },
    { month: 'February', rate: 92 },
    { month: 'March', rate: 97 },
    { month: 'April', rate: 94 },
    { month: 'May', rate: 96 },
  ];

  const feeHistory = [
    { term: 'Term 1', amount: 25000, status: 'Paid', date: '2024-01-15' },
    { term: 'Term 2', amount: 25000, status: 'Paid', date: '2024-04-10' },
    { term: 'Term 3', amount: 25000, status: 'Pending', date: '2024-08-15' },
  ];

  const recentAnnouncements = [
    { title: 'Parent-Teacher Meeting', date: '2024-06-15', priority: 'high' },
    { title: 'Sports Day Event', date: '2024-06-20', priority: 'medium' },
    { title: 'Library Books Return', date: '2024-06-10', priority: 'low' },
  ];

  const chartConfig = {
    term1: { label: 'Term 1', color: '#3b82f6' },
    term2: { label: 'Term 2', color: '#10b981' },
    term3: { label: 'Term 3', color: '#8b5cf6' },
    rate: { label: 'Attendance Rate', color: '#f59e0b' },
  };

  return (
    <div className="space-y-6">
      {/* Child Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <h2 className="text-xl font-bold">Alice Johnson</h2>
              <p className="text-muted-foreground">Grade 2A • Student ID: ST001</p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">86.2%</div>
            <p className="text-xs text-muted-foreground">+4.1% improvement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Class Position</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">3rd</div>
            <p className="text-xs text-muted-foreground">Out of 28 students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">94.8%</div>
            <p className="text-xs text-muted-foreground">Excellent attendance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fee Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">KES 0</div>
            <p className="text-xs text-muted-foreground">All paid up</p>
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <BarChart data={childPerformanceData}>
              <XAxis dataKey="subject" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="term1" fill="var(--color-term1)" name="Term 1" />
              <Bar dataKey="term2" fill="var(--color-term2)" name="Term 2" />
              <Bar dataKey="term3" fill="var(--color-term3)" name="Term 3" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <LineChart data={attendanceData}>
                <XAxis dataKey="month" />
                <YAxis domain={[85, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="var(--color-rate)" 
                  strokeWidth={2}
                  name="Attendance Rate %"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Fee Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Fee Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feeHistory.map((fee) => (
                <div key={fee.term} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{fee.term}</p>
                    <p className="text-sm text-muted-foreground">Due: {fee.date}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">KES {fee.amount.toLocaleString()}</div>
                    <Badge variant={fee.status === 'Paid' ? 'default' : 'destructive'}>
                      {fee.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance Details */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {childPerformanceData.map((subject) => {
              const currentScore = subject.term3;
              const improvement = subject.term3 - subject.term1;
              const targetMet = currentScore >= subject.target;
              
              return (
                <div key={subject.subject} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{subject.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      Current: {currentScore}% | Target: {subject.target}%
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <Progress value={(currentScore / 100) * 100} className="h-2" />
                    </div>
                    <Badge variant={targetMet ? 'default' : 'secondary'}>
                      {improvement > 0 ? '+' : ''}{improvement}%
                    </Badge>
                    <div className={`w-3 h-3 rounded-full ${
                      improvement > 2 ? 'bg-green-500' : 
                      improvement < -2 ? 'bg-red-500' : 
                      'bg-yellow-500'
                    }`} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Announcements */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAnnouncements.map((announcement) => (
              <div key={announcement.title} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{announcement.title}</p>
                  <p className="text-sm text-muted-foreground">Date: {announcement.date}</p>
                </div>
                <Badge 
                  variant={
                    announcement.priority === 'high' ? 'destructive' : 
                    announcement.priority === 'medium' ? 'secondary' : 'default'
                  }
                >
                  {announcement.priority}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentAnalytics;
