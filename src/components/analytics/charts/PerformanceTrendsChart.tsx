
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
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
      label: "Average Grade",
      color: "hsl(var(--chart-1))",
    },
  };

  // Ensure we have data to display
  const chartData = data && data.length > 0 ? data : [
    { month: 'No Data', average_grade: 0, total_grades: 0 }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Performance Trends</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value, name) => [
                  `${Number(value).toFixed(1)}%`,
                  name === 'average_grade' ? 'Average Grade' : name
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="average_grade" 
                stroke="var(--color-average_grade)" 
                strokeWidth={2}
                dot={{ fill: "var(--color-average_grade)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default PerformanceTrendsChart;
