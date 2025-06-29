
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts';
import { Activity } from 'lucide-react';

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
    finance_officer: {
      label: "Finance Officers",
      color: "hsl(var(--chart-5))",
    },
    school_owner: {
      label: "School Owners",
      color: "hsl(var(--chart-6))",
    },
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Daily User Logins (Last 30 Days)</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line type="monotone" dataKey="admin" stroke="var(--color-admin)" strokeWidth={2} dot={{ fill: "var(--color-admin)", strokeWidth: 2, r: 3 }} />
              <Line type="monotone" dataKey="teacher" stroke="var(--color-teacher)" strokeWidth={2} dot={{ fill: "var(--color-teacher)", strokeWidth: 2, r: 3 }} />
              <Line type="monotone" dataKey="principal" stroke="var(--color-principal)" strokeWidth={2} dot={{ fill: "var(--color-principal)", strokeWidth: 2, r: 3 }} />
              <Line type="monotone" dataKey="parent" stroke="var(--color-parent)" strokeWidth={2} dot={{ fill: "var(--color-parent)", strokeWidth: 2, r: 3 }} />
              <Line type="monotone" dataKey="finance_officer" stroke="var(--color-finance_officer)" strokeWidth={2} dot={{ fill: "var(--color-finance_officer)", strokeWidth: 2, r: 3 }} />
              <Line type="monotone" dataKey="school_owner" stroke="var(--color-school_owner)" strokeWidth={2} dot={{ fill: "var(--color-school_owner)", strokeWidth: 2, r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default UserLoginChart;
