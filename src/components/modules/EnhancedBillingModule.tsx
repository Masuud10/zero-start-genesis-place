
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEnhancedBillingSummary, useBillingActions } from '@/hooks/useEnhancedBilling';
import { DollarSign, TrendingUp, AlertCircle, RefreshCw, Loader2, Building2, CreditCard, Calendar, Settings } from 'lucide-react';
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {billingSummary?.currency} {billingSummary?.total_revenue?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">From all billing records</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {billingSummary?.currency} {billingSummary?.pending_amount?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting payment</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {billingSummary?.currency} {billingSummary?.overdue_amount?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">Past due date</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Schools</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {billingSummary?.total_schools || 0}
                </div>
                <p className="text-xs text-muted-foreground">Schools with billing records</p>
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
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Setup Fees</span>
                    <span className="text-sm font-mono">
                      {billingSummary?.currency} {billingSummary?.setup_fees_total?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Subscription Fees</span>
                    <span className="text-sm font-mono">
                      {billingSummary?.currency} {billingSummary?.subscription_fees_total?.toLocaleString() || 0}
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total</span>
                    <span className="font-mono">
                      {billingSummary?.currency} {((billingSummary?.setup_fees_total || 0) + (billingSummary?.subscription_fees_total || 0)).toLocaleString()}
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
