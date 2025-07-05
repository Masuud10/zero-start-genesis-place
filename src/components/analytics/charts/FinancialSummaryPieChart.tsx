import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useSystemAnalytics } from '@/hooks/useSystemAnalytics';
import { Loader2 } from 'lucide-react';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981'];

const FinancialSummaryPieChart = () => {
  const { analyticsData: analytics, isLoading, error } = useSystemAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !analytics?.subscriptionData) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No financial data available</p>
      </div>
    );
  }

  const financialData = [
    { name: 'Total Revenue', value: analytics.totalRevenue },
    { name: 'Monthly Revenue', value: analytics.monthlyRevenue },
    { name: 'Subscriptions', value: analytics.subscriptionData.reduce((sum, sub) => sum + sub.revenue, 0) }
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={financialData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: KES ${Number(value).toLocaleString()}`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {financialData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`KES ${Number(value).toLocaleString()}`, 'Amount']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default FinancialSummaryPieChart;