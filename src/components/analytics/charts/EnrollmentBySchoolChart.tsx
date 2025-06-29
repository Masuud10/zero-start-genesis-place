
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { School } from 'lucide-react';
import { useEnrollmentBySchoolData } from '@/hooks/useAdminAnalytics';

const EnrollmentBySchoolChart = () => {
  const { data, isLoading, error } = useEnrollmentBySchoolData();

  const chartConfig = {
    students: {
      label: "Students",
      color: "hsl(var(--chart-3))",
    },
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Schools by Enrollment</CardTitle>
          <School className="h-4 w-4 text-muted-foreground animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-sm text-muted-foreground">Loading enrollment data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    console.error('📊 EnrollmentBySchoolChart: Error or no data:', error);
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Schools by Enrollment</CardTitle>
          <School className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-sm text-red-500">Failed to load enrollment data</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log('📊 EnrollmentBySchoolChart: Rendering with data:', data.length);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Top 10 Schools by Student Enrollment</CardTitle>
        <School className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              layout="horizontal"
              margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
            >
              <XAxis 
                type="number"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                type="category"
                dataKey="school"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={110}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="students" 
                fill="var(--color-students)" 
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
