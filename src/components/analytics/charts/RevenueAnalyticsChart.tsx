
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSystemAnalytics } from '@/hooks/useSystemAnalytics';
import { Loader2 } from 'lucide-react';

const RevenueAnalyticsChart = () => {
  const { data: analytics, isLoading, error } = useSystemAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !analytics?.financeSummary) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No revenue data available</p>
      </div>
    );
  }

  const revenueData = [
    { name: 'Subscriptions', amount: analytics.financeSummary.total_subscriptions },
    { name: 'Setup Fees', amount: analytics.financeSummary.setup_fees },
    { name: 'Monthly Revenue', amount: analytics.financeSummary.monthly_revenue }
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={revenueData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => [`KES ${Number(value).toLocaleString()}`, 'Amount']} />
        <Bar dataKey="amount" fill="#8b5cf6" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RevenueAnalyticsChart;
