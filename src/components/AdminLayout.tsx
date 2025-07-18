import React from "react";
import { useAdminAuthContext } from "@/components/auth/AdminAuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { adminUser, signOut } = useAdminAuthContext();

  const handleLogout = async () => {
    await signOut();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "super_admin":
      case "edufam_admin":
        return <Building2 className="h-4 w-4" />;
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img
                src="/lovable-uploads/b42612dd-99c7-4d0b-94d0-fcf611535608.png"
                alt="Edufam Logo"
                className="h-8 w-auto mr-4"
              />
              <h1 className="text-xl font-semibold text-gray-900">
                Admin Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {adminUser && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  {getRoleIcon(adminUser.role)}
                  <span>{getRoleLabel(adminUser.role)}</span>
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
