
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface EduFamAdminAnalyticsProps {
  filters: {
    term: string;
  };
}

const EduFamAdminAnalytics = ({ filters }: EduFamAdminAnalyticsProps) => {
  // Mock data for system-wide analytics
  const networkStats = [
    { school: 'Greenwood Primary', students: 450, teachers: 18, performance: 85, uptime: 99.8 },
    { school: 'Riverside Academy', students: 320, teachers: 14, performance: 78, uptime: 99.5 },
    { school: 'Sunshine School', students: 380, teachers: 16, performance: 82, uptime: 99.9 },
    { school: 'Oak Tree Primary', students: 290, teachers: 12, performance: 79, uptime: 99.2 },
  ];

  const transactionVolume = [
    { month: 'Jan', volume: 2500000, schools: 4, transactions: 1250 },
    { month: 'Feb', volume: 2800000, schools: 4, transactions: 1380 },
    { month: 'Mar', volume: 3200000, schools: 4, transactions: 1450 },
    { month: 'Apr', volume: 2900000, schools: 4, transactions: 1320 },
    { month: 'May', volume: 3100000, schools: 4, transactions: 1420 },
  ];

  const supportTickets = [
    { category: 'Technical', open: 12, resolved: 45, avgTime: 4.2 },
    { category: 'Feature Request', open: 8, resolved: 23, avgTime: 12.5 },
    { category: 'Billing', open: 3, resolved: 18, avgTime: 2.1 },
    { category: 'Training', open: 5, resolved: 31, avgTime: 6.8 },
  ];

  const featureUsage = [
    { feature: 'Grading Module', usage: 95, schools: 4 },
    { feature: 'Attendance Tracking', usage: 88, schools: 4 },
    { feature: 'Fee Collection', usage: 92, schools: 4 },
    { feature: 'Analytics', usage: 76, schools: 3 },
    { feature: 'Messaging', usage: 83, schools: 4 },
  ];

  const systemHealth = [
    { metric: 'API Response Time', value: '245ms', status: 'good', target: '<300ms' },
    { metric: 'Database Performance', value: '98.2%', status: 'excellent', target: '>95%' },
    { metric: 'Error Rate', value: '0.12%', status: 'good', target: '<0.5%' },
    { metric: 'User Satisfaction', value: '4.7/5', status: 'excellent', target: '>4.0' },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const chartConfig = {
    performance: { label: 'Performance %', color: '#3b82f6' },
    volume: { label: 'Transaction Volume', color: '#10b981' },
    usage: { label: 'Usage %', color: '#8b5cf6' },
    uptime: { label: 'Uptime %', color: '#f59e0b' },
  };

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Schools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">4</div>
            <p className="text-xs text-muted-foreground">100% operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">1,623</div>
            <p className="text-xs text-muted-foreground">+8% this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">99.7%</div>
            <p className="text-xs text-muted-foreground">Above SLA (99.5%)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">KES 2.8M</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Network Performance */}
      <Card>
        <CardHeader>
          <CardTitle>School Network Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <BarChart data={networkStats}>
              <XAxis dataKey="school" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="performance" fill="var(--color-performance)" name="Performance %" />
              <Bar dataKey="uptime" fill="var(--color-uptime)" name="Uptime %" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Volume */}
        <Card>
          <CardHeader>
            <CardTitle>MPESA Transaction Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <LineChart data={transactionVolume}>
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="var(--color-volume)" 
                  strokeWidth={2}
                  name="Volume (KES)"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Feature Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Adoption Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {featureUsage.map((feature) => (
                <div key={feature.feature} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{feature.feature}</p>
                    <p className="text-sm text-muted-foreground">{feature.schools} schools using</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <Progress value={feature.usage} className="h-2" />
                    </div>
                    <Badge variant={feature.usage >= 90 ? 'default' : feature.usage >= 75 ? 'secondary' : 'destructive'}>
                      {feature.usage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Support Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Support Ticket Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {supportTickets.map((ticket) => (
              <div key={ticket.category} className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">{ticket.category}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Open:</span>
                    <span className="font-medium text-red-600">{ticket.open}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Resolved:</span>
                    <span className="font-medium text-green-600">{ticket.resolved}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Avg Time:</span>
                    <span className="font-medium">{ticket.avgTime}h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Health Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle>System Health Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemHealth.map((health) => (
              <div key={health.metric} className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">{health.metric}</h4>
                <div className="text-2xl font-bold mb-1">
                  <span className={
                    health.status === 'excellent' ? 'text-green-600' : 
                    health.status === 'good' ? 'text-blue-600' : 'text-red-600'
                  }>
                    {health.value}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Target: {health.target}</p>
                <Badge 
                  variant={
                    health.status === 'excellent' ? 'default' : 
                    health.status === 'good' ? 'secondary' : 'destructive'
                  }
                >
                  {health.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* School Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>School Network Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {networkStats.map((school) => (
              <div key={school.school} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{school.school}</p>
                  <p className="text-sm text-muted-foreground">
                    {school.students} students • {school.teachers} teachers
                  </p>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium">{school.performance}%</div>
                    <div className="text-muted-foreground">Performance</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-green-600">{school.uptime}%</div>
                    <div className="text-muted-foreground">Uptime</div>
                  </div>
                  <Badge variant={school.performance >= 80 ? 'default' : 'secondary'}>
                    {school.performance >= 80 ? 'Healthy' : 'Needs Attention'}
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

export default EduFamAdminAnalytics;
