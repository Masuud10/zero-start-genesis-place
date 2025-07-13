import React, { useState } from "react";
import {
  useBillingRecords,
  useBillingStats,
} from "@/hooks/useBillingManagement";
import BillingStatsCards from "./BillingStatsCards";
import SchoolBillingList from "./SchoolBillingList";
import SchoolBillingDetails from "./SchoolBillingDetails";
import BillingLoadingFallback from "./BillingLoadingFallback";
import BillingEmptyState from "./BillingEmptyState";
import BillingErrorBoundary from "./BillingErrorBoundary";
import CreateBillingRecordModal from "./CreateBillingRecordModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface BillingRecord {
  id: string;
  school_id: string;
  billing_type: "setup_fee" | "subscription_fee";
  amount: number;
  currency: string;
  billing_period_start?: string;
  billing_period_end?: string;
  student_count?: number;
  status: "pending" | "paid" | "overdue" | "cancelled";
  invoice_number: string;
  description: string;
  due_date: string;
  paid_date?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

const BillingManagementModule: React.FC = () => {
  const [selectedSchoolId, setSelectedSchoolId] = useState<
    string | undefined
  >();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch billing data with enhanced error handling
  const {
    data: billingRecords,
    isLoading: recordsLoading,
    error: recordsError,
    refetch: refetchRecords,
  } = useBillingRecords();

  const {
    data: billingStats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useBillingStats();

  const isLoading = recordsLoading || statsLoading;
  const hasError = recordsError || statsError;
  const errorMessage = recordsError?.message || statsError?.message || null;

  console.log("🔍 BillingManagementModule: Current state:", {
    isLoading,
    hasError,
    errorMessage,
    recordsCount: billingRecords?.length || 0,
    statsData: billingStats ? "loaded" : "null",
  });

  const handleSelectSchool = (schoolId: string) => {
    console.log("🏫 BillingManagementModule: Selecting school:", schoolId);
    setSelectedSchoolId(schoolId);
  };

  const handleBackToList = () => {
    console.log("⬅️ BillingManagementModule: Going back to list");
    setSelectedSchoolId(undefined);
  };

  const handleEditRecord = (record: BillingRecord) => {
    console.log("✏️ BillingManagementModule: Editing record:", record.id);
    // TODO: Implement edit functionality
    // For now, just log the action
  };

  const handleRetry = () => {
    console.log("🔄 BillingManagementModule: Retrying data fetch");
    refetchRecords();
    refetchStats();
  };

  const handleCreateRecords = () => {
    console.log(
      "📝 BillingManagementModule: Opening create billing records modal"
    );
    setShowCreateModal(true);
  };

  const handleCreateSuccess = () => {
    console.log(
      "✅ BillingManagementModule: Billing record created successfully"
    );
    setShowCreateModal(false);
    refetchRecords();
    refetchStats();
  };

  // Check if we have no billing records
  const hasNoBillingRecords = !billingRecords || billingRecords.length === 0;

  return (
    <BillingErrorBoundary>
      <div className="space-y-6">
        {/* Header Section - Always Visible */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">Billing Management</h2>
            <p className="text-muted-foreground">
              Manage setup fees and subscription fees for all schools
            </p>
          </div>

          {/* Create Billing Records Button - Always Visible */}
          <Button
            onClick={handleCreateRecords}
            className="flex items-center gap-2"
            size="default"
          >
            <Plus className="h-4 w-4" />
            Create Billing Records
          </Button>
        </div>

        {/* Show loading fallback if needed */}
        {isLoading && (
          <BillingLoadingFallback
            isLoading={isLoading}
            error={null}
            onRetry={handleRetry}
            title="Billing Management"
            timeout={30000}
          />
        )}

        {/* Show error fallback if there's an error */}
        {hasError && !isLoading && (
          <BillingLoadingFallback
            isLoading={false}
            error={errorMessage}
            onRetry={handleRetry}
            title="Billing Management"
          />
        )}

        {/* Main Content - Only show when not loading or in error state */}
        {!isLoading && !hasError && (
          <>
            {/* Always show stats cards if we have stats data */}
            {billingStats && <BillingStatsCards />}

            {/* Show empty state if no billing records exist */}
            {hasNoBillingRecords ? (
              <BillingEmptyState
                title="No Billing Records Found"
                description="There are no billing records in the system yet. Click the 'Create Billing Records' button above to add billing records for schools."
                showCreateButton={false} // Button is already in header
                onRefreshClick={handleRetry}
                isRefreshing={isLoading}
              />
            ) : selectedSchoolId ? (
              <SchoolBillingDetails
                schoolId={selectedSchoolId}
                onBack={handleBackToList}
                onEditRecord={handleEditRecord}
              />
            ) : (
              <SchoolBillingList
                onSelectSchool={handleSelectSchool}
                selectedSchoolId={selectedSchoolId}
              />
            )}
          </>
        )}

        {/* Create Billing Record Modal */}
        <CreateBillingRecordModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      </div>
    </BillingErrorBoundary>
  );
};

export default BillingManagementModule;
