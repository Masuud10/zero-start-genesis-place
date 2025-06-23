
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, DollarSign, CreditCard, Users, AlertCircle, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AnalyticsData {
  totalFees: number;
  totalCollected: number;
  outstanding: number;
  collectionRate: number;
  monthlyData: Array<{
    month: string;
    collected: number;
    fees: number;
  }>;
  paymentMethods: Array<{
    method: string;
    amount: number;
    count: number;
  }>;
  classBreakdown: Array<{
    className: string;
    totalFees: number;
    collected: number;
    outstanding: number;
  }>;
}

const FinancialAnalyticsModule: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current_year');

  const fetchAnalyticsData = async () => {
    if (!user?.school_id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch total fees data
      const { data: feesData, error: feesError } = await supabase
        .from('fees')
        .select('amount, paid_amount, payment_method, created_at, class:classes(name)')
        .eq('school_id', user.school_id);

      if (feesError) throw feesError;

      // Calculate totals
      const totalFees = feesData?.reduce((sum, fee) => sum + (fee.amount || 0), 0) || 0;
      const totalCollected = feesData?.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0) || 0;
      const outstanding = totalFees - totalCollected;
      const collectionRate = totalFees > 0 ? (totalCollected / totalFees) * 100 : 0;

      // Monthly data (last 6 months)
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const monthFees = feesData?.filter(fee => {
          const feeDate = new Date(fee.created_at);
          return feeDate >= monthStart && feeDate <= monthEnd;
        }) || [];

        monthlyData.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          collected: monthFees.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0),
          fees: monthFees.reduce((sum, fee) => sum + (fee.amount || 0), 0),
        });
      }

      // Payment methods breakdown
      const paymentMethodsMap = new Map();
      feesData?.forEach(fee => {
        if (fee.paid_amount > 0 && fee.payment_method) {
          const method = fee.payment_method;
          if (!paymentMethodsMap.has(method)) {
            paymentMethodsMap.set(method, { amount: 0, count: 0 });
          }
          const current = paymentMethodsMap.get(method);
          current.amount += fee.paid_amount;
          current.count += 1;
        }
      });

      const paymentMethods = Array.from(paymentMethodsMap.entries()).map(([method, data]) => ({
        method,
        amount: data.amount,
        count: data.count,
      }));

      // Class breakdown
      const classMap = new Map();
      feesData?.forEach(fee => {
        const className = fee.class?.name || 'Unknown';
        if (!classMap.has(className)) {
          classMap.set(className, { totalFees: 0, collected: 0 });
        }
        const current = classMap.get(className);
        current.totalFees += fee.amount || 0;
        current.collected += fee.paid_amount || 0;
      });

      const classBreakdown = Array.from(classMap.entries()).map(([className, data]) => ({
        className,
        totalFees: data.totalFees,
        collected: data.collected,
        outstanding: data.totalFees - data.collected,
      }));

      setData({
        totalFees,
        totalCollected,
        outstanding,
        collectionRate,
        monthlyData,
        paymentMethods,
        classBreakdown,
      });
    } catch (err: any) {
      console.error('Error fetching analytics data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [user?.school_id, selectedPeriod]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Loading financial analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading analytics: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No financial data available</h3>
        <p className="text-muted-foreground">No fee records found for analytics.</p>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Financial Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive financial insights and trends
          </p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current_year">Current Year</SelectItem>
            <SelectItem value="last_6_months">Last 6 Months</SelectItem>
            <SelectItem value="current_term">Current Term</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total Fees</span>
            </div>
            <div className="text-2xl font-bold">KES {data.totalFees.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Collected</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              KES {data.totalCollected.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Outstanding</span>
            </div>
            <div className="text-2xl font-bold text-red-600">
              KES {data.outstanding.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Collection Rate</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {data.collectionRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Collection Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`KES ${Number(value).toLocaleString()}`, '']} />
                <Line type="monotone" dataKey="collected" stroke="#00C49F" strokeWidth={2} />
                <Line type="monotone" dataKey="fees" stroke="#0088FE" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.paymentMethods}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ method, percent }) => `${method} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {data.paymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`KES ${Number(value).toLocaleString()}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Class Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Class-wise Fee Collection</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.classBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="className" />
              <YAxis />
              <Tooltip formatter={(value) => [`KES ${Number(value).toLocaleString()}`, '']} />
              <Bar dataKey="collected" fill="#00C49F" />
              <Bar dataKey="outstanding" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialAnalyticsModule;
