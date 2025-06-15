
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';

interface ExpenseBreakdownChartProps {
    data: {
        name: string;
        value: number;
    }[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const chartConfig = {};

const ExpenseBreakdownChart: React.FC<ExpenseBreakdownChartProps> = ({ data }) => {
    return (
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {data.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-64">
                <PieChart>
                  <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <p className="text-center text-muted-foreground p-4">No expense data available.</p>
            )}
          </CardContent>
        </Card>
    );
};

export default ExpenseBreakdownChart;
