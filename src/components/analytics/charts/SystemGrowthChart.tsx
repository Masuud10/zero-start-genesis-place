
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { School } from 'lucide-react';

interface SystemGrowthChartProps {
  schoolsCount: number;
  usersCount: number;
}

const SystemGrowthChart = ({ schoolsCount, usersCount }: SystemGrowthChartProps) => {
  const chartData = [
    { month: 'Jan', schools: Math.max(0, schoolsCount - 5), users: Math.max(0, usersCount - 50) },
    { month: 'Feb', schools: Math.max(0, schoolsCount - 4), users: Math.max(0, usersCount - 40) },
    { month: 'Mar', schools: Math.max(0, schoolsCount - 3), users: Math.max(0, usersCount - 30) },
    { month: 'Apr', schools: Math.max(0, schoolsCount - 2), users: Math.max(0, usersCount - 20) },
    { month: 'May', schools: Math.max(0, schoolsCount - 1), users: Math.max(0, usersCount - 10) },
    { month: 'Jun', schools: schoolsCount, users: usersCount }
  ];

  return (
    <Card className="col-span-1 lg:col-span-2 shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
          <School className="w-5 h-5 text-blue-600" />
          System Growth Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }} 
            />
            <Line 
              type="monotone" 
              dataKey="schools" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
              name="Active Schools"
            />
            <Line 
              type="monotone" 
              dataKey="users" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
              name="Total Users"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SystemGrowthChart;
