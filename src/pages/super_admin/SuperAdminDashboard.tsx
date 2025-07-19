import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Crown,
  Activity,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
  Shield,
  Settings,
  Plus,
  Database,
  UserCheck,
  Zap,
} from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import { useUIEnhancement } from "@/contexts/UIEnhancementContext";
import {
  EnhancedCard,
  StatCard,
  MetricCard,
  ProgressCard,
} from "@/components/ui/EnhancedCard";
import { LineChart, BarChart, PieChart } from "@/components/ui/BeautifulCharts";
// Import modals
import NotificationSettingsModal from "@/components/dashboard/modals/NotificationSettingsModal";
import CompanyDetailsModal from "@/components/dashboard/modals/CompanyDetailsModal";

const SuperAdminDashboard = () => {
  const { kpiData, loadingKPIs, errorKPIs, refreshKPIs } = useDashboard();
  const { getRoleColors, getLoadingAnimation } = useUIEnhancement();
  const [activeTab, setActiveTab] = useState("overview");
  // Modal states
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showMaintenanceMode, setShowMaintenanceMode] = useState(false);
  const [showDatabaseSettings, setShowDatabaseSettings] = useState(false);
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] =
    useState(false);
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);

  const roleColors = getRoleColors("super_admin");

  if (loadingKPIs) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {getLoadingAnimation()}
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }
  if (errorKPIs) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            Error loading dashboard: {errorKPIs}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with Greeting */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Crown className="h-6 w-6 text-yellow-600" />
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    Super Admin Dashboard
                  </h1>
                  <p className="text-muted-foreground">
                    Welcome back, Super Admin
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
        <StatCard
          title="Total Schools"
          value={kpiData?.schools.total || 0}
          subtitle={`${kpiData?.schools.active || 0} active`}
          icon={<Building2 className="h-5 w-5" />}
          role="super_admin"
          variant="gradient"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${(kpiData?.revenue.mrr || 0).toLocaleString()}`}
          subtitle="MRR"
          icon={<DollarSign className="h-5 w-5" />}
          trend={{
            value: kpiData?.revenue.mrrGrowth || 0,
            isPositive: (kpiData?.revenue.mrrGrowth || 0) >= 0,
          }}
          role="super_admin"
          variant="gradient"
        />
        <StatCard
          title="Total Users"
          value={kpiData?.users.total || 0}
          subtitle={`${kpiData?.users.students || 0} students`}
          icon={<Users className="h-5 w-5" />}
          role="super_admin"
          variant="gradient"
        />
        <StatCard
          title="Churn Rate"
          value={`${((kpiData?.revenue.churnRate || 0) * 100).toFixed(1)}%`}
          subtitle="Monthly churn"
          icon={<TrendingDown className="h-5 w-5" />}
          trend={{
            value: -(kpiData?.revenue.churnRate || 0) * 100,
            isPositive: false,
          }}
          role="super_admin"
          variant="gradient"
        />
      </div>

      {/* Quick Actions */}
      <EnhancedCard variant="glass" animation="fade" className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            <span className="font-semibold">Quick Actions</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center space-y-2"
            onClick={() => setShowUserManagement(true)}
          >
            <Plus className="h-6 w-6" />
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
      </EnhancedCard>

      {/* Main Dashboard Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-8 h-12">
          <TabsTrigger
            value="overview"
            className="flex items-center gap-2 text-sm"
          >
            <TrendingUp className="h-4 w-4" />
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
            value="security"
            className="flex items-center gap-2 text-sm"
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EnhancedCard variant="elevated" animation="fade" className="p-6">
              <h3 className="font-semibold mb-2 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Platform KPIs
              </h3>
              <LineChart
                data={[
                  { label: "Jan", value: 10000 },
                  { label: "Feb", value: 12000 },
                  { label: "Mar", value: 15000 },
                  { label: "Apr", value: 17000 },
                  { label: "May", value: 20000 },
                  { label: "Jun", value: 22000 },
                ]}
                title="MRR Growth"
                subtitle="Monthly Recurring Revenue"
                height={180}
              />
            </EnhancedCard>
            <EnhancedCard variant="elevated" animation="fade" className="p-6">
              <h3 className="font-semibold mb-2 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {kpiData?.activity.recentLogs?.slice(0, 5).map((log, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">{log.action}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {(!kpiData?.activity.recentLogs ||
                  kpiData.activity.recentLogs.length === 0) && (
                  <div className="text-center text-muted-foreground">
                    No recent activity
                  </div>
                )}
              </div>
            </EnhancedCard>
          </div>
        </TabsContent>

        {/* Schools Tab */}
        <TabsContent value="schools" className="space-y-6">
          <EnhancedCard variant="elevated" animation="slide" className="p-6">
            <h3 className="font-semibold mb-2 flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Schools Management
            </h3>
            {/* TODO: Integrate real schools management table here */}
            <div className="text-muted-foreground">
              Schools management module coming soon.
            </div>
          </EnhancedCard>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <EnhancedCard variant="elevated" animation="slide" className="p-6">
            <h3 className="font-semibold mb-2 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              User Management
            </h3>
            {/* TODO: Integrate real user management table here */}
            <div className="text-muted-foreground">
              User management module coming soon.
            </div>
          </EnhancedCard>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <EnhancedCard variant="elevated" animation="fade" className="p-6">
            <h3 className="font-semibold mb-2 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Business Intelligence
            </h3>
            <BarChart
              data={[
                { label: "MRR", value: kpiData?.revenue.mrr || 0 },
                { label: "ARR", value: kpiData?.revenue.arr || 0 },
                {
                  label: "Customers",
                  value: kpiData?.revenue.customerCount || 0,
                },
                {
                  label: "Churn",
                  value: (kpiData?.revenue.churnRate || 0) * 100,
                },
              ]}
              title="Key SaaS Metrics"
              height={180}
            />
          </EnhancedCard>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <EnhancedCard variant="elevated" animation="fade" className="p-6">
            <h3 className="font-semibold mb-2 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Billing Management
            </h3>
            {/* TODO: Integrate real billing management module here */}
            <div className="text-muted-foreground">
              Billing management module coming soon.
            </div>
          </EnhancedCard>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <EnhancedCard variant="elevated" animation="fade" className="p-6">
            <h3 className="font-semibold mb-2 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security & Compliance
            </h3>
            {/* TODO: Integrate real security & compliance module here */}
            <div className="text-muted-foreground">
              Security & compliance module coming soon.
            </div>
          </EnhancedCard>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <EnhancedCard variant="elevated" animation="fade" className="p-6">
            <h3 className="font-semibold mb-2 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              System Health
            </h3>
            {/* TODO: Integrate real system health module here */}
            <div className="text-muted-foreground">
              System health module coming soon.
            </div>
          </EnhancedCard>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <EnhancedCard variant="elevated" animation="fade" className="p-6">
            <h3 className="font-semibold mb-2 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              System Settings
            </h3>
            {/* TODO: Integrate real system settings module here */}
            <div className="text-muted-foreground">
              System settings module coming soon.
            </div>
          </EnhancedCard>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showUserManagement && (
        <NotificationSettingsModal
          open={showUserManagement}
          onOpenChange={setShowUserManagement}
        />
      )}
      {showMaintenanceMode && (
        <NotificationSettingsModal
          open={showMaintenanceMode}
          onOpenChange={setShowMaintenanceMode}
        />
      )}
      {showDatabaseSettings && (
        <NotificationSettingsModal
          open={showDatabaseSettings}
          onOpenChange={setShowDatabaseSettings}
        />
      )}
      {showSecuritySettings && (
        <NotificationSettingsModal
          open={showSecuritySettings}
          onOpenChange={setShowSecuritySettings}
        />
      )}
      {showNotificationSettings && (
        <NotificationSettingsModal
          open={showNotificationSettings}
          onOpenChange={setShowNotificationSettings}
        />
      )}
      {showCompanyDetails && (
        <CompanyDetailsModal
          open={showCompanyDetails}
          onOpenChange={setShowCompanyDetails}
        />
      )}
      </div>
    </AdminLayout>
  );
};

export default SuperAdminDashboard;
