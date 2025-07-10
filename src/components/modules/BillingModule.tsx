import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertTriangle,
  CreditCard,
  DollarSign,
  FileText,
  Loader2,
  RefreshCw,
  Plus,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useBillingRecords,
  useBillingStats,
  useBillingActions,
} from "@/hooks/useBillingManagement";
import BillingStatsCards from "@/components/billing/BillingStatsCards";
import SchoolBillingList from "@/components/billing/SchoolBillingList";
import SchoolBillingDetails from "@/components/billing/SchoolBillingDetails";
import CreateBillingRecordModal from "@/components/billing/CreateBillingRecordModal";
import BillingQuickActions from "@/components/billing/BillingQuickActions";

const BillingModule = () => {
  const [selectedSchoolId, setSelectedSchoolId] = useState<
    string | undefined
  >();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Use the new hooks
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
  const { createSetupFees, createMonthlySubscriptions } = useBillingActions();

  const isLoading = recordsLoading || statsLoading;
  const hasError = recordsError || statsError;

  const handleSelectSchool = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
  };

  const handleBackToList = () => {
    setSelectedSchoolId(undefined);
  };

  const handleRefresh = () => {
    refetchRecords();
    refetchStats();
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    handleRefresh();
  };

  const handleCreateSetupFees = async () => {
    try {
      await createSetupFees.mutateAsync();
      toast({
        title: "Setup Fees Created",
        description: "Setup fees have been created for applicable schools.",
      });
    } catch (error) {
      console.error("Failed to create setup fees:", error);
    }
  };

  const handleCreateMonthlySubscriptions = async () => {
    try {
      await createMonthlySubscriptions.mutateAsync();
      toast({
        title: "Monthly Subscriptions Created",
        description:
          "Monthly subscription fees have been created for all active schools.",
      });
    } catch (error) {
      console.error("Failed to create monthly subscriptions:", error);
    }
  };

  if (!user || user.role !== "edufam_admin") {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700">
          Access denied. Only EduFam Administrators can access billing
          management.
        </AlertDescription>
      </Alert>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Billing Management</h2>
            <p className="text-muted-foreground">
              Manage school billing and invoices
            </p>
          </div>
        </div>

        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            Failed to load billing data.{" "}
            {recordsError?.message || statsError?.message}
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Billing Management</h2>
          <p className="text-muted-foreground">
            Manage school billing and invoices in Kenyan Shillings (KES)
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Billing Records
          </Button>
        </div>
      </div>

      {/* Show loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-3" />
          <span className="text-lg">Loading billing data...</span>
        </div>
      )}

      {/* Show content when loaded */}
      {!isLoading && (
        <>
          {/* Billing Stats Cards */}
          <BillingStatsCards />

          {/* Enhanced Quick Actions */}
          <BillingQuickActions
            onRefresh={handleRefresh}
            onShowCreateModal={() => setShowCreateModal(true)}
          />

          {/* Main Content */}
          {selectedSchoolId ? (
            <SchoolBillingDetails
              schoolId={selectedSchoolId}
              onBack={handleBackToList}
              onEditRecord={() => {}} // Placeholder for edit functionality
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
  );
};

export default BillingModule;
