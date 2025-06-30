
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign } from 'lucide-react';
import { useRevenueAnalytics } from '@/hooks/useAdminAnalytics';

const RevenueAnalyticsChart = () => {
  const { data, isLoading, error } = useRevenueAnalytics();

  const chartConfig = {
    billing: {
      label: "Billing Revenue",
      color: "hsl(var(--chart-1))",
    },
    payments: {
      label: "Payment Revenue",
      color: "hsl(var(--chart-2))",
    },
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue Analytics</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-sm text-muted-foreground">Loading revenue data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data || data.length === 0) {
    console.error('📊 RevenueAnalyticsChart: Error or no data:', error);
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue Analytics</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-sm text-amber-600">No revenue data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log('📊 RevenueAnalyticsChart: Rendering with data:', data.length);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: KES {entry.value.toLocaleString()}
            </p>
          ))}
          <p className="text-sm font-medium border-t pt-1 mt-1">
            Total: KES {payload.reduce((sum: number, entry: any) => sum + entry.value, 0).toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Monthly Revenue Trends (Last 6 Months)</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                tickFormatter={(value) => `KES ${(value / 1000).toFixed(0)}K`}
              />
              <ChartTooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="billing" 
                fill="var(--color-billing)" 
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="payments" 
                fill="var(--color-payments)" 
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueAnalyticsChart;
