
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface FinanceOfficerAnalyticsProps {
  filters: {
    term: string;
    class: string;
  };
}

const FinanceOfficerAnalytics = ({ filters }: FinanceOfficerAnalyticsProps) => {
  // Mock financial data
  const feeCollectionData = [
    { class: 'Grade 1A', collected: 450000, expected: 500000, defaulters: 3 },
    { class: 'Grade 1B', collected: 420000, expected: 480000, defaulters: 4 },
    { class: 'Grade 2A', collected: 380000, expected: 400000, defaulters: 2 },
    { class: 'Grade 2B', collected: 395000, expected: 460000, defaulters: 5 },
  ];

  const dailyTransactions = [
    { date: '2024-01-01', amount: 45000, transactions: 12 },
    { date: '2024-01-02', amount: 38000, transactions: 8 },
    { date: '2024-01-03', amount: 52000, transactions: 15 },
    { date: '2024-01-04', amount: 41000, transactions: 9 },
    { date: '2024-01-05', amount: 48000, transactions: 13 },
  ];

  const expenseBreakdown = [
    { category: 'Salaries', amount: 1200000, percentage: 60 },
    { category: 'Utilities', amount: 200000, percentage: 10 },
    { category: 'Supplies', amount: 300000, percentage: 15 },
    { category: 'Maintenance', amount: 150000, percentage: 7.5 },
    { category: 'Other', amount: 150000, percentage: 7.5 },
  ];

  const defaultersList = [
    { student: 'John Doe', class: 'Grade 2A', amount: 25000, days: 15 },
    { student: 'Jane Smith', class: 'Grade 1B', amount: 18000, days: 8 },
    { student: 'Bob Johnson', class: 'Grade 2B', amount: 32000, days: 22 },
    { student: 'Alice Brown', class: 'Grade 1A', amount: 15000, days: 5 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const chartConfig = {
    collected: { label: 'Collected', color: '#10b981' },
    expected: { label: 'Expected', color: '#3b82f6' },
    amount: { label: 'Amount', color: '#8b5cf6' },
  };

  return (
    <div className="space-y-6">
      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">KES 1.65M</div>
            <p className="text-xs text-muted-foreground">This term</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">89.2%</div>
            <p className="text-xs text-muted-foreground">Above target (85%)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">KES 200K</div>
            <p className="text-xs text-muted-foreground">14 defaulters</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">MPESA Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">127</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Fee Collection by Class */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Collection by Class</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <BarChart data={feeCollectionData}>
              <XAxis dataKey="class" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="collected" fill="var(--color-collected)" name="Collected (KES)" />
              <Bar dataKey="expected" fill="var(--color-expected)" name="Expected (KES)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Transaction Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Transaction Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <LineChart data={dailyTransactions}>
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
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Fee Defaulters */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Defaulters Alert</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {defaultersList.map((defaulter) => (
              <div key={defaulter.student} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{defaulter.student}</p>
                  <p className="text-sm text-muted-foreground">{defaulter.class}</p>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-red-600">KES {defaulter.amount.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{defaulter.days} days overdue</p>
                </div>
                <Badge variant="destructive">
                  Action Required
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Class-wise Collection Status */}
      <Card>
        <CardHeader>
          <CardTitle>Class-wise Collection Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feeCollectionData.map((classData) => {
              const percentage = (classData.collected / classData.expected) * 100;
              return (
                <div key={classData.class} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{classData.class}</p>
                    <p className="text-sm text-muted-foreground">
                      KES {classData.collected.toLocaleString()} / {classData.expected.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <Progress value={percentage} className="h-2" />
                    </div>
                    <Badge variant={percentage >= 90 ? 'default' : percentage >= 75 ? 'secondary' : 'destructive'}>
                      {percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceOfficerAnalytics;
