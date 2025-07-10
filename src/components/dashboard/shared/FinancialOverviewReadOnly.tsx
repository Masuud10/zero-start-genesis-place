import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  AlertCircle,
} from "lucide-react";
import { usePrincipalFinancialData } from "@/hooks/usePrincipalFinancialData";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";

const FinancialOverviewReadOnly: React.FC = () => {
  const { data, isLoading, error } = usePrincipalFinancialData();

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
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2">Loading financial data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Financial Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-600">
            Unable to load financial data. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.keyMetrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            No financial data available.
          </div>
        </CardContent>
      </Card>
    );
  }

  const { keyMetrics, feeCollectionData, dailyTransactions, defaultersList } =
    data;

  const chartConfig = {
    collected: { label: "Collected", color: "#10b981" },
    expected: { label: "Expected", color: "#3b82f6" },
    amount: { label: "Amount", color: "#8b5cf6" },
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    Total Collected
                  </p>
                  <p className="text-2xl font-bold text-green-700">
                    KES {keyMetrics.totalCollected?.toLocaleString() || 0}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">
                    Outstanding
                  </p>
                  <p className="text-2xl font-bold text-orange-700">
                    KES {keyMetrics.outstandingAmount?.toLocaleString() || 0}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-orange-600" />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Collection Rate
                  </p>
                  <p className="text-2xl font-bold text-blue-700">
                    {keyMetrics.collectionRate?.toFixed(1) || 0}%
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">
                    Defaulters
                  </p>
                  <p className="text-2xl font-bold text-purple-700">
                    {keyMetrics.defaultersCount || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Fee Collection Chart */}
          {feeCollectionData && feeCollectionData.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3">
                Fee Collection by Class
              </h4>
              <ChartContainer config={chartConfig} className="h-64">
                <BarChart data={feeCollectionData}>
                  <XAxis dataKey="class" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="collected"
                    fill="var(--color-collected)"
                    name="Collected (KES)"
                  />
                  <Bar
                    dataKey="expected"
                    fill="var(--color-expected)"
                    name="Expected (KES)"
                    opacity={0.6}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          )}

          {/* Recent Transactions */}
          {dailyTransactions && dailyTransactions.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3">
                Recent Transaction Trends
              </h4>
              <ChartContainer config={chartConfig} className="h-48">
                <LineChart data={dailyTransactions.slice(-7)}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="var(--color-amount)"
                    strokeWidth={2}
                    name="Daily Amount (KES)"
                  />
                </LineChart>
              </ChartContainer>
            </div>
          )}

          {/* Outstanding Fees Summary section removed */}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialOverviewReadOnly;
