
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useFinanceOfficerAnalytics } from '@/hooks/useFinanceOfficerAnalytics';
import { Loader2, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

interface EnhancedFinanceAnalyticsProps {
  filters?: {
    term: string;
    class: string;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const chartConfig = {
  amount: { label: 'Amount', color: '#3b82f6' },
  collected: { label: 'Collected', color: '#10b981' },
  expected: { label: 'Expected', color: '#8b5cf6' },
  outstanding: { label: 'Outstanding', color: '#ef4444' },
};

export const EnhancedFinanceAnalytics: React.FC<EnhancedFinanceAnalyticsProps> = ({ 
  filters = { term: 'current', class: 'all' } 
}) => {
  const { data, isLoading, error } = useFinanceOfficerAnalytics(filters);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Loading financial analytics...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-muted-foreground">Failed to load financial analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Total Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              KES {data.keyMetrics?.totalCollected?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">This academic year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data.keyMetrics?.collectionRate?.toFixed(1) || 0}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              Target: 85%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              KES {data.keyMetrics?.outstandingAmount?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">Pending payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Defaulters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {data.defaultersList?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Students with overdue fees</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Transaction Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {data.dailyTransactions && data.dailyTransactions.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-80">
                <LineChart data={data.dailyTransactions}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="var(--color-amount)" 
                    strokeWidth={2}
                    name="Transaction Amount"
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No transaction data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fee Collection by Class */}
        <Card>
          <CardHeader>
            <CardTitle>Fee Collection by Class</CardTitle>
          </CardHeader>
          <CardContent>
            {data.feeCollectionData && data.feeCollectionData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-80">
                <BarChart data={data.feeCollectionData}>
                  <XAxis dataKey="class" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="collected" fill="var(--color-collected)" name="Collected" />
                  <Bar dataKey="expected" fill="var(--color-expected)" name="Expected" opacity={0.5} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No fee collection data by class available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {data.expenseBreakdown && data.expenseBreakdown.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-80">
                <PieChart>
                  <Pie
                    data={data.expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category}: ${percentage?.toFixed(1) || 0}%`}
                    outerRadius={80}
                    dataKey="amount"
                  >
                    {data.expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No expense breakdown data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Defaulters List */}
        <Card>
          <CardHeader>
            <CardTitle>Top Fee Defaulters</CardTitle>
          </CardHeader>
          <CardContent>
            {data.defaultersList && data.defaultersList.length > 0 ? (
              <div className="space-y-3">
                {data.defaultersList.slice(0, 5).map((defaulter, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{defaulter.studentName}</p>
                      <p className="text-sm text-muted-foreground">{defaulter.className}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">KES {defaulter.outstandingAmount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{defaulter.daysPastDue} days overdue</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No defaulters data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedFinanceAnalytics;
