import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStudentFees } from "@/hooks/useStudentFees";
import { useMpesaTransactions } from "@/hooks/useMpesaTransactions";
import FeeAssignmentDialog from "./FeeAssignmentDialog";
import FeeManagementSummaryCards from "./FeeManagementSummaryCards";
import FeeCollectionsTable from "./FeeCollectionsTable";
import OutstandingBalancesTable from "./OutstandingBalancesTable";
import MpesaTransactionsSection from "./MpesaTransactionsSection";
import FeeStructureList from "./FeeStructureList";

const EnhancedFeeManagementPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState("structures");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const {
    studentFees,
    loading,
    refetch: refetchStudentFees,
  } = useStudentFees();
  const { transactions } = useMpesaTransactions();

  const handleAssignmentComplete = () => {
    console.log("🔄 Triggering fee data refresh");
    setRefreshTrigger((prev) => prev + 1);
    refetchStudentFees();
  };

  // Refetch data when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log("🔄 Refresh trigger changed, refetching data");
      refetchStudentFees();
    }
  }, [refreshTrigger, refetchStudentFees]);

  // Calculate summary statistics
  const totalFees = studentFees.reduce((sum, fee) => sum + fee.amount, 0);
  const totalCollected = studentFees.reduce(
    (sum, fee) => sum + fee.amount_paid,
    0
  );
  const totalOutstanding = totalFees - totalCollected;
  const collectionRate = totalFees > 0 ? (totalCollected / totalFees) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Fee Management</h2>
          <p className="text-muted-foreground">
            Comprehensive fee management with M-PESA integration
          </p>
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="structures">Fee Structures</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
        </TabsList>

        <TabsContent value="structures" className="space-y-4">
          <FeeStructureList
            onEdit={(structure) => {
              // Handle edit functionality
              console.log("Edit structure:", structure);
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
      </Tabs>

      <MpesaTransactionsSection transactions={transactions} />
    </div>
  );
};

export default EnhancedFeeManagementPanel;
