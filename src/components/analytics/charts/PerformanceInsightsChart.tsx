
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { Award } from 'lucide-react';
import { usePerformanceInsights } from '@/hooks/useAdminAnalytics';

const PerformanceInsightsChart = () => {
  const { data, isLoading, error } = usePerformanceInsights();

  const chartConfig = {
    avgGrade: {
      label: "Average Grade (%)",
      color: "hsl(var(--chart-1))",
    },
    attendanceRate: {
      label: "Attendance Rate (%)",
      color: "hsl(var(--chart-2))",
    },
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Performance Insights</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-sm text-muted-foreground">Loading performance data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    console.error('📊 PerformanceInsightsChart: Error or no data:', error);
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Performance Insights</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-sm text-red-500">Failed to load performance data</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log('📊 PerformanceInsightsChart: Rendering with data:', data.trends?.length || 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(1)}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Network Performance Trends (Last 3 Months)</CardTitle>
        <Award className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="flex justify-between mb-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-blue-600">{data.summary.averageGrade.toFixed(1)}%</div>
            <div className="text-muted-foreground">Avg Grade</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-600">{data.summary.attendanceRate.toFixed(1)}%</div>
            <div className="text-muted-foreground">Attendance</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-purple-600">{data.summary.totalGrades.toLocaleString()}</div>
            <div className="text-muted-foreground">Total Grades</div>
          </div>
        </div>

        <ChartContainer config={chartConfig} className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data.trends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
              />
              <ChartTooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="attendanceRate" 
                fill="var(--color-attendanceRate)"
                fillOpacity={0.6}
                radius={[2, 2, 0, 0]}
              />
              <Line 
                type="monotone" 
                dataKey="avgGrade" 
                stroke="var(--color-avgGrade)" 
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default PerformanceInsightsChart;
