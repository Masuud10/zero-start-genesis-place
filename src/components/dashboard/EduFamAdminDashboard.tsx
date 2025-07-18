import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAdminAuthContext } from "@/components/auth/AdminAuthProvider";
import { AuthUser } from "@/types/auth";
import { useAdminSchoolsData } from "@/hooks/useAdminSchoolsData";
import { supabase } from "@/integrations/supabase/client";
import {
  Building2,
  Users,
  TrendingUp,
  AlertCircle,
  Plus,
  Settings,
  Database,
  Shield,
  Bell,
  User,
  Eye,
  Edit,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Loader2,
  CheckCircle,
  XCircle,
  Globe,
  BarChart3,
  FileText,
  Headphones,
  DollarSign,
  Activity,
} from "lucide-react";

// Import dashboard components
import EduFamDashboardOverview from "./EduFamDashboardOverview";
import SchoolsModule from "@/components/modules/SchoolsModule";
import UsersModule from "@/components/modules/UsersModule";
import EduFamAnalyticsOverview from "@/components/analytics/EduFamAnalyticsOverview";
import BillingModule from "@/components/modules/BillingModule";
import SystemHealthModule from "@/components/modules/SystemHealthModule";
import SecurityModule from "@/components/modules/SecurityModule";
import SupportModule from "@/components/modules/SupportModule";
import EduFamSystemSettings from "@/components/modules/settings/EduFamSystemSettings";

// Import modals
import UserManagementModal from "./modals/UserManagementModal";
import MaintenanceModeModal from "./modals/MaintenanceModeModal";
import DatabaseSettingsModal from "./modals/DatabaseSettingsModal";
import SecuritySettingsModal from "./modals/SecuritySettingsModal";
import NotificationSettingsModal from "./modals/NotificationSettingsModal";
import CompanyDetailsModal from "./modals/CompanyDetailsModal";
import SchoolRegistrationModal from "./modals/SchoolRegistrationModal";
import SchoolDetailsModal from "@/components/modals/SchoolDetailsModal";

interface School {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status?: string;
  created_at: string;
  school_type?: string;
  website_url?: string;
  registration_number?: string;
  year_established?: number;
  motto?: string;
  slogan?: string;
  logo_url?: string;
  owner_id?: string;
  principal_id?: string;
  term_structure?: string;
}

const EduFamAdminDashboard = () => {
  const { user, adminUser } = useAdminAuthContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");

  // Create AuthUser from admin data for compatibility with modals
  const authUser: AuthUser | null = adminUser
    ? {
        id: adminUser.user_id || adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        school_id: null, // Admin users don't have school assignments
        avatar_url: null,
        created_at: adminUser.created_at,
        updated_at: adminUser.updated_at,
        user_metadata: {},
        app_metadata: {},
        mfa_enabled: false,
        last_login_at: adminUser.last_login_at,
        last_login_ip: undefined,
      }
    : null;

  // Debug user info
  console.log("🏫 EduFamAdminDashboard: User info:", {
    user: user?.email,
    adminUser: adminUser?.email,
    role: adminUser?.role,
    id: user?.id,
  });

  // Use admin schools data
  const {
    data: schools = [],
    isLoading: schoolsLoading,
    error: schoolsError,
    refetch: refetchSchools,
    isRefetching: schoolsRefetching,
  } = useAdminSchoolsData();

  // Modal states
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showMaintenanceMode, setShowMaintenanceMode] = useState(false);
  const [showDatabaseSettings, setShowDatabaseSettings] = useState(false);
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] =
    useState(false);
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);
  const [showSchoolRegistration, setShowSchoolRegistration] = useState(false);
  const [showSchoolDetails, setShowSchoolDetails] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  // Calculate stats with better error handling
  const totalSchools = Array.isArray(schools) ? schools.length : 0;
  const activeSchools = Array.isArray(schools)
    ? schools.filter((school) => school.status === "active").length
    : 0;
  const recentSchools = Array.isArray(schools)
    ? schools.filter((school) => {
        const createdAt = new Date(school.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return createdAt >= thirtyDaysAgo;
      }).length
    : 0;

  // Debug logging
  console.log("🏫 EduFamAdminDashboard: Schools data:", {
    totalSchools,
    activeSchools,
    recentSchools,
    schoolsLoading,
    schoolsError,
    schoolsData: schools,
  });

  // Handle tab changes from URL
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  const handleModalSuccess = () => {
    console.log("🏫 Refreshing school data after successful operation...");
    refetchSchools();
  };

  // Test function to manually fetch schools
  const testFetchSchools = async () => {
    console.log("🏫 Testing direct schools fetch...");
    try {
      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .limit(5);

      console.log("🏫 Direct fetch result:", { data, error });
    } catch (err) {
      console.error("🏫 Direct fetch error:", err);
    }
  };

  const handleViewSchool = (school: School) => {
    setSelectedSchool(school);
    setShowSchoolDetails(true);
  };

  const handleEditSchool = (school: School) => {
    // For now, we'll show the school details modal in edit mode
    // In the future, you can create a separate edit modal
    setSelectedSchool(school);
    setShowSchoolDetails(true);
  };

  const getSchoolStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "suspended":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  const getSchoolStatusIcon = (status?: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-3 w-3" />;
      case "inactive":
      case "suspended":
        return <XCircle className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  // Show error if there's a schools error
  if (schoolsError) {
    return (
      <div className="p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading schools data: {schoolsError.message}
          </AlertDescription>
        </Alert>
        <Button onClick={testFetchSchools} variant="outline">
          Test Direct Fetch
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            EduFam Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {adminUser?.name || adminUser?.email}. Here's what's
            happening with your system.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setShowSchoolRegistration(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add School
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schoolsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                totalSchools
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeSchools} active schools
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Schools
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schoolsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                recentSchools
              )}
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Real-time count</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-8 h-12">
          <TabsTrigger
            value="overview"
            className="flex items-center gap-2 text-sm"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="schools"
            className="flex items-center gap-2 text-sm"
          >
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Schools</span>
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="flex items-center gap-2 text-sm"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="flex items-center gap-2 text-sm"
          >
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="flex items-center gap-2 text-sm"
          >
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger
            value="support"
            className="flex items-center gap-2 text-sm"
          >
            <Headphones className="h-4 w-4" />
            <span className="hidden sm:inline">Support</span>
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="flex items-center gap-2 text-sm"
          >
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">System</span>
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="flex items-center gap-2 text-sm"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <EduFamDashboardOverview />
        </TabsContent>

        {/* Schools Tab */}
        <TabsContent value="schools" className="space-y-6">
          <SchoolsModule />
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <UsersModule />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <EduFamAnalyticsOverview />
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <BillingModule />
        </TabsContent>

        {/* Support Tab */}
        <TabsContent value="support" className="space-y-6">
          <SupportModule />
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <SystemHealthModule />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <EduFamSystemSettings />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showUserManagement && (
        <UserManagementModal
          isOpen={showUserManagement}
          onClose={() => setShowUserManagement(false)}
          onSuccess={handleModalSuccess}
          user={authUser}
        />
      )}

      {showMaintenanceMode && (
        <MaintenanceModeModal
          isOpen={showMaintenanceMode}
          onClose={() => setShowMaintenanceMode(false)}
          onSuccess={handleModalSuccess}
          user={authUser}
        />
      )}

      {showDatabaseSettings && (
        <DatabaseSettingsModal
          isOpen={showDatabaseSettings}
          onClose={() => setShowDatabaseSettings(false)}
          onSuccess={handleModalSuccess}
          user={authUser}
        />
      )}

      {showSecuritySettings && (
        <SecuritySettingsModal
          isOpen={showSecuritySettings}
          onClose={() => setShowSecuritySettings(false)}
          onSuccess={handleModalSuccess}
          user={authUser}
        />
      )}

      {showNotificationSettings && (
        <NotificationSettingsModal
          isOpen={showNotificationSettings}
          onClose={() => setShowNotificationSettings(false)}
          onSuccess={handleModalSuccess}
          user={authUser}
        />
      )}

      {showCompanyDetails && (
        <CompanyDetailsModal
          isOpen={showCompanyDetails}
          onClose={() => setShowCompanyDetails(false)}
          onSuccess={handleModalSuccess}
          user={authUser}
        />
      )}

      {showSchoolRegistration && (
        <SchoolRegistrationModal
          isOpen={showSchoolRegistration}
          onClose={() => setShowSchoolRegistration(false)}
          onSuccess={handleModalSuccess}
          user={authUser}
        />
      )}

      {showSchoolDetails && selectedSchool && (
        <SchoolDetailsModal
          isOpen={showSchoolDetails}
          onClose={() => setShowSchoolDetails(false)}
          school={selectedSchool}
          onSuccess={handleModalSuccess}
          user={authUser}
        />
      )}
    </div>
  );
};

export default EduFamAdminDashboard;
