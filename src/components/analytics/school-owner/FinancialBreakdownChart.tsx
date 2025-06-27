
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { DollarSign } from 'lucide-react';

interface FinancialBreakdownChartProps {
  financialBreakdown: Array<{
    category: string;
    amount: number;
    color: string;
  }>;
  chartConfig: any;
}

const FinancialBreakdownChart: React.FC<FinancialBreakdownChartProps> = ({
  financialBreakdown,
  chartConfig
}) => {
  return (
    <Card className="shadow-md border-0 rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5" />
          Financial Breakdown
        </CardTitle>
        <p className="text-purple-100 text-sm">Revenue by fee category</p>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col items-center">
          <ChartContainer config={chartConfig} className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={financialBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="amount"
                  label={({ category, amount }) => `${category}: KES ${amount.toLocaleString()}`}
                  labelLine={false}
                >
                  {financialBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip 
                  formatter={(value) => [`KES ${value.toLocaleString()}`, 'Amount']}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4 w-full">
            {financialBreakdown.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{item.category}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialBreakdownChart;
