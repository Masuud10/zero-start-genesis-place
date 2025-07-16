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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  UserCheck,
  UserX,
} from "lucide-react";
import { AuthUser } from "@/types/auth";
import { SupportStaff, SUPPORT_STAFF_ROLES, EMPLOYMENT_TYPES } from "@/types/supportStaff";
import { EditStaffDialog } from "@/components/hr/EditStaffDialog";

interface HRStaffManagementProps {
  user: AuthUser;
  mode?: 'staff' | 'payroll' | 'attendance' | 'users';
}

const HRStaffManagement: React.FC<HRStaffManagementProps> = ({ user, mode = 'staff' }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedStaff, setSelectedStaff] = useState<SupportStaff | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Fetch support staff data
  const {
    data: supportStaff,
    isLoading,
    refetch,
  } = useQuery<SupportStaff[]>({
    queryKey: ["support-staff-management", user.school_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_staff")
        .select("*")
        .eq("school_id", user.school_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((staff) => ({
        ...staff,
        role_title: staff.role_title as import("@/types/supportStaff").SupportStaffRole,
      })) as SupportStaff[];
    },
    enabled: !!user.school_id,
  });

  // Filter staff based on search and filters
  const filteredStaff = supportStaff?.filter((staff) => {
    const matchesSearch = staff.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || staff.role_title === roleFilter;
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && staff.is_active) ||
                         (statusFilter === "inactive" && !staff.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

  const handleEditStaff = (staff: SupportStaff) => {
    setSelectedStaff(staff);
    setEditDialogOpen(true);
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-800 hover:bg-green-200"
      : "bg-gray-100 text-gray-800 hover:bg-gray-200";
  };

  const getEmploymentTypeBadge = (type: string) => {
    const colors = {
      permanent: "bg-blue-100 text-blue-800",
      contract: "bg-orange-100 text-orange-800", 
      temporary: "bg-purple-100 text-purple-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getPageTitle = () => {
    switch (mode) {
      case 'payroll': return 'Payroll Management';
      case 'attendance': return 'Attendance Monitoring';
      case 'users': return 'User Management';
      default: return 'Staff Management';
    }
  };

  const getPageDescription = () => {
    switch (mode) {
      case 'payroll': return 'Manage staff salaries and compensation';
      case 'attendance': return 'Monitor and track staff attendance patterns';
      case 'users': return 'Manage system users and permissions';
      default: return 'Manage and monitor all support staff members';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading {getPageTitle().toLowerCase()}...</p>
        </div>
      </div>
    );
  }

  // Payroll Mode - Show salary-focused view
  if (mode === 'payroll') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{getPageTitle()}</h2>
            <p className="text-muted-foreground">{getPageDescription()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredStaff.filter(staff => staff.salary_amount).map((staff) => (
            <Card key={staff.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {staff.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-lg">{staff.full_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {staff.role_title} • {staff.employee_id}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {staff.employment_type} Employee
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-2xl text-primary">
                      {staff.salary_currency} {staff.salary_amount?.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Monthly Salary
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStaff.filter(staff => staff.salary_amount).length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No payroll data available
            </h3>
            <p className="text-muted-foreground">
              Staff members need salary information to appear in payroll management.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Attendance Mode - Show attendance tracking placeholder
  if (mode === 'attendance') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{getPageTitle()}</h2>
            <p className="text-muted-foreground">{getPageDescription()}</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <UserCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-muted-foreground mb-2">
              Attendance Monitoring Coming Soon
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Staff attendance tracking integration is in development. This will sync with the main attendance system for comprehensive monitoring.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Users Mode - Show user management placeholder
  if (mode === 'users') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{getPageTitle()}</h2>
            <p className="text-muted-foreground">{getPageDescription()}</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-muted-foreground mb-2">
              User Management Enhancement
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Advanced user management features are being developed. This will include role management, permissions, and user activity monitoring.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{getPageTitle()}</h2>
          <p className="text-muted-foreground">{getPageDescription()}</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Staff
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {SUPPORT_STAFF_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Staff Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">{supportStaff?.length || 0}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {supportStaff?.filter(s => s.is_active).length || 0}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold text-red-600">
                  {supportStaff?.filter(s => !s.is_active).length || 0}
                </p>
              </div>
              <UserX className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Filtered</p>
                <p className="text-2xl font-bold">{filteredStaff.length}</p>
              </div>
              <Filter className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff List */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Directory</CardTitle>
          <CardDescription>
            Complete list of support staff with detailed information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStaff.length > 0 ? (
            <div className="space-y-4">
              {filteredStaff.map((staff) => (
                <div
                  key={staff.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {staff.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium">{staff.full_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {staff.role_title} • {staff.employee_id}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-muted-foreground">
                          {staff.email} • {staff.phone}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getEmploymentTypeBadge(staff.employment_type)}>
                          {staff.employment_type}
                        </Badge>
                        {staff.department && (
                          <Badge variant="outline">{staff.department}</Badge>
                        )}
                        {staff.salary_amount && (
                          <Badge variant="outline">
                            {staff.salary_currency} {staff.salary_amount.toLocaleString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusBadge(staff.is_active || false)}>
                      {staff.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditStaff(staff)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No staff found</h3>
              <p className="text-muted-foreground">
                {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "No support staff records available"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Staff Dialog */}
      {selectedStaff && (
        <EditStaffDialog
          staff={selectedStaff}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onStaffUpdated={() => {
            refetch();
            setEditDialogOpen(false);
            setSelectedStaff(null);
          }}
        />
      )}
    </div>
  );
};

export default HRStaffManagement;