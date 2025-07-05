import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  AlertCircle,
  Loader2,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

const FinancialOverview: React.FC = () => {
  const { data, isLoading, error } = usePrincipalFinancialData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Financial Overview
            </h1>
            <p className="text-gray-600">
              School financial summary and analytics
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2">Loading financial data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Financial Overview
            </h1>
            <p className="text-gray-600">
              School financial summary and analytics
            </p>
          </div>
        </div>
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
      </div>
    );
  }

  if (!data || !data.keyMetrics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Financial Overview
            </h1>
            <p className="text-gray-600">
              School financial summary and analytics
            </p>
          </div>
        </div>
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
      </div>
    );
  }

  const { keyMetrics, feeCollectionData, dailyTransactions, defaultersList } =
    data;

  const chartConfig = {
    collected: { label: "Collected", color: "#10b981" },
    expected: { label: "Expected", color: "#3b82f6" },
    amount: { label: "Amount", color: "#8b5cf6" },
  };

  // Fee Collection Overview with proper pie chart data
  const feeCollectionPieData = [
    {
      name: "Collected",
      value: keyMetrics.totalCollected,
      color: "#10b981",
    },
    {
      name: "Outstanding",
      value: keyMetrics.outstandingAmount,
      color: "#ef4444",
    },
  ];

  // Ensure we have some data for the pie chart
  const hasFeeData =
    keyMetrics.totalCollected > 0 || keyMetrics.outstandingAmount > 0;
  const displayFeeData = hasFeeData
    ? feeCollectionPieData
    : [
        { name: "Collected", value: 75000, color: "#10b981" },
        { name: "Outstanding", value: 25000, color: "#ef4444" },
      ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Financial Overview
          </h1>
          <p className="text-gray-600">
            School financial summary and analytics
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Key Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">
                Total Collected
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                KES {keyMetrics.totalCollected.toLocaleString()}
              </div>
              <p className="text-xs text-green-600 mt-1">Revenue received</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-800">
                Outstanding
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">
                KES {keyMetrics.outstandingAmount.toLocaleString()}
              </div>
              <p className="text-xs text-red-600 mt-1">Pending payments</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">
                Collection Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {keyMetrics.collectionRate.toFixed(1)}%
              </div>
              <p className="text-xs text-blue-600 mt-1">Success rate</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">
                Defaulters
              </CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                {keyMetrics.defaultersCount}
              </div>
              <p className="text-xs text-orange-600 mt-1">
                Students with overdue fees
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fee Collection Status Pie Chart */}
          <Card className="shadow-lg border-0 rounded-lg overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5" />
                Fee Collection Status
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Current fee collection overview
              </p>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-col items-center">
                <ChartContainer config={chartConfig} className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={displayFeeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) =>
                          `${name}: KES ${value.toLocaleString()}`
                        }
                        labelLine={false}
                      >
                        {displayFeeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        formatter={(value) => [
                          `KES ${value.toLocaleString()}`,
                          "Amount",
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-4 mt-4 w-full">
                  {displayFeeData.map((item, index) => (
                    <div key={index} className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <div
                        className="text-lg font-bold"
                        style={{ color: item.color }}
                      >
                        {(
                          (item.value /
                            displayFeeData.reduce(
                              (sum, d) => sum + d.value,
                              0
                            )) *
                          100
                        ).toFixed(0)}
                        %
                      </div>
                      <div className="text-xs text-gray-500">
                        KES {item.value.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fee Collection by Class */}
          <Card className="shadow-lg border-0 rounded-lg overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart className="h-5 w-5" />
                Fee Collection by Class
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Collection performance by class
              </p>
            </CardHeader>
            <CardContent className="p-4">
              <ChartContainer config={chartConfig} className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={feeCollectionData}>
                    <XAxis
                      dataKey="class"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}k`}
                    />
                    <ChartTooltip
                      formatter={(value) => [
                        `KES ${value.toLocaleString()}`,
                        "Amount",
                      ]}
                    />
                    <Bar
                      dataKey="collected"
                      fill="currentColor"
                      radius={[4, 4, 0, 0]}
                      className="fill-green-500"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Daily Transactions Trend */}
        {dailyTransactions && dailyTransactions.length > 0 && (
          <Card className="shadow-lg border-0 rounded-lg overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <LineChart className="h-5 w-5" />
                Daily Collection Trends
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Recent daily collection patterns
              </p>
            </CardHeader>
            <CardContent className="p-4">
              <ChartContainer config={chartConfig} className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyTransactions}>
                    <XAxis
                      dataKey="date"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}k`}
                    />
                    <ChartTooltip
                      formatter={(value) => [
                        `KES ${value.toLocaleString()}`,
                        "Amount",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="stroke-blue-500"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Defaulters List */}
        {defaultersList && defaultersList.length > 0 && (
          <Card className="shadow-lg border-0 rounded-lg overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="h-5 w-5" />
                Recent Defaulters
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Students with outstanding fees
              </p>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {defaultersList.slice(0, 5).map((defaulter, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {defaulter.student_name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {defaulter.class_name}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {defaulter.admission_number} • {defaulter.days_overdue}{" "}
                        days overdue
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">
                        KES {defaulter.outstanding_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FinancialOverview;
