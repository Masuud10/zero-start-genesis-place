import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSystemAnalytics } from '@/hooks/useSystemAnalytics';
import { Loader2 } from 'lucide-react';

const PlatformUsageChart = () => {
  const { analyticsData: analytics, isLoading, error } = useSystemAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !analytics?.loginTrend) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No usage data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={analytics.loginTrend}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Area 
          type="monotone" 
          dataKey="logins" 
          stroke="#10b981" 
          fill="#10b981" 
          fillOpacity={0.6}
        />
        <Area 
          type="monotone" 
          dataKey="users" 
          stroke="#3b82f6" 
          fill="#3b82f6" 
          fillOpacity={0.6}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default PlatformUsageChart;