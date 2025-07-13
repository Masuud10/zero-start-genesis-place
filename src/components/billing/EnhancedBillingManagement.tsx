import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Building2,
  DollarSign,
  FileText,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Plus,
  Eye,
  Edit,
  Download,
  Filter,
  Search,
  RefreshCw,
  Loader2,
  TrendingUp,
  Users,
  Calendar,
} from "lucide-react";
import { useEnhancedBillingData } from "@/hooks/useEnhancedBillingData";
import { useBillingActions } from "@/hooks/useBillingActions";
import EnhancedBillingStatsCards from "./EnhancedBillingStatsCards";
import SchoolBillingTable from "./SchoolBillingTable";
import SchoolBillingDetails from "./SchoolBillingDetails";
import CreateBillingRecordModal from "./CreateBillingRecordModal";
import EditBillingRecordModal from "./EditBillingRecordModal";
import BillingExportModal from "./BillingExportModal";
import BillingFilters from "./BillingFilters";
import BillingQuickActions from "./BillingQuickActions";

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
  school?: {
    id: string;
    name: string;
    email: string;
  };
}

interface SchoolBillingData {
  id: string;
  name: string;
  email: string;
  status: string;
  setupCost: number;
  subscriptionCost: number;
  totalPaid: number;
  outstandingBalance: number;
  studentCount: number;
  lastBilledDate: string;
  billingStatus: "active" | "inactive" | "suspended";
  totalRecords: number;
}

const EnhancedBillingManagement: React.FC = () => {
  const [selectedSchoolId, setSelectedSchoolId] = useState<
    string | undefined
  >();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BillingRecord | null>(
    null
  );
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    billingType: "all",
    dateRange: "all",
  });

  const { user } = useAuth();
  const { toast } = useToast();

  // Enhanced billing data hooks
  const {
    data: billingData,
    isLoading: dataLoading,
    error: dataError,
    refetch: refetchData,
  } = useEnhancedBillingData(filters);

  const {
    createBillingRecord,
    updateBillingRecord,
    deleteBillingRecord,
    exportBillingData,
  } = useBillingActions();

  const handleSelectSchool = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
  };

  const handleBackToList = () => {
    setSelectedSchoolId(undefined);
  };

  const handleCreateRecord = () => {
    setShowCreateModal(true);
  };

  const handleEditRecord = (record: BillingRecord) => {
    console.log("✏️ Editing billing record:", record.id);
    setEditingRecord(record);
    setShowEditModal(true);
  };

  const handleEditSchoolRecord = (record: SchoolBillingData) => {
    console.log("✏️ Editing billing record for school:", record.id);
    // TODO: Implement proper edit functionality for school billing data
    setShowEditModal(true);
  };

  const handleExportData = () => {
    setShowExportModal(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    refetchData();
    toast({
      title: "Billing Record Created",
      description: "New billing record has been created successfully.",
    });
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setEditingRecord(null);
    refetchData();
    toast({
      title: "Billing Record Updated",
      description: "Billing record has been updated successfully.",
    });
  };

  const handleExportSuccess = (format: string) => {
    setShowExportModal(false);
    toast({
      title: "Export Successful",
      description: `Billing data has been exported as ${format.toUpperCase()}.`,
    });
  };

  const handleRefresh = () => {
    refetchData();
    toast({
      title: "Data Refreshed",
      description: "Billing data has been refreshed.",
    });
  };

  // Access control
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

  if (dataError) {
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
            Failed to load billing data. {dataError.message}
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
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold">Billing Management</h2>
          <p className="text-muted-foreground">
            Manage setup fees and subscription fees for all schools in Kenyan
            Shillings (KES)
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={dataLoading}
          >
            {dataLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button onClick={handleExportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleCreateRecord}>
            <Plus className="h-4 w-4 mr-2" />
            Create Billing Record
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {!dataLoading && billingData?.stats && (
        <EnhancedBillingStatsCards stats={billingData.stats} />
      )}

      {/* Quick Actions */}
      <BillingQuickActions
        onRefresh={refetchData}
        onShowCreateModal={() => setShowCreateModal(true)}
      />

      {/* Main Content */}
      {dataLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-3" />
          <span className="text-lg">Loading billing data...</span>
        </div>
      ) : selectedSchoolId ? (
        <SchoolBillingDetails
          schoolId={selectedSchoolId}
          onBack={handleBackToList}
          onEditRecord={handleEditRecord}
        />
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">School Overview</TabsTrigger>
            <TabsTrigger value="records">Billing Records</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Filters */}
            <BillingFilters filters={filters} onFiltersChange={setFilters} />

            {/* School Billing Table */}
            <SchoolBillingTable
              schools={billingData?.schools || []}
              onSelectSchool={handleSelectSchool}
              onEditRecord={handleEditSchoolRecord}
            />
          </TabsContent>

          <TabsContent value="records" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Billing Records</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Billing records table will be implemented here */}
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Billing records view coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Analytics charts will be implemented here */}
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Billing analytics coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Modals */}
      <CreateBillingRecordModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditBillingRecordModal
        isOpen={showEditModal}
        record={editingRecord}
        onClose={() => {
          setShowEditModal(false);
          setEditingRecord(null);
        }}
        onSuccess={handleEditSuccess}
      />

      <BillingExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onSuccess={handleExportSuccess}
        data={billingData}
      />
    </div>
  );
};

export default EnhancedBillingManagement;
