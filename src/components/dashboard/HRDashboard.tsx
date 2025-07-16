import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserPlus,
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  BarChart3,
  DollarSign,
  FileText,
} from "lucide-react";
import { AuthUser } from "@/types/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EditStaffDialog } from "@/components/hr/EditStaffDialog";
import { SupportStaff } from "@/types/supportStaff";
import HRAnalyticsOverview from "@/components/hr/HRAnalyticsOverview";

interface HRDashboardProps {
  user: AuthUser;
}

const HRDashboard: React.FC<HRDashboardProps> = ({ user }) => {
  const [selectedStaff, setSelectedStaff] = useState<SupportStaff | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Fetch support staff data
  const {
    data: supportStaff,
    isLoading: isLoadingStaff,
    refetch: refetchStaff,
  } = useQuery<SupportStaff[]>({
    queryKey: ["support-staff", user.school_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_staff")
        .select(
          "id, school_id, employee_id, full_name, role_title, department, profile_photo_url, salary_amount, salary_currency, employment_type, phone, email, address, date_of_hire, supervisor_id, notes, is_active, created_at, updated_at, created_by"
        )
        .eq("school_id", user.school_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      // Map role_title to SupportStaffRole
      return (data || []).map((staff) => ({
        ...staff,
        role_title:
          staff.role_title as import("@/types/supportStaff").SupportStaffRole,
      })) as SupportStaff[];
    },
    enabled: !!user.school_id,
  });

  // Fetch school users for HR management
  const { data: schoolUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["school-users", user.school_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("school_id", user.school_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user.school_id,
  });

  // Calculate HR metrics
  const totalStaff = supportStaff?.length || 0;
  const activeStaff =
    supportStaff?.filter((staff) => staff.is_active === true).length || 0;
  const totalUsers = schoolUsers?.length || 0;
  const activeUsers =
    schoolUsers?.filter((user) => user.status === "active").length || 0;

  const handleEditStaff = (staff: SupportStaff) => {
    setSelectedStaff(staff);
    setEditDialogOpen(true);
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? "Active" : "Inactive";
  };

  if (isLoadingStaff || isLoadingUsers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading HR dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 p-8">
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
                HR Dashboard
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Welcome to your Human Resources command center. Monitor staff performance, manage payroll, and gain insights into your workforce.
              </p>
            </div>
            <div className="hidden md:flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
              <Users className="w-10 h-10 text-primary" />
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-full -translate-y-4 translate-x-4"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/20 to-transparent rounded-full translate-y-4 -translate-x-4"></div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Total Staff</CardTitle>
            <div className="p-2 bg-emerald-200 dark:bg-emerald-800 rounded-lg">
              <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{totalStaff}</div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              Support staff members
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Active Staff</CardTitle>
            <div className="p-2 bg-blue-200 dark:bg-blue-800 rounded-lg">
              <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{activeStaff}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Currently working</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">System Users</CardTitle>
            <div className="p-2 bg-purple-200 dark:bg-purple-800 rounded-lg">
              <UserPlus className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{totalUsers}</div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Total school users</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Active Users</CardTitle>
            <div className="p-2 bg-orange-200 dark:bg-orange-800 rounded-lg">
              <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">{activeUsers}</div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Currently active</p>
          </CardContent>
        </Card>
      </div>

      {/* HR Analytics Overview */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            HR Analytics Overview
          </CardTitle>
          <CardDescription className="text-base">
            Comprehensive analytics and insights for human resources management
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <HRAnalyticsOverview user={user} />
        </CardContent>
      </Card>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-lg">Staff Management</CardTitle>
            <CardDescription>
              Manage all HR staff with full CRUD capabilities
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <DollarSign className="w-8 h-8 text-accent" />
            </div>
            <CardTitle className="text-lg">Payroll Management</CardTitle>
            <CardDescription>
              Track salaries and manage compensation
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-lg">HR Reports</CardTitle>
            <CardDescription>
              Generate professional HR reports and analytics
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent HR Activity
          </CardTitle>
          <CardDescription>
            Latest updates and activities in human resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Staff records updated</p>
                <p className="text-xs text-muted-foreground">System sync completed successfully</p>
              </div>
              <span className="text-xs text-muted-foreground">2 hours ago</span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Payroll calculations ready</p>
                <p className="text-xs text-muted-foreground">Monthly payroll is ready for review</p>
              </div>
              <span className="text-xs text-muted-foreground">1 day ago</span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">HR report generated</p>
                <p className="text-xs text-muted-foreground">Staff directory report created</p>
              </div>
              <span className="text-xs text-muted-foreground">3 days ago</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Staff Dialog */}
      {selectedStaff && (
        <EditStaffDialog
          staff={selectedStaff}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onStaffUpdated={() => {
            refetchStaff();
            setEditDialogOpen(false);
            setSelectedStaff(null);
          }}
        />
      )}
    </div>
  );
};

export default HRDashboard;
