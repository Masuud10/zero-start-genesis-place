
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, AlertCircle, Building2 } from 'lucide-react';
import { useBillingStats } from '@/hooks/useBillingManagement';

const BillingStatsCards: React.FC = () => {
  const { data: billingStats, isLoading, error } = useBillingStats();

  console.log('📊 BillingStatsCards: Rendering with data:', billingStats);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-300 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-300 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-300 rounded w-24"></div>
              <div className="h-3 bg-gray-300 rounded w-32 mt-2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !billingStats) {
    console.error('❌ BillingStatsCards: Error or no data:', error);
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Failed to load billing statistics</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number | undefined, currency: string = 'KES') => {
    if (amount === undefined || amount === null) return `${currency} 0.00`;
    return `${currency} ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">
            {formatCurrency(billingStats.paid_amount)}
          </div>
          <p className="text-xs text-green-700">From all paid billing records</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-yellow-800">Pending Amount</CardTitle>
          <TrendingUp className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-900">
            {formatCurrency(billingStats.pending_amount)}
          </div>
          <p className="text-xs text-yellow-700">Awaiting payment</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-800">Total Amount</CardTitle>
          <AlertCircle className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">
            {formatCurrency(billingStats.total_amount)}
          </div>
          <p className="text-xs text-blue-700">Expected total revenue</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-800">Active Schools</CardTitle>
          <Building2 className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">
            {billingStats.total_schools || 0}
          </div>
          <p className="text-xs text-purple-700">Schools with billing records</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingStatsCards;
