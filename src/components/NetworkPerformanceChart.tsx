
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis } from 'recharts';

const NetworkPerformanceChart = () => {
  const networkStats = [
    { school: 'Greenwood Primary', students: 450, teachers: 18, performance: 85, uptime: 99.8 },
    { school: 'Riverside Academy', students: 320, teachers: 14, performance: 78, uptime: 99.5 },
    { school: 'Sunshine School', students: 380, teachers: 16, performance: 82, uptime: 99.9 },
    { school: 'Oak Tree Primary', students: 290, teachers: 12, performance: 79, uptime: 99.2 },
  ];

  const chartConfig = {
    performance: { label: 'Performance %', color: '#3b82f6' },
    uptime: { label: 'Uptime %', color: '#f59e0b' },
  };

  return (
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
  );
};

export default NetworkPerformanceChart;
