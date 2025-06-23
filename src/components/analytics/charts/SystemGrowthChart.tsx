
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Building2, Users } from 'lucide-react';

interface SystemGrowthChartProps {
  schoolsCount: number;
  usersCount: number;
}

const SystemGrowthChart = ({ schoolsCount, usersCount }: SystemGrowthChartProps) => {
  const data = [
    {
      name: 'Schools',
      value: schoolsCount,
      color: '#3B82F6'
    },
    {
      name: 'Users',
      value: usersCount,
      color: '#10B981'
    }
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="h-5 w-5 text-blue-600" />
          System Growth
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-between mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>{schoolsCount} Schools</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>{usersCount} Users</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemGrowthChart;
