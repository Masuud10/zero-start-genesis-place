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
  Search,
  ActivitySquare,
  ToggleLeft,
  Crown,
  School,
  CreditCard,
  Megaphone,
  UserCheck,
  Award,
  FolderKanban,
} from "lucide-react";

// Import new advanced features
import DetailedAuditLogsPage from "./super-admin/DetailedAuditLogsPage";
import SystemHealthStatusPage from "./super-admin/SystemHealthStatusPage";
import FeatureFlagManagementPage from "./super-admin/FeatureFlagManagementPage";
import AdminUserManagementPage from "./super-admin/AdminUserManagementPage";

// Import dashboard components
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

// Import schools management components
import SchoolsManagementModule from "@/components/modules/SchoolsManagementModule";
import AnalyticsModule from "@/components/modules/AnalyticsModule";
import ReportsModule from "@/components/modules/ReportsModule";
import CommunicationModule from "@/components/modules/CommunicationModule";
import CertificateModule from "@/components/modules/CertificateModule";

interface School {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  created_at: string;
  updated_at: string;
  owner_id?: string;
  logo_url?: string;
  website_url?: string;
  motto?: string;
  slogan?: string;
  registration_number?: string;
  year_established?: number;
  owner_information?: string;
  school_type?: string;
  term_structure?: string;
  location?: string;
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

  const getRoleIcon = () => {
    if (adminUser?.role === "super_admin") {
      return <Crown className="h-5 w-5 text-yellow-600" />;
    }
    return <Building2 className="h-5 w-5 text-blue-600" />;
  };

  const getRoleLabel = () => {
    if (adminUser?.role === "super_admin") {
      return "Super Admin";
    }
    return "EduFam Admin";
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    let greeting = "Good morning";

    if (hours >= 12 && hours < 17) {
      greeting = "Good afternoon";
    } else if (hours >= 17) {
      greeting = "Good evening";
    }

    return greeting;
  };

  // Show error if schools data failed to load
  if (schoolsError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading schools data: {schoolsError.message}
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={testFetchSchools}
            >
              Test Connection
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Greeting */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {getRoleIcon()}
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {getRoleLabel()} Dashboard
                </h1>
                <p className="text-muted-foreground">
                  {getCurrentTime()}, {adminUser?.name || "Admin"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Activity className="h-3 w-3" />
              <span>System Online</span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <Plus className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">99.9%</div>
            <p className="text-xs text-muted-foreground">Uptime</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schoolsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                "1,234"
              )}
            </div>
            <p className="text-xs text-muted-foreground">Across all schools</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setShowSchoolRegistration(true)}
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm">Add School</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setShowUserManagement(true)}
            >
              <UserCheck className="h-6 w-6" />
              <span className="text-sm">Create User</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setShowMaintenanceMode(true)}
            >
              <Settings className="h-6 w-6" />
              <span className="text-sm">Maintenance</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setShowDatabaseSettings(true)}
            >
              <Database className="h-6 w-6" />
              <span className="text-sm">Database</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-12 h-12">
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
            value="admin-users"
            className="flex items-center gap-2 text-sm"
            style={{
              display: adminUser?.role === "super_admin" ? undefined : "none",
            }}
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Admin Users</span>
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
            value="audit-logs"
            className="flex items-center gap-2 text-sm"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Audit</span>
          </TabsTrigger>
          <TabsTrigger
            value="system-health"
            className="flex items-center gap-2 text-sm"
          >
            <ActivitySquare className="h-4 w-4" />
            <span className="hidden sm:inline">Health</span>
          </TabsTrigger>
          <TabsTrigger
            value="feature-flags"
            className="flex items-center gap-2 text-sm"
          >
            <ToggleLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Features</span>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>System Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Schools</span>
                    <span className="text-sm text-muted-foreground">
                      {totalSchools}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Schools</span>
                    <span className="text-sm text-muted-foreground">
                      {activeSchools}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">System Status</span>
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Online
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">System backup completed</span>
                    <span className="text-xs text-muted-foreground">
                      2 min ago
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">New school registered</span>
                    <span className="text-xs text-muted-foreground">
                      15 min ago
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Maintenance scheduled</span>
                    <span className="text-xs text-muted-foreground">
                      1 hour ago
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Schools Tab */}
        <TabsContent value="schools" className="space-y-6">
          <SchoolsManagementModule />
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="text-center p-8">
            <h3 className="text-lg font-semibold mb-2">Users Management</h3>
            <p className="text-muted-foreground">
              User management module coming soon.
            </p>
          </div>
        </TabsContent>

        {/* Admin Users Tab */}
        <TabsContent value="admin-users" className="space-y-6">
          {adminUser?.role === "super_admin" ? (
            <AdminUserManagementPage />
          ) : null}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsModule />
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

        {/* Audit Logs Tab */}
        <TabsContent value="audit-logs" className="space-y-6">
          <DetailedAuditLogsPage />
        </TabsContent>

        {/* System Health Tab */}
        <TabsContent value="system-health" className="space-y-6">
          <SystemHealthStatusPage />
        </TabsContent>

        {/* Feature Flags Tab */}
        <TabsContent value="feature-flags" className="space-y-6">
          <FeatureFlagManagementPage />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showUserManagement && (
        <UserManagementModal
          isOpen={showUserManagement}
          onClose={() => setShowUserManagement(false)}
          onSuccess={handleModalSuccess}
          currentUser={adminUser}
        />
      )}

      {showMaintenanceMode && (
        <MaintenanceModeModal
          isOpen={showMaintenanceMode}
          onClose={() => setShowMaintenanceMode(false)}
          onSuccess={handleModalSuccess}
          currentUser={adminUser}
        />
      )}

      {showDatabaseSettings && (
        <DatabaseSettingsModal
          isOpen={showDatabaseSettings}
          onClose={() => setShowDatabaseSettings(false)}
          onSuccess={handleModalSuccess}
          currentUser={adminUser}
        />
      )}

      {showSecuritySettings && (
        <SecuritySettingsModal
          isOpen={showSecuritySettings}
          onClose={() => setShowSecuritySettings(false)}
          onSuccess={handleModalSuccess}
          currentUser={adminUser}
        />
      )}

      {showNotificationSettings && (
        <NotificationSettingsModal
          isOpen={showNotificationSettings}
          onClose={() => setShowNotificationSettings(false)}
          onSuccess={handleModalSuccess}
          currentUser={adminUser}
        />
      )}

      {showCompanyDetails && (
        <CompanyDetailsModal
          isOpen={showCompanyDetails}
          onClose={() => setShowCompanyDetails(false)}
          onSuccess={handleModalSuccess}
          currentUser={adminUser}
        />
      )}
    </div>
  );
};

export default EduFamAdminDashboard;
