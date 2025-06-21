
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFinanceOfficerAnalytics } from '@/hooks/useFinanceOfficerAnalytics';
import { useExpenses } from '@/hooks/useExpenses';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  PieChart,
  BarChart3,
  FileText,
  AlertCircle,
  Loader2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import CreateExpenseDialog from './CreateExpenseDialog';
import FeeStructureManager from './FeeStructureManager';
import FinancialReportsGenerator from './FinancialReportsGenerator';

const ComprehensiveFinancialOverview: React.FC = () => {
  const filters = { term: 'current', class: 'all' };
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useFinanceOfficerAnalytics(filters);
  const { expenses, loading: expensesLoading } = useExpenses();

  // Calculate comprehensive financial data
  const financialSummary = React.useMemo(() => {
    if (!analyticsData?.keyMetrics) return null;

    const totalExpenses = expenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
    const totalRevenue = analyticsData.keyMetrics.totalCollected || 0;
    const pendingFees = analyticsData.keyMetrics.outstanding || 0;
    const netIncome = totalRevenue - totalExpenses;

    return {
      totalRevenue,
      pendingFees,
      totalExpenses,
      netIncome
    };
  }, [analyticsData, expenses]);

  // Process expense data for charts
  const expenseChartData = React.useMemo(() => {
    if (!expenses?.length) return [];

    const categoryTotals = expenses.reduce((acc: any, expense) => {
      const category = expense.category || 'Other';
      acc[category] = (acc[category] || 0) + Number(expense.amount);
      return acc;
    }, {});

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      amount: Number(amount)
    }));
  }, [expenses]);

  // Monthly revenue trend data
  const monthlyTrendData = React.useMemo(() => {
    if (!analyticsData?.dailyTransactions) return [];

    // Group transactions by month
    const monthlyData = analyticsData.dailyTransactions.reduce((acc: any, transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthName,
          revenue: 0,
          expenses: 0
        };
      }
      
      acc[monthKey].revenue += transaction.amount || 0;
      return acc;
    }, {});

    // Add expense data by month
    if (expenses?.length) {
      expenses.forEach(expense => {
        const date = new Date(expense.expense_date || expense.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].expenses += Number(expense.amount) || 0;
        }
      });
    }

    return Object.values(monthlyData).slice(-6); // Last 6 months
  }, [analyticsData, expenses]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  if (analyticsLoading || expensesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Loading financial overview...</span>
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div className="p-6 text-center text-red-600">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p>Error loading financial data: {analyticsError.message}</p>
      </div>
    );
  }

  if (!financialSummary) {
    return (
      <div className="p-6 text-center text-gray-500">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p>No financial data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-700">
                  KES {financialSummary.totalRevenue.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">Revenue collected</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Pending Fees</p>
                <p className="text-3xl font-bold text-orange-700">
                  KES {financialSummary.pendingFees.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <AlertCircle className="h-4 w-4 text-orange-500 mr-1" />
                  <span className="text-sm text-orange-600">Outstanding amount</span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Total Expenses</p>
                <p className="text-3xl font-bold text-red-700">
                  KES {financialSummary.totalExpenses.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600">Total spent</span>
                </div>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${financialSummary.netIncome >= 0 ? 'from-blue-50 to-indigo-50 border-blue-200' : 'from-red-50 to-rose-50 border-red-200'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${financialSummary.netIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  Net Income
                </p>
                <p className={`text-3xl font-bold ${financialSummary.netIncome >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                  KES {financialSummary.netIncome.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  {financialSummary.netIncome >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${financialSummary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {financialSummary.netIncome >= 0 ? 'Profitable' : 'Loss'}
                  </span>
                </div>
              </div>
              <div className={`p-3 ${financialSummary.netIncome >= 0 ? 'bg-blue-100' : 'bg-red-100'} rounded-lg`}>
                <BarChart3 className={`h-8 w-8 ${financialSummary.netIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <CreateExpenseDialog />
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Generate Reports
        </Button>
        <Button variant="outline">
          <PieChart className="h-4 w-4 mr-2" />
          View Analytics
        </Button>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue vs Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Monthly Revenue vs Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    `KES ${Number(value).toLocaleString()}`,
                    name === 'revenue' ? 'Revenue' : 'Expenses'
                  ]}
                />
                <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-600" />
              Expense Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={expenseChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, value }: any) => {
                    const total = expenseChartData.reduce((sum, item) => sum + item.amount, 0);
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                    return `${category}: ${percentage}%`;
                  }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {expenseChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`KES ${Number(value).toLocaleString()}`, 'Amount']} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Fee Structure Management */}
      <FeeStructureManager />

      {/* Financial Reports Generator */}
      <FinancialReportsGenerator />
    </div>
  );
};

export default ComprehensiveFinancialOverview;
