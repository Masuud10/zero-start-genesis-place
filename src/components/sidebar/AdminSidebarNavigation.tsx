import React from "react";
import { useAdminAuthContext } from "@/components/auth/AdminAuthProvider";
import { AdminRole } from "@/types/admin";
import { Button } from "@/components/ui/button";
import {
  Users,
  School,
  BarChart3,
  Headphones,
  Megaphone,
  DollarSign,
  Settings,
  Code,
  Database,
  FileText,
  Shield,
  Calendar,
  Mail,
  Activity,
  ActivitySquare,
  ToggleLeft,
  Search,
  Crown,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

interface AdminMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path: string;
  permission?: string;
  roles?: AdminRole[];
  description?: string;
}

const ADMIN_MENU_ITEMS: AdminMenuItem[] = [
  // Main Dashboard Items for Super Admin and EduFam Admin
  {
    id: "overview",
    label: "Overview",
    icon: BarChart3,
    path: "/dashboard?tab=overview",
    roles: ["super_admin", "edufam_admin"],
    description: "System overview and metrics",
  },
  {
    id: "schools",
    label: "Schools Management",
    icon: School,
    path: "/dashboard?tab=schools",
    roles: ["super_admin", "edufam_admin"],
    description: "Manage customer schools",
  },
  {
    id: "users",
    label: "Users Management",
    icon: Users,
    path: "/dashboard?tab=users",
    roles: ["super_admin", "edufam_admin"],
    description: "Manage school users and accounts",
  },
  {
    id: "admin-users",
    label: "Admin Users",
    icon: Crown,
    path: "/dashboard?tab=admin-users",
    roles: ["super_admin"],
    description: "Manage admin user accounts and roles",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    path: "/dashboard?tab=analytics",
    roles: ["super_admin", "edufam_admin"],
    description: "System and business analytics",
  },
  {
    id: "billing",
    label: "Billing",
    icon: DollarSign,
    path: "/dashboard?tab=billing",
    roles: ["super_admin", "edufam_admin"],
    description: "Billing and financial management",
  },
  {
    id: "support",
    label: "Support",
    icon: Headphones,
    path: "/dashboard?tab=support",
    roles: ["super_admin", "edufam_admin"],
    description: "Customer support management",
  },
  {
    id: "system",
    label: "System Health",
    icon: Activity,
    path: "/dashboard?tab=system",
    roles: ["super_admin", "edufam_admin"],
    description: "System management and monitoring",
  },
  {
    id: "audit-logs",
    label: "Audit Logs",
    icon: Search,
    path: "/dashboard?tab=audit-logs",
    roles: ["super_admin"],
    description: "Security audit logs and activity tracking",
  },
  {
    id: "system-health",
    label: "System Health",
    icon: ActivitySquare,
    path: "/dashboard?tab=system-health",
    roles: ["super_admin"],
    description: "Real-time health status monitoring",
  },
  {
    id: "feature-flags",
    label: "Feature Flags",
    icon: ToggleLeft,
    path: "/dashboard?tab=feature-flags",
    roles: ["super_admin"],
    description: "Feature management and toggles",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    path: "/dashboard?tab=settings",
    roles: ["super_admin", "edufam_admin"],
    description: "System settings and configuration",
  },

  // Role-specific dashboards
  {
    id: "support-hr-dashboard",
    label: "Support & HR Dashboard",
    icon: Headphones,
    path: "/support-hr",
    roles: ["support_hr"],
    description: "Support and HR management dashboard",
  },
  {
    id: "software-engineer-dashboard",
    label: "Software Engineer Dashboard",
    icon: Code,
    path: "/software-engineer",
    roles: ["software_engineer"],
    description: "Software engineering and development tools",
  },
  {
    id: "sales-marketing-dashboard",
    label: "Sales & Marketing Dashboard",
    icon: Megaphone,
    path: "/sales-marketing",
    roles: ["sales_marketing"],
    description: "Sales and marketing management",
  },
  {
    id: "finance-dashboard",
    label: "Finance Dashboard",
    icon: DollarSign,
    path: "/finance",
    roles: ["finance"],
    description: "Financial management and reporting",
  },
];

export const AdminSidebarNavigation: React.FC = () => {
  const { hasPermission, isRole, adminUser } = useAdminAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  const isMenuItemVisible = (item: AdminMenuItem): boolean => {
    // If no permission or role specified, item is visible to all
    if (!item.permission && !item.roles) return true;

    // Check role-based access
    if (item.roles && !isRole(item.roles)) return false;

    // Check permission-based access
    if (item.permission && !hasPermission(item.permission)) return false;

    return true;
  };

  const isActive = (path: string) => {
    if (path.includes("?tab=")) {
      const [basePath, tabParam] = path.split("?tab=");
      return (
        location.pathname === basePath &&
        location.search.includes(`tab=${tabParam}`)
      );
    }
    return location.pathname === path;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const visibleItems = ADMIN_MENU_ITEMS.filter(isMenuItemVisible);

  return (
    <div className="space-y-1">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);

        return (
          <Button
            key={item.id}
            variant={active ? "default" : "ghost"}
            className={`w-full justify-start h-10 ${
              active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
            onClick={() => handleNavigation(item.path)}
            title={item.description}
          >
            <Icon className="h-4 w-4 mr-3" />
            <span className="text-sm">{item.label}</span>
          </Button>
        );
      })}

      {/* Role indicator at bottom */}
      {adminUser && (
        <div className="mt-8 p-3 bg-muted/50 rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">
            Signed in as:
          </div>
          <div className="text-sm font-medium">{adminUser.name}</div>
          <div className="text-xs text-muted-foreground capitalize">
            {adminUser.role.replace("_", " ")}
          </div>
        </div>
      )}
    </div>
  );
};
