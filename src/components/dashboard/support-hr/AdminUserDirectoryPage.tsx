import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MessageSquare,
  Star,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Search,
  Filter,
  Download,
  RefreshCw,
  Activity,
  FileText,
  Link,
  MapPin,
  Shield,
  Key,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Settings,
  Briefcase,
  GraduationCap,
  CreditCard,
  Globe,
} from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role:
    | "super_admin"
    | "finance_officer"
    | "sales_marketing"
    | "software_engineer"
    | "support_hr";
  status: "active" | "inactive" | "suspended" | "pending";
  department: string;
  position: string;
  hire_date: string;
  last_login: string;
  created_at: string;
  permissions: string[];
  notes: string;
  avatar?: string;
  location: string;
  manager: string;
  direct_reports: number;
  performance_rating: number;
  salary_band: string;
  skills: string[];
  certifications: string[];
  emergency_contact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

const AdminUserDirectoryPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const { toast } = useToast();

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "support_hr" as const,
    status: "active" as const,
    department: "",
    position: "",
    hire_date: "",
    manager: "",
    location: "",
    salary_band: "",
    notes: "",
    emergency_contact: {
      name: "",
      phone: "",
      relationship: "",
    },
  });

  const roles = [
    {
      value: "super_admin",
      label: "Super Admin",
      icon: Shield,
      color: "text-red-600",
    },
    {
      value: "finance_officer",
      label: "Finance Officer",
      icon: CreditCard,
      color: "text-green-600",
    },
    {
      value: "sales_marketing",
      label: "Sales & Marketing",
      icon: Target,
      color: "text-blue-600",
    },
    {
      value: "software_engineer",
      label: "Software Engineer",
      icon: Code,
      color: "text-purple-600",
    },
    {
      value: "support_hr",
      label: "Support HR",
      icon: Users,
      color: "text-orange-600",
    },
  ];

  const departments = [
    "Executive",
    "Finance",
    "Sales & Marketing",
    "Engineering",
    "Human Resources",
    "Support",
    "Operations",
  ];

  const getRoleIcon = (role: string) => {
    const roleData = roles.find((r) => r.value === role);
    return roleData ? (
      <roleData.icon className={`h-4 w-4 ${roleData.color}`} />
    ) : (
      <User className="h-4 w-4" />
    );
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "super_admin":
        return "destructive" as const;
      case "finance_officer":
        return "default" as const;
      case "sales_marketing":
        return "secondary" as const;
      case "software_engineer":
        return "outline" as const;
      case "support_hr":
        return "outline" as const;
      default:
        return "outline" as const;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default" as const;
      case "inactive":
        return "secondary" as const;
      case "suspended":
        return "destructive" as const;
      case "pending":
        return "outline" as const;
      default:
        return "outline" as const;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case "inactive":
        return <UserX className="h-4 w-4 text-gray-600" />;
      case "suspended":
        return <Lock className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  // Mock data for demonstration
  useEffect(() => {
    const mockUsers: AdminUser[] = [
      {
        id: "1",
        name: "John Smith",
        email: "john.smith@edufam.com",
        phone: "+254-700-123-456",
        role: "super_admin",
        status: "active",
        department: "Executive",
        position: "Chief Executive Officer",
        hire_date: "2020-01-15",
        last_login: "2024-01-25T10:30:00Z",
        created_at: "2020-01-15",
        permissions: ["all"],
        notes: "Founder and CEO. Has full system access.",
        location: "Nairobi, Kenya",
        manager: "Board of Directors",
        direct_reports: 5,
        performance_rating: 4.8,
        salary_band: "Executive",
        skills: ["Leadership", "Strategy", "Business Development"],
        certifications: ["MBA", "PMP"],
        emergency_contact: {
          name: "Jane Smith",
          phone: "+254-700-123-457",
          relationship: "Spouse",
        },
      },
      {
        id: "2",
        name: "Sarah Johnson",
        email: "sarah.johnson@edufam.com",
        phone: "+254-700-234-567",
        role: "finance_officer",
        status: "active",
        department: "Finance",
        position: "Finance Director",
        hire_date: "2021-03-20",
        last_login: "2024-01-25T09:15:00Z",
        created_at: "2021-03-20",
        permissions: ["finance", "billing", "reports"],
        notes:
          "Experienced finance professional. Handles all financial operations.",
        location: "Nairobi, Kenya",
        manager: "John Smith",
        direct_reports: 2,
        performance_rating: 4.5,
        salary_band: "Senior Management",
        skills: ["Financial Management", "Accounting", "Budgeting"],
        certifications: ["CPA", "CFA"],
        emergency_contact: {
          name: "Mike Johnson",
          phone: "+254-700-234-568",
          relationship: "Spouse",
        },
      },
      {
        id: "3",
        name: "Michael Chen",
        email: "michael.chen@edufam.com",
        phone: "+254-700-345-678",
        role: "software_engineer",
        status: "active",
        department: "Engineering",
        position: "Senior Software Engineer",
        hire_date: "2022-06-10",
        last_login: "2024-01-25T11:45:00Z",
        created_at: "2022-06-10",
        permissions: ["development", "database", "api"],
        notes: "Full-stack developer. Expert in React and Node.js.",
        location: "Mombasa, Kenya",
        manager: "Tech Lead",
        direct_reports: 0,
        performance_rating: 4.7,
        salary_band: "Senior",
        skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
        certifications: ["AWS Certified Developer"],
        emergency_contact: {
          name: "Lisa Chen",
          phone: "+254-700-345-679",
          relationship: "Sister",
        },
      },
      {
        id: "4",
        name: "Emma Wilson",
        email: "emma.wilson@edufam.com",
        phone: "+254-700-456-789",
        role: "sales_marketing",
        status: "active",
        department: "Sales & Marketing",
        position: "Sales Manager",
        hire_date: "2021-08-15",
        last_login: "2024-01-25T08:30:00Z",
        created_at: "2021-08-15",
        permissions: ["sales", "marketing", "leads"],
        notes: "Experienced sales professional. Exceeds targets consistently.",
        location: "Kisumu, Kenya",
        manager: "Sales Director",
        direct_reports: 3,
        performance_rating: 4.6,
        salary_band: "Middle Management",
        skills: ["Sales", "CRM", "Marketing", "Negotiation"],
        certifications: ["Sales Certification"],
        emergency_contact: {
          name: "David Wilson",
          phone: "+254-700-456-790",
          relationship: "Husband",
        },
      },
      {
        id: "5",
        name: "Lisa Park",
        email: "lisa.park@edufam.com",
        phone: "+254-700-567-890",
        role: "support_hr",
        status: "active",
        department: "Human Resources",
        position: "HR Specialist",
        hire_date: "2022-01-10",
        last_login: "2024-01-25T10:00:00Z",
        created_at: "2022-01-10",
        permissions: ["hr", "users", "support"],
        notes: "HR professional with focus on employee relations and support.",
        location: "Nakuru, Kenya",
        manager: "HR Manager",
        direct_reports: 0,
        performance_rating: 4.4,
        salary_band: "Junior",
        skills: ["HR Management", "Employee Relations", "Recruitment"],
        certifications: ["HR Certification"],
        emergency_contact: {
          name: "James Park",
          phone: "+254-700-567-891",
          relationship: "Father",
        },
      },
    ];

    setUsers(mockUsers);
    setLoading(false);
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    const matchesDepartment =
      departmentFilter === "all" || user.department === departmentFilter;
    return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.status === "active").length;
  const superAdmins = users.filter(
    (user) => user.role === "super_admin"
  ).length;
  const averageRating =
    users.reduce((sum, user) => sum + user.performance_rating, 0) /
    users.length;

  const createUser = () => {
    const user: AdminUser = {
      id: Date.now().toString(),
      ...newUser,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      permissions: [],
      skills: [],
      certifications: [],
      direct_reports: 0,
      performance_rating: 0,
    };

    setUsers([...users, user]);
    setCreateDialogOpen(false);
    setNewUser({
      name: "",
      email: "",
      phone: "",
      role: "support_hr",
      status: "active",
      department: "",
      position: "",
      hire_date: "",
      manager: "",
      location: "",
      salary_band: "",
      notes: "",
      emergency_contact: {
        name: "",
        phone: "",
        relationship: "",
      },
    });
    toast({
      title: "Success",
      description: "User created successfully",
    });
  };

  const updateUserStatus = (id: string, status: AdminUser["status"]) => {
    setUsers(
      users.map((user) => (user.id === id ? { ...user, status } : user))
    );
    toast({
      title: "Status Updated",
      description: `User status changed to ${status}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Admin User Directory
          </h1>
          <p className="text-muted-foreground">
            Manage all admin users, roles, and permissions
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Add New Admin User</DialogTitle>
              <DialogDescription>
                Create a new admin user account
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone
                  </label>
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    value={newUser.phone}
                    onChange={(e) =>
                      setNewUser((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="role" className="text-sm font-medium">
                    Role
                  </label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value: any) =>
                      setNewUser((prev) => ({
                        ...prev,
                        role: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center gap-2">
                            <role.icon className={`h-4 w-4 ${role.color}`} />
                            {role.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="department" className="text-sm font-medium">
                    Department
                  </label>
                  <Select
                    value={newUser.department}
                    onValueChange={(value) =>
                      setNewUser((prev) => ({
                        ...prev,
                        department: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="position" className="text-sm font-medium">
                    Position
                  </label>
                  <Input
                    id="position"
                    placeholder="Enter job title"
                    value={newUser.position}
                    onChange={(e) =>
                      setNewUser((prev) => ({
                        ...prev,
                        position: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="hire_date" className="text-sm font-medium">
                    Hire Date
                  </label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={newUser.hire_date}
                    onChange={(e) =>
                      setNewUser((prev) => ({
                        ...prev,
                        hire_date: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="location" className="text-sm font-medium">
                    Location
                  </label>
                  <Input
                    id="location"
                    placeholder="Enter location"
                    value={newUser.location}
                    onChange={(e) =>
                      setNewUser((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label htmlFor="notes" className="text-sm font-medium">
                  Notes
                </label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this user..."
                  value={newUser.notes}
                  onChange={(e) =>
                    setNewUser((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={createUser}
                disabled={!newUser.name || !newUser.email}
              >
                Add User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">All admin users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalUsers > 0
                ? ((activeUsers / totalUsers) * 100).toFixed(1)
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{superAdmins}</div>
            <p className="text-xs text-muted-foreground">Full system access</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Performance
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {averageRating.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Out of 5.0 rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Users</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading users...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.position}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {roles.find((r) => r.value === user.role)?.label}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        {user.department}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(user.status)}
                        <Badge variant={getStatusBadgeVariant(user.status)}>
                          {user.status.charAt(0).toUpperCase() +
                            user.status.slice(1)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(user.last_login).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">
                          {user.performance_rating.toFixed(1)}
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(user.performance_rating)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user.status === "active" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateUserStatus(user.id, "suspended")
                            }
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                        )}
                        {user.status === "suspended" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateUserStatus(user.id, "active")}
                          >
                            <Unlock className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      {selectedUser && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[900px]">
            <DialogHeader>
              <DialogTitle>{selectedUser.name}</DialogTitle>
              <DialogDescription>
                User details, permissions, and performance
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="emergency">Emergency</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{selectedUser.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{selectedUser.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{selectedUser.location}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Employment Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Department:</span>{" "}
                        {selectedUser.department}
                      </div>
                      <div>
                        <span className="font-medium">Position:</span>{" "}
                        {selectedUser.position}
                      </div>
                      <div>
                        <span className="font-medium">Hire Date:</span>{" "}
                        {new Date(selectedUser.hire_date).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Manager:</span>{" "}
                        {selectedUser.manager}
                      </div>
                      <div>
                        <span className="font-medium">Direct Reports:</span>{" "}
                        {selectedUser.direct_reports}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="permissions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">User Permissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedUser.permissions.map((permission) => (
                        <Badge
                          key={permission}
                          variant="outline"
                          className="mr-2"
                        >
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Performance Rating
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {selectedUser.performance_rating.toFixed(1)}/5.0
                      </div>
                      <div className="flex items-center mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(selectedUser.performance_rating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Skills & Certifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <h5 className="font-medium text-sm">Skills:</h5>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedUser.skills.map((skill) => (
                              <Badge
                                key={skill}
                                variant="secondary"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm">
                            Certifications:
                          </h5>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedUser.certifications.map((cert) => (
                              <Badge
                                key={cert}
                                variant="outline"
                                className="text-xs"
                              >
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="emergency" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Emergency Contact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Name:</span>{" "}
                        {selectedUser.emergency_contact.name}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span>{" "}
                        {selectedUser.emergency_contact.phone}
                      </div>
                      <div>
                        <span className="font-medium">Relationship:</span>{" "}
                        {selectedUser.emergency_contact.relationship}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Close
              </Button>
              <Button>Edit User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminUserDirectoryPage;
