import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useFinancialSummary } from "@/hooks/useFinancialSummary";
import { useMpesaTransactions } from "@/hooks/useMpesaTransactions";
import { Loader2, AlertCircle } from "lucide-react";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--muted))",
];

const FinanceAnalyticsCharts: React.FC = () => {
  const {
    summary,
    expenseBreakdown,
    collectionTrends,
    loading: summaryLoading,
    error: summaryError,
    dataTruncated: summaryTruncated,
  } = useFinancialSummary();
  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    dataTruncated: transactionsTruncated,
  } = useMpesaTransactions();

  const isLoading = summaryLoading || transactionsLoading;
  const hasError = summaryError || transactionsError;
  const isDataTruncated = summaryTruncated || transactionsTruncated;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Failed to load financial charts
          </p>
          {summaryError && (
            <p className="text-xs text-muted-foreground mt-1">{summaryError}</p>
          )}
          {transactionsError && (
            <p className="text-xs text-muted-foreground mt-1">
              {transactionsError}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Validate and prepare data for charts with safe fallbacks
  const revenueData =
    summary && summary.total_fees > 0
      ? [
          { name: "Total Fees", amount: Math.max(0, summary.total_fees || 0) },
          {
            name: "Collected",
            amount: Math.max(0, summary.total_collected || 0),
          },
          {
            name: "Outstanding",
            amount: Math.max(0, summary.outstanding_balance || 0),
          },
        ]
      : [];

  const expenseData =
    expenseBreakdown && expenseBreakdown.length > 0
      ? expenseBreakdown.slice(0, 5).map((item) => ({
          category: item.category || "Unknown",
          amount: Math.max(0, item.amount || 0),
        }))
      : [];

  const paymentMethodData =
    summary && summary.total_collected > 0
      ? [
          {
            name: "MPESA",
            value: Math.max(0, summary.mpesa_transactions_count || 0),
          },
          {
            name: "Other Methods",
            value: Math.max(
              0,
              (summary.total_collected || 0) -
                (summary.mpesa_transactions_count || 0)
            ),
          },
        ].filter((item) => item.value > 0)
      : [];

  const monthlyTrends =
    collectionTrends && collectionTrends.length > 0
      ? collectionTrends
          .slice(-6)
          .map((trend) => {
            try {
              const date = new Date(trend.date);
              return {
                month: !isNaN(date.getTime())
                  ? date.toLocaleDateString("en-US", { month: "short" })
                  : "Unknown",
                amount: Math.max(0, trend.amount || 0),
                transactions: Math.max(0, trend.transaction_count || 0),
              };
            } catch (dateError) {
              console.warn(
                "Invalid date in collection trend:",
                trend.date,
                dateError
              );
              return {
                month: "Unknown",
                amount: Math.max(0, trend.amount || 0),
                transactions: Math.max(0, trend.transaction_count || 0),
              };
            }
          })
          .filter((trend) => trend.month !== "Unknown")
      : [];

  // Show empty state if no data available
  if (
    revenueData.length === 0 &&
    expenseData.length === 0 &&
    paymentMethodData.length === 0 &&
    monthlyTrends.length === 0
  ) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Financial Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No financial data available for charts
              </p>
              {isDataTruncated && (
                <p className="text-xs text-muted-foreground mt-2">
                  Note: Some data may be truncated due to large datasets
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Revenue Overview Bar Chart */}
      {revenueData.length > 0 && (
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
                <Tooltip
                  formatter={(value) => [
                    `KES ${Number(value).toLocaleString()}`,
                    "Amount",
                  ]}
                />
                <Bar dataKey="amount" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Payment Methods Pie Chart */}
      {paymentMethodData.length > 0 && (
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
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Collection Trends Line Chart */}
      {monthlyTrends.length > 0 && (
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
                <Tooltip
                  formatter={(value) => [
                    `KES ${Number(value).toLocaleString()}`,
                    "Amount",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Expense Breakdown Bar Chart */}
      {expenseData.length > 0 && (
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
                <Tooltip
                  formatter={(value) => [
                    `KES ${Number(value).toLocaleString()}`,
                    "Amount",
                  ]}
                />
                <Bar dataKey="amount" fill="hsl(var(--destructive))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Data truncation warning */}
      {isDataTruncated && (
        <div className="col-span-full">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ Some financial data may be truncated due to large datasets. For
              complete analysis, use the detailed reports.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceAnalyticsCharts;
