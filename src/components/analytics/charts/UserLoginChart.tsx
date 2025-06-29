
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';

interface UserLoginChartProps {
  data: Array<{
    date: string;
    admin: number;
    teacher: number;
    principal: number;
    parent: number;
    finance_officer: number;
    school_owner: number;
  }>;
}

const UserLoginChart = ({ data }: UserLoginChartProps) => {
  const chartConfig = {
    admin: {
      label: "Admins",
      color: "hsl(var(--chart-1))",
    },
    teacher: {
      label: "Teachers",
      color: "hsl(var(--chart-2))",
    },
    principal: {
      label: "Principals",
      color: "hsl(var(--chart-3))",
    },
    parent: {
      label: "Parents",
      color: "hsl(var(--chart-4))",
    },
  };

  // Ensure we have data to display
  const chartData = data && data.length > 0 ? data.slice(-14) : [
    { date: 'No Data', admin: 0, teacher: 0, principal: 0, parent: 0, finance_officer: 0, school_owner: 0 }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Daily User Logins (Last 14 Days)</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  if (value === 'No Data') return value;
                  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
              />
              <YAxis 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="admin" 
                stroke="var(--color-admin)" 
                strokeWidth={2}
                dot={{ fill: "var(--color-admin)" }}
              />
              <Line 
                type="monotone" 
                dataKey="teacher" 
                stroke="var(--color-teacher)" 
                strokeWidth={2}
                dot={{ fill: "var(--color-teacher)" }}
              />
              <Line 
                type="monotone" 
                dataKey="principal" 
                stroke="var(--color-principal)" 
                strokeWidth={2}
                dot={{ fill: "var(--color-principal)" }}
              />
              <Line 
                type="monotone" 
                dataKey="parent" 
                stroke="var(--color-parent)" 
                strokeWidth={2}
                dot={{ fill: "var(--color-parent)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default UserLoginChart;
