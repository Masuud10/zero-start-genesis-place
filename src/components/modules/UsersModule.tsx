import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { AdminUserService } from "@/services/adminUserService";
import { useAdminUsersData } from "@/hooks/useAdminUsersData";
import UserStatsCards from "./users/UserStatsCards";
import CreateUserDialog from "./users/CreateUserDialog";
import UsersFilter from "./users/UsersFilter";
import UsersTable from "./users/UsersTable";
import { Button } from "@/components/ui/button";
import { UserPlus, RefreshCw, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface UsersModuleProps {
  onDataChanged?: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
  school_id?: string;
  phone?: string;
  school?: {
    name: string;
  };
}

const UsersModule: React.FC<UsersModuleProps> = ({ onDataChanged }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();
  const { isSystemAdmin, schoolId } = useSchoolScopedData();

  // Use the secure admin users data hook
  const {
    data: adminUsersData,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useAdminUsersData(refreshKey);

  // Transform admin users data to match User interface
  const users: User[] = adminUsersData
    ? adminUsersData.map((userData: any) => ({
        id: userData.id,
        name: userData.name || "",
        email: userData.email || "",
        role: userData.role || "",
        status: userData.status || "active",
        created_at: userData.created_at || "",
        updated_at: userData.updated_at || "",
        school_id: userData.school_id || undefined,
        phone: userData.phone || "",
        school: userData.school_name
          ? { name: userData.school_name }
          : undefined,
      }))
    : [];

  const error = queryError?.message || null;

  const fetchUsers = () => {
    setRefreshKey((prev) => prev + 1);
    refetch();
    if (onDataChanged) onDataChanged();
  };

  const filteredUsers = users.filter((userItem) => {
    const matchesSearch =
      userItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userItem.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || userItem.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || userItem.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Check if user can add users
  const canAddUsers =
    user &&
    (user.role === "elimisha_admin" ||
      user.role === "edufam_admin" ||
      user.role === "school_director" ||
      user.role === "principal");

  // Authentication check - show error if user is not logged in
  if (!user) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Authentication Required
          </CardTitle>
          <CardDescription>
            You must be logged in to access the user management module.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">
            Please log in as an EduFam administrator to continue.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Permission check - show error if user doesn't have access
  if (
    user &&
    ![
      "elimisha_admin",
      "edufam_admin",
      "school_director",
      "principal",
    ].includes(user.role)
  ) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Access Denied
          </CardTitle>
          <CardDescription>
            You don't have permission to access user management.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">
            Only school directors, principals, and system administrators can
            manage users.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Users Management
          </h2>
          <p className="text-muted-foreground">
            {isSystemAdmin
              ? "Manage all users across the Elimisha platform"
              : "Manage users in your school"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchUsers} disabled={loading}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          {canAddUsers && (
            <CreateUserDialog onUserCreated={fetchUsers}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </CreateUserDialog>
          )}
        </div>
      </div>

      <UserStatsCards users={users} />

      <UsersFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <UsersTable
        users={filteredUsers}
        loading={loading}
        error={error}
        onRetry={fetchUsers}
        onUserUpdated={fetchUsers}
      />
    </div>
  );
};

export default UsersModule;
