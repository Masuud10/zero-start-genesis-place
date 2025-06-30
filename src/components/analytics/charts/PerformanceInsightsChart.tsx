
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSystemAnalytics } from '@/hooks/useSystemAnalytics';
import { Loader2 } from 'lucide-react';

const PerformanceInsightsChart = () => {
  const { data: analytics, isLoading, error } = useSystemAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !analytics?.performanceTrends) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No performance data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={analytics.performanceTrends}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis domain={[0, 100]} />
        <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Average Grade']} />
        <Line 
          type="monotone" 
          dataKey="average_grade" 
          stroke="#f59e0b" 
          strokeWidth={3}
          dot={{ fill: '#f59e0b', strokeWidth: 2, r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PerformanceInsightsChart;
