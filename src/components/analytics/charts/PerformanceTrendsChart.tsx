
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Bar, BarChart } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface PerformanceTrendsChartProps {
  data: Array<{
    month: string;
    average_grade: number;
    total_grades: number;
  }>;
}

const PerformanceTrendsChart = ({ data }: PerformanceTrendsChartProps) => {
  const chartConfig = {
    average_grade: {
      label: "Average Grade (%)",
      color: "hsl(var(--chart-1))",
    },
    total_grades: {
      label: "Total Grades",
      color: "hsl(var(--chart-2))",
    },
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">System-wide Performance Trends</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="month" fontSize={12} />
              <YAxis yAxisId="left" orientation="left" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="average_grade" 
                stroke="var(--color-average_grade)" 
                strokeWidth={3}
                dot={{ fill: "var(--color-average_grade)", strokeWidth: 2, r: 4 }}
              />
              <Bar 
                yAxisId="right"
                dataKey="total_grades" 
                fill="var(--color-total_grades)"
                opacity={0.6}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default PerformanceTrendsChart;
