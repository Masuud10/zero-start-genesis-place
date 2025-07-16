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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HR Dashboard</h1>
          <p className="text-muted-foreground">
            Manage staff, users, and human resources for your school
          </p>
        </div>
      </div>

      {/* HR Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStaff}</div>
            <p className="text-xs text-muted-foreground">
              Support staff members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStaff}</div>
            <p className="text-xs text-muted-foreground">Currently working</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Users</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Total school users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
      </div>

      {/* HR Analytics Overview */}
      <Card>
        <CardHeader>
          <CardTitle>HR Analytics Overview</CardTitle>
          <CardDescription>
            Comprehensive analytics and insights for human resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HRAnalyticsOverview user={user} />
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="staff" className="space-y-4">
        <TabsList>
          <TabsTrigger value="staff">Support Staff</TabsTrigger>
          <TabsTrigger value="users">System Users</TabsTrigger>
          <TabsTrigger value="reports">HR Reports</TabsTrigger>
          <TabsTrigger value="payroll">Salaries/Payroll</TabsTrigger>
          <TabsTrigger value="attendance">Attendance Monitoring</TabsTrigger>
          <TabsTrigger value="support">Support Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Support Staff Management</CardTitle>
              <CardDescription>
                Manage non-teaching staff members and their information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {supportStaff && supportStaff.length > 0 ? (
                <div className="space-y-4">
                  {supportStaff.map((staff) => (
                    <div
                      key={staff.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium">{staff.full_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {staff.role_title} • {staff.employee_id}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {staff.email} • {staff.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={getStatusBadge(staff.is_active || false)}
                        >
                          {getStatusText(staff.is_active || false)}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditStaff(staff)}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No support staff records found. Contact your administrator
                    to add staff members.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Users</CardTitle>
              <CardDescription>
                View and manage all system users in your school
              </CardDescription>
            </CardHeader>
            <CardContent>
              {schoolUsers && schoolUsers.length > 0 ? (
                <div className="space-y-4">
                  {schoolUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium">
                            {user.name || user.email}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {user.role} • {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={getStatusBadge(
                            (user.status || "active") === "active"
                          )}
                        >
                          {user.status || "active"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No system users found for your school.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>HR Reports</CardTitle>
              <CardDescription>
                Generate and view human resources reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Staff Directory</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Comprehensive list of all staff members
                    </p>
                    <Button variant="outline" className="w-full">
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">User Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      System usage and login statistics
                    </p>
                    <Button variant="outline" className="w-full">
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Management</CardTitle>
              <CardDescription>
                Manage staff salaries and compensation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {supportStaff && supportStaff.length > 0 ? (
                <div className="space-y-4">
                  {supportStaff
                    .filter(staff => staff.salary_amount)
                    .map((staff) => (
                      <div
                        key={staff.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div>
                            <h4 className="font-medium">{staff.full_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {staff.role_title} • {staff.employee_id}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {staff.salary_currency} {staff.salary_amount?.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {staff.employment_type}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No payroll information available. Add salary details to staff records.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Attendance Monitoring</CardTitle>
              <CardDescription>
                Monitor and track staff attendance patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Calendar className="h-4 w-4" />
                <AlertDescription>
                  Staff attendance tracking will be integrated with the main attendance system. Contact your system administrator for setup assistance.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>HR Support Tickets</CardTitle>
              <CardDescription>
                Submit and track HR-related support requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <HelpCircle className="h-4 w-4" />
                <AlertDescription>
                  HR support ticket system is available through the main Support section in the sidebar. Navigate to Support to create and manage tickets.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
