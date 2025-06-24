
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import FinanceSettingsPanel from '@/components/finance/FinanceSettingsPanel';
import StudentAccountsPanel from '@/components/finance/StudentAccountsPanel';
import MpesaPaymentsPanel from '@/components/finance/MpesaPaymentsPanel';
import FinancialReportsPanel from '@/components/finance/FinancialReportsPanel';
import FinanceAnalyticsPanel from '@/components/finance/FinanceAnalyticsPanel';
import { DollarSign, Settings, Users, CreditCard, BarChart3, FileText } from 'lucide-react';

const FinanceModule: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user || !['finance_officer', 'principal', 'school_owner'].includes(user.role || '')) {
    return (
      <div className="p-8 text-center text-red-600">
        <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
        <p>You don't have permission to access the finance module.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Finance Management</h1>
          <p className="text-muted-foreground">Manage school finances, fees, and payments</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="mpesa" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            MPESA Payments
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Student Accounts
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KES 2,450,000</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KES 650,000</div>
                <p className="text-xs text-muted-foreground">-5.2% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">MPESA Transactions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">+15% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">79.0%</div>
                <p className="text-xs text-muted-foreground">+2.3% from last month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mpesa">
          <MpesaPaymentsPanel />
        </TabsContent>

        <TabsContent value="students">
          <StudentAccountsPanel />
        </TabsContent>

        <TabsContent value="reports">
          <FinancialReportsPanel />
        </TabsContent>

        <TabsContent value="analytics">
          <FinanceAnalyticsPanel />
        </TabsContent>

        <TabsContent value="settings">
          <FinanceSettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceModule;
