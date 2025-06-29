
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { GraduationCap } from 'lucide-react';
import { useEnrollmentBySchoolData } from '@/hooks/useAdminAnalytics';

const EnrollmentBySchoolChart = () => {
  const { data, isLoading, error } = useEnrollmentBySchoolData();

  const chartConfig = {
    student_count: {
      label: "Students",
      color: "hsl(var(--chart-3))",
    },
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Schools by Enrollment</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-sm text-muted-foreground">Loading enrollment data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Schools by Enrollment</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-sm text-muted-foreground">No enrollment data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Top 10 Schools by Student Enrollment</CardTitle>
        <GraduationCap className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="horizontal" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
              <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis 
                type="category" 
                dataKey="school_name" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                width={90}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="student_count" 
                fill="var(--color-student_count)" 
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default EnrollmentBySchoolChart;
