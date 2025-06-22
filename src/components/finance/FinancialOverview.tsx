
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FeeManagementModule from '../modules/FeeManagementModule';
import StudentAccountsModule from '../modules/StudentAccountsModule';
import FinancialAnalyticsModule from './FinancialAnalyticsModule';
import FinancialReportsModule from './FinancialReportsModule';

const FinancialOverview: React.FC = () => {
  const [activeTab, setActiveTab] = useState('fees');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fees">Fee Management</TabsTrigger>
          <TabsTrigger value="analytics">Financial Analytics</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
          <TabsTrigger value="accounts">Student Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="fees" className="space-y-6">
          <FeeManagementModule />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <FinancialAnalyticsModule />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <FinancialReportsModule />
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <StudentAccountsModule />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialOverview;
