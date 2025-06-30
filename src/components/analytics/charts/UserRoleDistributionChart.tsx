
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useSystemAnalytics } from '@/hooks/useSystemAnalytics';
import { Loader2 } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const UserRoleDistributionChart = () => {
  const { data: analytics, isLoading, error } = useSystemAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !analytics?.userDistribution) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No user data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={analytics.userDistribution}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ role, percentage }) => `${role}: ${percentage}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="count"
        >
          {analytics.userDistribution.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default UserRoleDistributionChart;
