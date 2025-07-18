import React, { useState } from "react";
import { useAdminAuthContext } from "@/components/auth/AdminAuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminSidebarNavigation } from "@/components/sidebar/AdminSidebarNavigation";
import {
  Building2,
  Users,
  Settings,
  BarChart3,
  FileText,
  Headphones,
  DollarSign,
  Activity,
  LogOut,
  User,
  Crown,
  Menu,
  X,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { adminUser, signOut } = useAdminAuthContext();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await signOut();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "super_admin":
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case "edufam_admin":
        return <Building2 className="h-4 w-4 text-blue-600" />;
      case "support_hr":
        return <Headphones className="h-4 w-4" />;
      case "software_engineer":
        return <Activity className="h-4 w-4" />;
      case "sales_marketing":
        return <BarChart3 className="h-4 w-4" />;
      case "finance":
        return <DollarSign className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "edufam_admin":
        return "EduFam Admin";
      case "support_hr":
        return "Support & HR";
      case "software_engineer":
        return "Software Engineer";
      case "sales_marketing":
        return "Sales & Marketing";
      case "finance":
        return "Finance Officer";
      default:
        return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "super_admin":
        return "default";
      case "edufam_admin":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center">
              <img
                src="/lovable-uploads/b42612dd-99c7-4d0b-94d0-fcf611535608.png"
                alt="Edufam Logo"
                className="h-8 w-auto mr-2"
              />
              <span className="text-lg font-semibold text-gray-900">Admin</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Sidebar Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
            <AdminSidebarNavigation />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mr-4"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                {adminUser?.role === "super_admin" ||
                adminUser?.role === "edufam_admin"
                  ? "EduFam Admin Dashboard"
                  : `${getRoleLabel(adminUser?.role || "")} Dashboard`}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {adminUser && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  {getRoleIcon(adminUser.role)}
                  <span className="font-medium">
                    {getRoleLabel(adminUser.role)}
                  </span>
                  <span>•</span>
                  <span>{adminUser.name}</span>
                </div>
              )}
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
