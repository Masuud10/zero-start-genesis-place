
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';

interface AttendanceTrendsChartProps {
  attendanceTrends: Array<{
    month: string;
    attendance: number;
    target: number;
    students: number;
  }>;
  chartConfig: any;
}

const AttendanceTrendsChart: React.FC<AttendanceTrendsChartProps> = ({
  attendanceTrends,
  chartConfig
}) => {
  return (
    <Card className="shadow-md border-0 rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5" />
          Attendance Trends
        </CardTitle>
        <p className="text-green-100 text-sm">Monthly attendance rates</p>
      </CardHeader>
      <CardContent className="p-4">
        <ChartContainer config={chartConfig} className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={attendanceTrends} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 11, fill: '#6b7280' }} 
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#6b7280' }} 
                tickLine={{ stroke: '#e5e7eb' }}
                domain={[75, 100]}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value, name) => [`${value}%`, name === 'attendance' ? 'Attendance' : 'Target']}
              />
              <Area 
                type="monotone" 
                dataKey="attendance" 
                stroke="#10b981" 
                fill="#10b981"
                fillOpacity={0.3}
                strokeWidth={3}
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#ef4444" 
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default AttendanceTrendsChart;
