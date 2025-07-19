import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Building2,
  Mail,
  Shield,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CreateSchoolUserDialog from "@/components/dashboard/modals/CreateSchoolUserDialog";

interface SchoolUser {
  id: string;
  name: string;
  email: string;
  role: string;
  school_id: string;
  school_name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
}

const SchoolUserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<SchoolUser[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total_users: 0,
    active_users: 0,
    inactive_users: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchSchools();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the new database function to fetch school users data
      const { data, error } = await supabase.rpc('get_school_users_data', { 
        target_school_id: schoolFilter === "all" ? null : schoolFilter 
      });

      if (error) {
        throw error;
      }

      if (data) {
        setUsers(data as SchoolUser[]);
        // Calculate stats from the data
        const activeUsers = data.filter((user: any) => user.status === 'active').length;
        const inactiveUsers = data.filter((user: any) => user.status === 'inactive').length;
        setStats({
          total_users: data.length,
          active_users: activeUsers,
          inactive_users: inactiveUsers,
        });
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const { data, error } = await supabase
        .from("schools")
        .select("id, name")
        .eq("status", "active")
        .order("name");

      if (error) {
        throw error;
      }

      setSchools(data || []);
    } catch (err) {
      console.error("Error fetching schools:", err);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      setUpdatingStatus(userId);
      const isActive = currentStatus === "inactive";

      const { data, error } = await supabase.rpc("admin_update_user_status", {
        target_user_id: userId,
        new_status: isActive ? "active" : "inactive",
      });

      if (error) {
        throw error;
      }

      // The function returns a text message, not an object
      const newStatus = isActive ? "active" : "inactive";
      
      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );

      // Update stats
      setStats((prev) => {
        if (newStatus === "active") {
          return {
            ...prev,
            active_users: prev.active_users + 1,
            inactive_users: prev.inactive_users - 1,
          };
        } else {
          return {
            ...prev,
            active_users: prev.active_users - 1,
            inactive_users: prev.inactive_users + 1,
          };
        }
      });
    } catch (err) {
      console.error("Error toggling user status:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update user status"
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleUserCreated = (userData: {
    success: boolean;
    user_id: string;
    message: string;
  }) => {
    // Refresh the user list
    fetchUsers();
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesSchool =
      schoolFilter === "all" || user.school_id === schoolFilter;

    return matchesSearch && matchesStatus && matchesRole && matchesSchool;
  });

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const getStatusIcon = (status: string) => {
    return status === "active" ? (
      <CheckCircle className="h-4 w-4" />
    ) : (
      <AlertCircle className="h-4 w-4" />
    );
  };

  const getRoleColor = (role: string) => {
    const colors = {
      principal: "bg-purple-100 text-purple-800",
      teacher: "bg-blue-100 text-blue-800",
      admin: "bg-orange-100 text-orange-800",
      accountant: "bg-green-100 text-green-800",
      librarian: "bg-indigo-100 text-indigo-800",
      parent: "bg-pink-100 text-pink-800",
      student: "bg-gray-100 text-gray-800",
    };
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">School User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts for all schools
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_users}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active_users}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inactive Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.inactive_users}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="role-filter">Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger id="role-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="principal">Principal</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">School Admin</SelectItem>
                  <SelectItem value="accountant">Accountant</SelectItem>
                  <SelectItem value="librarian">Librarian</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="school-filter">School</Label>
              <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                <SelectTrigger id="school-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schools</SelectItem>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>School Users</CardTitle>
          <CardDescription>
            A list of all school users with their details and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{user.school_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(user.status)}>
                      {getStatusIcon(user.status)}
                      <span className="ml-1 capitalize">{user.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <Label
                          htmlFor={`status-${user.id}`}
                          className="text-sm"
                        >
                          {user.status === "active" ? "Active" : "Inactive"}
                        </Label>
                        <Switch
                          id={`status-${user.id}`}
                          checked={user.status === "active"}
                          onCheckedChange={() =>
                            toggleUserStatus(user.id, user.status)
                          }
                          disabled={updatingStatus === user.id}
                        />
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ||
                statusFilter !== "all" ||
                roleFilter !== "all" ||
                schoolFilter !== "all"
                  ? "Try adjusting your filters or search terms."
                  : "Get started by creating your first user."}
              </p>
              {!searchTerm &&
                statusFilter === "all" &&
                roleFilter === "all" &&
                schoolFilter === "all" && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First User
                  </Button>
                )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <CreateSchoolUserDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onUserCreated={() => fetchUsers()}
      />
    </div>
  );
};

export default SchoolUserManagementPage;
