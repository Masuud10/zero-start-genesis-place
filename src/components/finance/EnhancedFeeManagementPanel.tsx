
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStudentFees } from '@/hooks/useStudentFees';
import { useMpesaTransactions } from '@/hooks/useMpesaTransactions';
import FeeAssignmentDialog from './FeeAssignmentDialog';
import MpesaTransactionsPanel from './MpesaTransactionsPanel';
import FeeManagementSummaryCards from './FeeManagementSummaryCards';
import FeeCollectionsTable from './FeeCollectionsTable';
import OutstandingBalancesTable from './OutstandingBalancesTable';
import MpesaTransactionsSection from './MpesaTransactionsSection';
import FeeStructureList from './FeeStructureList';

const EnhancedFeeManagementPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('structures');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { studentFees, loading } = useStudentFees();
  const { transactions } = useMpesaTransactions();

  const handleAssignmentComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Calculate summary statistics
  const totalFees = studentFees.reduce((sum, fee) => sum + fee.amount, 0);
  const totalCollected = studentFees.reduce((sum, fee) => sum + fee.amount_paid, 0);
  const totalOutstanding = totalFees - totalCollected;
  const collectionRate = totalFees > 0 ? (totalCollected / totalFees) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Fee Management</h2>
          <p className="text-muted-foreground">Comprehensive fee management with M-PESA integration</p>
        </div>
        <FeeAssignmentDialog 
          mode="class" 
          onAssignmentComplete={handleAssignmentComplete}
        />
      </div>

      <FeeManagementSummaryCards
        totalFees={totalFees}
        totalCollected={totalCollected}
        totalOutstanding={totalOutstanding}
        collectionRate={collectionRate}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="structures">Fee Structures</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
          <TabsTrigger value="mpesa">M-PESA</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="structures" className="space-y-4">
          <FeeStructureList 
            refreshTrigger={refreshTrigger}
            onEdit={(structure) => {
              // Handle edit functionality
              console.log('Edit structure:', structure);
            }}
          />
        </TabsContent>

        <TabsContent value="collections" className="space-y-4">
          <FeeCollectionsTable
            studentFees={studentFees}
            loading={loading}
            onAssignmentComplete={handleAssignmentComplete}
          />
        </TabsContent>

        <TabsContent value="outstanding" className="space-y-4">
          <OutstandingBalancesTable studentFees={studentFees} />
        </TabsContent>

        <TabsContent value="mpesa" className="space-y-4">
          <MpesaTransactionsPanel />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="text-center py-8">
            <p className="text-gray-500">Financial reports are available in the main Financial Reports section</p>
          </div>
        </TabsContent>
      </Tabs>

      <MpesaTransactionsSection transactions={transactions} />
    </div>
  );
};

export default EnhancedFeeManagementPanel;
