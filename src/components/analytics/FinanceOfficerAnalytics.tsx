import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface FinanceOfficerAnalyticsProps {
  filters: {
    term: string;
    class: string;
  };
}

const fetchAnalyticsData = async (schoolId: string, filters: FinanceOfficerAnalyticsProps['filters']) => {
  // For now, we ignore filters until they are implemented properly.
  // We'll fetch data for the whole school.
  
  // 1. Fetch fees, students and classes
  const { data: fees, error: feesError } = await supabase
    .from('fees')
    .select('amount, paid_amount, due_date, mpesa_code, students(id, name, classes(name))')
    .eq('school_id', schoolId);
  if (feesError) throw new Error(`Fetching fees: ${feesError.message}`);

  // 2. Fetch financial transactions
  const { data: transactions, error: txError } = await supabase
    .from('financial_transactions')
    .select('amount, payment_method, created_at, student_id')
    .eq('school_id', schoolId)
    .eq('transaction_type', 'payment');
  if (txError) throw new Error(`Fetching transactions: ${txError.message}`);

  // --- Process Data ---

  // Key Metrics
  const totalCollected = fees.reduce((sum, f) => sum + (f.paid_amount || 0), 0);
  const totalExpected = fees.reduce((sum, f) => sum + (f.amount || 0), 0);
  const outstanding = totalExpected - totalCollected;
  const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;
  const mpesaTransactions = fees.filter(f => f.mpesa_code).length;

  // Fee Collection by Class
  const feeCollectionByClassMap = fees.reduce((acc, fee) => {
    const studentData = fee.students;
    const className = studentData?.classes?.name || 'Unassigned';
    if (!acc[className]) {
      acc[className] = { class: className, collected: 0, expected: 0, defaulters: new Set() };
    }
    acc[className].expected += fee.amount || 0;
    acc[className].collected += fee.paid_amount || 0;
    if ((fee.amount || 0) - (fee.paid_amount || 0) > 0 && studentData?.id) {
        acc[className].defaulters.add(studentData.id);
    }
    return acc;
  }, {} as Record<string, { class: string; collected: number; expected: number; defaulters: Set<string> }>);
  const feeCollectionByClass = Object.values(feeCollectionByClassMap).map(item => ({...item, defaulters: item.defaulters.size}));

  // Daily Transactions
  const dailyTransactionsMap = transactions.reduce((acc, tx) => {
    const date = new Date(tx.created_at).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { date, amount: 0, transactions: 0 };
    }
    acc[date].amount += tx.amount || 0;
    acc[date].transactions += 1;
    return acc;
  }, {} as Record<string, { date: string; amount: number; transactions: number }>);
  const dailyTransactions = Object.values(dailyTransactionsMap).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Defaulters List
  const defaultersMap = fees.reduce((acc, fee) => {
    const balance = (fee.amount || 0) - (fee.paid_amount || 0);
    const studentData = fee.students;
    if (balance > 0 && studentData) {
      if (!acc[studentData.id]) {
        acc[studentData.id] = { 
          student: studentData.name, 
          class: studentData.classes?.name || 'Unassigned', 
          amount: 0, 
          days: 0 // days overdue logic is complex without term dates, setting to 0
        };
      }
      acc[studentData.id].amount += balance;
    }
    return acc;
  }, {} as Record<string, {student: string, class: string, amount: number, days: number}>);
  const defaultersList = Object.values(defaultersMap).sort((a,b) => b.amount - a.amount).slice(0, 5);

  return {
    keyMetrics: { totalCollected, collectionRate, outstanding, mpesaTransactions, defaulterCount: Object.keys(defaultersMap).length },
    feeCollectionData: feeCollectionByClass,
    dailyTransactions,
    defaultersList
  };
};


const FinanceOfficerAnalytics = ({ filters }: FinanceOfficerAnalyticsProps) => {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['financeOfficerAnalytics', user?.school_id, filters],
    queryFn: () => fetchAnalyticsData(user!.school_id!, filters),
    enabled: !!user?.school_id,
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const chartConfig = {
    collected: { label: 'Collected', color: '#10b981' },
    expected: { label: 'Expected', color: '#3b82f6' },
    amount: { label: 'Amount', color: '#8b5cf6' },
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Loading financial analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load financial analytics. Please try again later. <br />
          <small>{error.message}</small>
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!data) {
    return <p>No data available.</p>;
  }

  const { keyMetrics, feeCollectionData, dailyTransactions, defaultersList } = data;

  return (
    <div className="space-y-6">
      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">KES {keyMetrics.totalCollected.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This term</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{keyMetrics.collectionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Overall</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">KES {keyMetrics.outstanding.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{keyMetrics.defaulterCount} defaulters</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">MPESA Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{keyMetrics.mpesaTransactions}</div>
            <p className="text-xs text-muted-foreground">Overall</p>
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
              <YAxis tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value as number)} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="collected" fill="var(--color-collected)" name="Collected (KES)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expected" fill="var(--color-expected)" name="Expected (KES)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Daily Transaction Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Transaction Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <LineChart data={dailyTransactions}>
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value as number)} />
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
      </div>

      {/* Fee Defaulters */}
      <Card>
        <CardHeader>
          <CardTitle>Top Fee Defaulters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {defaultersList.length > 0 ? defaultersList.map((defaulter) => (
              <div key={defaulter.student} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{defaulter.student}</p>
                  <p className="text-sm text-muted-foreground">{defaulter.class}</p>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-red-600">KES {defaulter.amount.toLocaleString()}</div>
                  {/*<p className="text-xs text-muted-foreground">{defaulter.days} days overdue</p>*/}
                </div>
                <Badge variant="destructive">
                  Action Required
                </Badge>
              </div>
            )) : <p className="text-center text-muted-foreground p-4">No significant defaulters found.</p>}
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
              const percentage = classData.expected > 0 ? (classData.collected / classData.expected) * 100 : 0;
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
