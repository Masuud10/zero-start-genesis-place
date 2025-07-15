import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFinancialAnalytics } from '@/hooks/useSchoolAnalytics';
import { Loader2, DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FinancialHealthCardProps {
  schoolId: string;
}

const FinancialHealthCard: React.FC<FinancialHealthCardProps> = ({ schoolId }) => {
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | undefined>();
  const { data: financialData, isLoading, error } = useFinancialAnalytics(schoolId, dateRange);

  const handleDateRangeChange = (range: 'this_month' | 'this_term' | 'this_year' | 'all') => {
    const now = new Date();
    let start: string | undefined;
    let end: string | undefined;

    switch (range) {
      case 'this_month':
        start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      case 'this_term':
        // Assuming term starts in September
        const termStart = new Date(now.getFullYear(), 8, 1); // September 1st
        start = termStart.toISOString().split('T')[0];
        end = now.toISOString().split('T')[0];
        break;
      case 'this_year':
        start = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        end = now.toISOString().split('T')[0];
        break;
      case 'all':
      default:
        start = undefined;
        end = undefined;
        break;
    }

    setDateRange(start && end ? { start, end } : undefined);
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load financial data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Financial Health
        </CardTitle>
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDateRangeChange('this_month')}
            className="text-xs"
          >
            <Calendar className="h-3 w-3 mr-1" />
            This Month
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDateRangeChange('this_term')}
            className="text-xs"
          >
            This Term
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDateRangeChange('this_year')}
            className="text-xs"
          >
            This Year
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDateRangeChange('all')}
            className="text-xs"
          >
            All Time
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {financialData ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Total Revenue</span>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  ${financialData.total_revenue.toLocaleString()}
                </p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Total Expenses</span>
                </div>
                <p className="text-2xl font-bold text-red-900">
                  ${financialData.total_expenses.toLocaleString()}
                </p>
              </div>
              
              <div className={`p-4 rounded-lg ${financialData.net_income >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                <div className="flex items-center gap-2">
                  <DollarSign className={`h-4 w-4 ${financialData.net_income >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                  <span className={`text-sm font-medium ${financialData.net_income >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                    Net Income
                  </span>
                </div>
                <p className={`text-2xl font-bold ${financialData.net_income >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
                  ${financialData.net_income.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Monthly Trends Chart */}
            <div>
              <h4 className="text-sm font-medium mb-3">Revenue vs Expenses Trend</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialData.monthly_trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue" />
                    <Bar dataKey="expenses" fill="hsl(var(--destructive))" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue Breakdown */}
            {financialData.revenue_breakdown.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3">Revenue by Category</h4>
                <div className="space-y-2">
                  {financialData.revenue_breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">{item.category}</span>
                      <span className="font-medium">${item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">No financial data available</p>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialHealthCard;