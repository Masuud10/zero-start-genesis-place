
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FeeManagementModule from '../modules/FeeManagementModule';
import StudentAccountsPanel from './StudentAccountsPanel';
import FinancialAnalyticsModule from './FinancialAnalyticsModule';
import FinancialReportsModule from './FinancialReportsModule';
import MpesaPaymentsModule from './MpesaPaymentsModule';
import FinanceSettingsPanel from './FinanceSettingsPanel';

const FinancialOverview: React.FC = () => {
  const [activeTab, setActiveTab] = useState('fees');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="fees">Fee Management</TabsTrigger>
          <TabsTrigger value="mpesa">M-PESA Payments</TabsTrigger>
          <TabsTrigger value="analytics">Financial Analytics</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
          <TabsTrigger value="accounts">Student Accounts</TabsTrigger>
          <TabsTrigger value="settings">Finance Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="fees" className="space-y-6">
          <FeeManagementModule />
        </TabsContent>

        <TabsContent value="mpesa" className="space-y-6">
          <MpesaPaymentsModule />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <FinancialAnalyticsModule />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <FinancialReportsModule />
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <StudentAccountsPanel />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <FinanceSettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialOverview;
