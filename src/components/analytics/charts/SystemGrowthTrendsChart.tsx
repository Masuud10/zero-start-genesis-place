
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSystemAnalytics } from '@/hooks/useSystemAnalytics';
import { Loader2 } from 'lucide-react';

const SystemGrowthTrendsChart = () => {
  const { data: analytics, isLoading, error } = useSystemAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !analytics?.schoolsOnboarded) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No growth data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={analytics.schoolsOnboarded}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey="count" 
          stroke="#3b82f6" 
          strokeWidth={2}
          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SystemGrowthTrendsChart;
