
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, BarChart, Bar } from 'recharts';

const NetworkAnalytics = () => {
  const userGrowthData = [
    { month: 'Jan', users: 12500, schools: 180 },
    { month: 'Feb', users: 13200, schools: 195 },
    { month: 'Mar', users: 14100, schools: 210 },
    { month: 'Apr', users: 15000, schools: 225 },
    { month: 'May', users: 15847, schools: 247 },
  ];

  const regionData = [
    { region: 'Nairobi', schools: 89, users: 6420 },
    { region: 'Mombasa', schools: 45, users: 3210 },
    { region: 'Kisumu', schools: 38, users: 2890 },
    { region: 'Nakuru', schools: 35, users: 2150 },
    { region: 'Eldoret', schools: 40, users: 1177 },
  ];

  const chartConfig = {
    users: { label: 'Users', color: '#3b82f6' },
    schools: { label: 'Schools', color: '#10b981' },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Network Growth Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <LineChart data={userGrowthData}>
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="users" stroke="var(--color-users)" strokeWidth={2} name="Total Users" />
              <Line type="monotone" dataKey="schools" stroke="var(--color-schools)" strokeWidth={2} name="Total Schools" />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regional Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <BarChart data={regionData}>
              <XAxis dataKey="region" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="schools" fill="var(--color-schools)" name="Schools" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkAnalytics;
