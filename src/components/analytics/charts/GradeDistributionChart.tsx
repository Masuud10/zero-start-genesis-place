
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen } from 'lucide-react';

interface GradeDistributionChartProps {
  data: Array<{ grade: string; count: number; color: string }>;
}

const GradeDistributionChart = ({ data }: GradeDistributionChartProps) => {
  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
          <BookOpen className="w-5 h-5 text-green-600" />
          Grade Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={90}
              paddingAngle={2}
              dataKey="count"
              label={({ grade, percent }) => `${grade}: ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
              fontSize={11}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px' 
              }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default GradeDistributionChart;
