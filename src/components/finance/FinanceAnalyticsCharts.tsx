import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useFinancialSummary } from '@/hooks/useFinancialSummary';
import { useMpesaTransactions } from '@/hooks/useMpesaTransactions';
import { Loader2 } from 'lucide-react';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

const FinanceAnalyticsCharts: React.FC = () => {
  const { summary, expenseBreakdown, collectionTrends, loading: summaryLoading } = useFinancialSummary();
  const { transactions, loading: transactionsLoading } = useMpesaTransactions();

  const isLoading = summaryLoading || transactionsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Prepare data for charts
  const revenueData = summary ? [
    { name: 'Total Fees', amount: summary.total_fees },
    { name: 'Collected', amount: summary.total_collected },
    { name: 'Outstanding', amount: summary.outstanding_balance },
  ] : [];

  const expenseData = expenseBreakdown?.slice(0, 5) || [];

  const paymentMethodData = summary ? [
    { name: 'MPESA', value: summary.mpesa_transactions_count || 0 },
    { name: 'Other Methods', value: Math.max(0, (summary.total_collected || 0) - (summary.mpesa_transactions_count || 0)) },
  ] : [];

  const monthlyTrends = collectionTrends?.slice(-6).map(trend => ({
    month: new Date(trend.date).toLocaleDateString('en-US', { month: 'short' }),
    amount: trend.amount,
    transactions: trend.transaction_count
  })) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Revenue Overview Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`KES ${Number(value).toLocaleString()}`, 'Amount']} />
              <Bar dataKey="amount" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Payment Methods Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentMethodData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentMethodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Collection Trends Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Collection Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`KES ${Number(value).toLocaleString()}`, 'Amount']} />
              <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Expense Breakdown Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expenseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value) => [`KES ${Number(value).toLocaleString()}`, 'Amount']} />
              <Bar dataKey="amount" fill="hsl(var(--destructive))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceAnalyticsCharts;