
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { GraduationCap } from 'lucide-react';

interface GradeDistributionChartProps {
  data: Array<{
    grade: string;
    count: number;
    color: string;
  }>;
}

const GradeDistributionChart = ({ data }: GradeDistributionChartProps) => {
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <GraduationCap className="h-5 w-5 text-green-600" />
          Grade Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ grade, count }) => `${grade}: ${count}`}
              outerRadius={60}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 text-center text-sm text-gray-600">
          Total Grades: {data.reduce((sum, item) => sum + item.count, 0)}
        </div>
      </CardContent>
    </Card>
  );
};

export default GradeDistributionChart;
