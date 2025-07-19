
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEnhancedBillingSummary, useBillingActions } from '@/hooks/useEnhancedBilling';
import { DollarSign, TrendingUp, AlertCircle, RefreshCw, Loader2, Building2, CreditCard, Calendar, Settings, Plus } from 'lucide-react';
import BillingSettingsPanel from '@/components/billing/BillingSettingsPanel';
import EnhancedBillingRecords from '@/components/billing/EnhancedBillingRecords';

const EnhancedBillingModule = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { 
    data: billingSummary, 
    isLoading: summaryLoading, 
    error: summaryError,
    refetch: refetchSummary
  } = useEnhancedBillingSummary();

  const { createMonthlySubscriptions } = useBillingActions();

  const handleRefresh = () => {
    refetchSummary();
  };

  const handleCreateSubscriptions = () => {
    createMonthlySubscriptions.mutate();
  };

  const formatCurrency = (amount: number | undefined, currency: string = 'KES') => {
    if (amount === undefined || amount === null) return `${currency} 0.00`;
    return `${currency} ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  if (summaryError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Enhanced Billing Management</h2>
            <p className="text-muted-foreground">Manage setup fees, subscriptions, and billing records</p>
          </div>
        </div>

        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-600">Billing Data Error</AlertTitle>
          <AlertDescription className="text-red-700 mb-4">
            Failed to load billing data. Please try again.
          </AlertDescription>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  if (summaryLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Enhanced Billing Management</h2>
            <p className="text-muted-foreground">Manage setup fees, subscriptions, and billing records</p>
          </div>
        </div>

        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-4" />
          <p className="text-gray-600">Loading billing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Enhanced Billing Management</h2>
          <p className="text-muted-foreground">Manage setup fees, subscriptions, and billing records</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleCreateSubscriptions}
            disabled={createMonthlySubscriptions.isPending}
          >
            {createMonthlySubscriptions.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                Generate Monthly Fees
              </>
            )}
          </Button>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="records">Billing Records</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">
                  {formatCurrency(billingSummary?.total_revenue, billingSummary?.currency)}
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
                  {formatCurrency(billingSummary?.pending_amount, billingSummary?.currency)}
                </div>
                <p className="text-xs text-yellow-700">Awaiting payment</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-800">Overdue Amount</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-900">
                  {formatCurrency(billingSummary?.overdue_amount, billingSummary?.currency)}
                </div>
                <p className="text-xs text-red-700">Past due date</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Active Schools</CardTitle>
                <Building2 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">
                  {billingSummary?.total_schools || 0}
                </div>
                <p className="text-xs text-blue-700">Schools with billing records</p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">Setup Fees</span>
                    <span className="text-sm font-mono font-bold">
                      {formatCurrency(billingSummary?.setup_fees_total, billingSummary?.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium">Subscription Fees</span>
                    <span className="text-sm font-mono font-bold">
                      {formatCurrency(billingSummary?.subscription_fees_total, billingSummary?.currency)}
                    </span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg font-semibold">
                    <span>Total Revenue</span>
                    <span className="font-mono">
                      {formatCurrency(
                        (billingSummary?.setup_fees_total || 0) + (billingSummary?.subscription_fees_total || 0),
                        billingSummary?.currency
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Subscriptions</span>
                    <span className="text-2xl font-bold text-green-600">
                      {billingSummary?.active_subscriptions || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Schools</span>
                    <span className="text-2xl font-bold">
                      {billingSummary?.total_schools || 0}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Subscription rate: {billingSummary?.total_schools > 0 
                      ? Math.round(((billingSummary?.active_subscriptions || 0) / billingSummary.total_schools) * 100)
                      : 0}%
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
                    <strong>Fee Structure:</strong><br />
                    Setup Fee: KES 5,000 (one-time)<br />
                    Subscription: KES 50 per student/month
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="records">
          <EnhancedBillingRecords />
        </TabsContent>

        <TabsContent value="settings">
          <BillingSettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedBillingModule;
