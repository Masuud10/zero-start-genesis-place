
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock } from 'lucide-react';

interface AttendanceAnalyticsChartProps {
  data: Array<{ day: string; present: number; absent: number; total: number; rate: number }>;
}

const AttendanceAnalyticsChart = ({ data }: AttendanceAnalyticsChartProps) => {
  return (
    <Card className="col-span-1 lg:col-span-2 shadow-lg border-0 bg-gradient-to-br from-white to-purple-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
          <Clock className="w-5 h-5 text-purple-600" />
          Attendance Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" />
            <XAxis dataKey="day" stroke="#7c3aed" fontSize={12} />
            <YAxis stroke="#7c3aed" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #e9d5ff',
                borderRadius: '8px' 
              }}
              formatter={(value: any) => [`${value}%`, 'Attendance Rate']}
            />
            <Bar 
              dataKey="rate" 
              fill="#8b5cf6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AttendanceAnalyticsChart;
