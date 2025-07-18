import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuthContext } from "@/components/auth/AdminAuthProvider";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Shield,
  Users,
  Search,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_ROLES = [
  { value: "super_admin", label: "Super Admin" },
  { value: "finance_officer", label: "Finance Officer" },
  { value: "sales_marketing", label: "Sales & Marketing" },
  { value: "software_engineer", label: "Software Engineer" },
  { value: "support_hr", label: "Support HR" },
];

const AdminUserManagementPage: React.FC = () => {
  const { adminUser } = useAdminAuthContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "support_hr",
    is_active: true,
  });

  useEffect(() => {
    if (adminUser?.role === "super_admin") fetchAdminUsers();
  }, [adminUser]);

  const fetchAdminUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setAdminUsers(data || []);
    }
    setLoading(false);
  };

  const handleOpenDialog = (user?: any) => {
    if (user) {
      setEditUser(user);
      setForm({
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
      });
    } else {
      setEditUser(null);
      setForm({ name: "", email: "", role: "support_hr", is_active: true });
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    setLoading(true);
    if (editUser) {
      // Update
      const { error } = await supabase
        .from("admin_users")
        .update({
          name: form.name,
          email: form.email,
          role: form.role,
          is_active: form.is_active,
        })
        .eq("id", editUser.id);
      if (error)
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      else toast({ title: "Success", description: "Admin user updated." });
    } else {
      // Create
      const { error } = await supabase.from("admin_users").insert({
        name: form.name,
        email: form.email,
        role: form.role,
        is_active: form.is_active,
        app_type: "admin",
        permissions: {},
      });
      if (error)
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      else toast({ title: "Success", description: "Admin user created." });
    }
    setShowDialog(false);
    fetchAdminUsers();
    setLoading(false);
  };

  const handleDelete = async (user: any) => {
    if (!window.confirm("Are you sure you want to delete this admin user?"))
      return;
    setLoading(true);
    const { error } = await supabase
      .from("admin_users")
      .delete()
      .eq("id", user.id);
    if (error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    else toast({ title: "Success", description: "Admin user deleted." });
    fetchAdminUsers();
    setLoading(false);
  };

  const filteredUsers = adminUsers.filter(
    (u) =>
      (roleFilter === "all" || u.role === roleFilter) &&
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()))
  );

  if (adminUser?.role !== "super_admin") {
    return (
      <div className="p-8 text-center text-red-600 font-bold">
        Access denied. Only Super Admins can manage admin users.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Admin User Management</h2>
        <Button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Admin User
        </Button>
      </div>
      <div className="flex gap-4 mb-4">
        <Input
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {ADMIN_ROLES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Admin Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Role</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="p-2 font-medium">{user.name}</td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2 capitalize">
                        {ADMIN_ROLES.find((r) => r.value === user.role)
                          ?.label || user.role}
                      </td>
                      <td className="p-2">
                        {user.is_active ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="destructive">Suspended</Badge>
                        )}
                      </td>
                      <td className="p-2 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDialog(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user.is_active ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              setLoading(true);
                              await supabase
                                .from("admin_users")
                                .update({ is_active: false })
                                .eq("id", user.id);
                              fetchAdminUsers();
                              setLoading(false);
                            }}
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              setLoading(true);
                              await supabase
                                .from("admin_users")
                                .update({ is_active: true })
                                .eq("id", user.id);
                              fetchAdminUsers();
                              setLoading(false);
                            }}
                          >
                            <Unlock className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editUser ? "Edit Admin User" : "Add Admin User"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <Input
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
            />
            <Select
              value={form.role}
              onValueChange={(role) => setForm((f) => ({ ...f, role }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ADMIN_ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editUser ? "Save Changes" : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUserManagementPage;
