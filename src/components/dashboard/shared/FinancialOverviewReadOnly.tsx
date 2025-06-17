
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, AlertCircle, Users } from 'lucide-react';
import { useFinanceOfficerAnalytics } from '@/hooks/useFinanceOfficerAnalytics';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, ResponsiveContainer } from 'recharts';

const FinancialOverviewReadOnly = () => {
  const filters = { term: 'current', class: 'all' };
  const { data, isLoading, error } = useFinanceOfficerAnalytics(filters);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="ml-2">Loading financial data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <p>Unable to load financial data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { keyMetrics, feeCollectionData, dailyTransactions } = data;

  const chartConfig = {
    collected: { label: 'Collected', color: '#10b981' },
    expected: { label: 'Expected', color: '#f59e0b' },
    amount: { label: 'Amount', color: '#3b82f6' },
  };

  return (
    <Card className="bg-gradient-to-br from-white to-green-50/30 border shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          Financial Overview
          <Badge variant="secondary" className="ml-auto">Read Only</Badge>
        </CardTitle>
        <p className="text-muted-foreground">
          Real-time financial insights and fee collection analytics
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Collected</p>
                <p className="text-2xl font-bold text-green-600">
                  KES {keyMetrics?.totalCollected?.toLocaleString() || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="p-4 bg-white border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold text-orange-600">
                  KES {keyMetrics?.outstanding?.toLocaleString() || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="p-4 bg-white border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Collection Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {keyMetrics?.collectionRate?.toFixed(1) || 0}%
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="p-4 bg-white border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold text-purple-600">
                  {keyMetrics?.transactionCount || 0}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fee Collection by Class */}
          <div className="p-4 bg-white border rounded-lg">
            <h4 className="font-semibold mb-4">Fee Collection by Class</h4>
            <ChartContainer config={chartConfig} className="h-64">
              <BarChart data={feeCollectionData || []}>
                <XAxis dataKey="class" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="collected" fill="var(--color-collected)" name="Collected (KES)" />
                <Bar dataKey="expected" fill="var(--color-expected)" name="Expected (KES)" opacity={0.5} />
              </BarChart>
            </ChartContainer>
          </div>

          {/* Daily Transactions Trend */}
          <div className="p-4 bg-white border rounded-lg">
            <h4 className="font-semibold mb-4">Recent Transaction Trends</h4>
            <ChartContainer config={chartConfig} className="h-64">
              <LineChart data={dailyTransactions?.slice(-7) || []}>
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="var(--color-amount)" 
                  strokeWidth={2}
                  name="Amount (KES)"
                />
              </LineChart>
            </ChartContainer>
          </div>
        </div>

        {/* Notice */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-blue-800 font-medium">Financial Data Access</p>
              <p className="text-blue-700 mt-1">
                This financial overview is synchronized with the Finance Officer's dashboard. 
                For detailed financial management and transactions, please contact your Finance Officer.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialOverviewReadOnly;
