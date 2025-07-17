import React, { useState } from "react";
import { useAdminAuthContext } from "@/components/auth/AdminAuthProvider";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Loader2,
  RefreshCw,
  Settings,
  Users,
  Building2,
  BarChart3,
  CreditCard,
  FileText,
  HeadphonesIcon,
} from "lucide-react";
import DashboardWrapper from "../DashboardWrapper";

// Import dashboard modules
import SchoolsModule from "@/components/modules/SchoolsModule";
import UsersModule from "@/components/modules/UsersModule";
// Analytics dashboard component removed as part of cleanup
import BillingModule from "@/components/modules/BillingModule";
import ReportsModule from "@/components/modules/ReportsModule";
import SupportModule from "@/components/modules/SupportModule";
import EduFamSystemSettings from "@/components/modules/settings/EduFamSystemSettings";

interface EduFamAdminDashboardProps {
  onModalOpen?: (modalType: string) => void;
}

const EduFamAdminDashboard = ({ onModalOpen }: EduFamAdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { adminUser } = useAdminAuthContext();
  const { isReady, userRole } = useSchoolScopedData();
  const { toast } = useToast();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Force a page refresh to reload all data
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleModalOpen = (modalType: string) => {
    console.log("EduFamAdminDashboard: Opening modal:", modalType);
    if (onModalOpen) {
      onModalOpen(modalType);
    }
  };

  return (
    <DashboardWrapper
      requiredRole={["super_admin"]}
      title="EduFam Administration"
    >
      <div className="space-y-6">
        {/* Header with quick actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              EduFam Administration
            </h2>
            <p className="text-gray-600 mt-1">
              Manage schools, users, analytics, and system settings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              Super Admin
            </Badge>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Main dashboard content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schools">Schools</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Schools
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Loading...</div>
                  <p className="text-xs text-muted-foreground">
                    Active schools in the system
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Loading...</div>
                  <p className="text-xs text-muted-foreground">
                    Registered users across all schools
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Monthly Revenue
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Loading...</div>
                  <p className="text-xs text-muted-foreground">
                    Revenue from subscriptions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    System Health
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">99.9%</div>
                  <p className="text-xs text-muted-foreground">
                    System uptime and performance
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    onClick={() => setActiveTab("schools")}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <Building2 className="h-6 w-6 mb-2" />
                    <span className="text-sm">Manage Schools</span>
                  </Button>
                  <Button
                    onClick={() => setActiveTab("users")}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <Users className="h-6 w-6 mb-2" />
                    <span className="text-sm">Manage Users</span>
                  </Button>
                  <Button
                    onClick={() => setActiveTab("analytics")}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <BarChart3 className="h-6 w-6 mb-2" />
                    <span className="text-sm">View Analytics</span>
                  </Button>
                  <Button
                    onClick={() => setActiveTab("billing")}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <CreditCard className="h-6 w-6 mb-2" />
                    <span className="text-sm">Billing</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
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
            <div className="p-6 text-center text-muted-foreground">Analytics dashboard coming soon</div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <BillingModule />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <ReportsModule />
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <SupportModule />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <EduFamSystemSettings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardWrapper>
  );
};

export default EduFamAdminDashboard;
