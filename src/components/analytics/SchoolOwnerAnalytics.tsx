
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';

interface SchoolOwnerAnalyticsProps {
  filters: {
    term: string;
    class: string;
  };
}

const SchoolOwnerAnalytics = ({ filters }: SchoolOwnerAnalyticsProps) => {
  // Mock data - would come from API
  const schoolPerformanceData = [
    { school: 'Main Campus', average: 85, students: 450, collection: 92 },
    { school: 'East Branch', average: 78, students: 320, collection: 88 },
    { school: 'West Branch', average: 82, students: 380, collection: 90 },
    { school: 'North Campus', average: 79, students: 290, collection: 85 },
  ];

  const feeCollectionData = [
    { term: 'Term 1', collected: 2400000, expected: 2500000 },
    { term: 'Term 2', collected: 2300000, expected: 2500000 },
    { term: 'Term 3', collected: 2100000, expected: 2500000 },
  ];

  const attendanceTrends = [
    { month: 'Jan', rate: 94 },
    { month: 'Feb', rate: 92 },
    { month: 'Mar', rate: 95 },
    { month: 'Apr', rate: 93 },
    { month: 'May', rate: 96 },
    { month: 'Jun', rate: 94 },
  ];

  const complianceAlerts = [
    { type: 'Missing Grades', count: 12, severity: 'high' },
    { type: 'Poor Attendance', count: 8, severity: 'medium' },
    { type: 'Late Submissions', count: 15, severity: 'low' },
    { type: 'Pending Approvals', count: 5, severity: 'high' },
  ];

  const chartConfig = {
    average: { label: 'Average Score', color: '#3b82f6' },
    collection: { label: 'Collection Rate', color: '#10b981' },
    attendance: { label: 'Attendance Rate', color: '#8b5cf6' },
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">4</div>
            <p className="text-xs text-muted-foreground">Across all campuses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">1,440</div>
            <p className="text-xs text-muted-foreground">+5% from last term</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">81.0%</div>
            <p className="text-xs text-muted-foreground">+2.3% improvement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fee Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">89.2%</div>
            <p className="text-xs text-muted-foreground">KES 6.8M collected</p>
          </CardContent>
        </Card>
      </div>

      {/* School Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>School Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <BarChart data={schoolPerformanceData}>
              <XAxis dataKey="school" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="average" fill="var(--color-average)" name="Academic Average" />
              <Bar dataKey="collection" fill="var(--color-collection)" name="Fee Collection %" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fee Collection Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Fee Collection Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <LineChart data={feeCollectionData}>
                <XAxis dataKey="term" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="collected" 
                  stroke="var(--color-collection)" 
                  strokeWidth={2}
                  name="Collected (KES)"
                />
                <Line 
                  type="monotone" 
                  dataKey="expected" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Expected (KES)"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Attendance Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Network Attendance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <LineChart data={attendanceTrends}>
                <XAxis dataKey="month" />
                <YAxis domain={[85, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="var(--color-attendance)" 
                  strokeWidth={2}
                  name="Attendance Rate %"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* School Rankings */}
      <Card>
        <CardHeader>
          <CardTitle>School Rankings & Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schoolPerformanceData
              .sort((a, b) => b.average - a.average)
              .map((school, index) => (
                <div key={school.school} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{school.school}</p>
                      <p className="text-sm text-muted-foreground">{school.students} students</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Badge variant={school.average >= 80 ? 'default' : 'secondary'}>
                        {school.average}% Academic
                      </Badge>
                      <Badge variant={school.collection >= 90 ? 'default' : 'destructive'}>
                        {school.collection}% Fees
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {complianceAlerts.map((alert) => (
              <div key={alert.type} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{alert.type}</h4>
                  <Badge 
                    variant={
                      alert.severity === 'high' ? 'destructive' : 
                      alert.severity === 'medium' ? 'secondary' : 'default'
                    }
                  >
                    {alert.severity}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-red-600">{alert.count}</div>
                <p className="text-xs text-muted-foreground">Requires attention</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolOwnerAnalytics;
