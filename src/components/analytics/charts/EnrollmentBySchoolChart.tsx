
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSystemAnalytics } from '@/hooks/useSystemAnalytics';
import { Loader2 } from 'lucide-react';

const EnrollmentBySchoolChart = () => {
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
        <p>No enrollment data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={analytics.schoolsOnboarded}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EnrollmentBySchoolChart;
