
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UserCheck } from 'lucide-react';

interface AttendanceAnalyticsChartProps {
  data: Array<{
    day: string;
    present: number;
    absent: number;
    total: number;
    rate: number;
  }>;
}

const AttendanceAnalyticsChart = ({ data }: AttendanceAnalyticsChartProps) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserCheck className="h-5 w-5 text-purple-600" />
          Attendance Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip formatter={(value, name) => [value, name === 'rate' ? 'Attendance Rate (%)' : name]} />
            <Bar dataKey="rate" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 text-center">
          <div className="text-sm text-gray-600">
            Average Attendance: {data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.rate, 0) / data.length) : 0}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceAnalyticsChart;
