import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useConsolidatedAuth } from "@/hooks/useConsolidatedAuth";
import { useNavigation } from "@/contexts/NavigationContext";
import {
  Building2,
  Users,
  TrendingUp,
  Settings,
  Database,
  Shield,
  User,
  Calendar,
  BarChart3,
  FileText,
  Headphones,
  DollarSign,
  Activity,
  Megaphone,
  UserCheck,
  FolderKanban,
  ToggleLeft,
  Crown,
  Target,
  Users2,
  Plane,
  Heart,
  Code,
  FileCode,
  GitBranch,
  LogOut,
  Receipt,
} from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  roles: string[];
}

const DynamicSidebar = () => {
  const { user, signOut } = useConsolidatedAuth();
  const { setCurrentPage } = useNavigation();
  
  // Define menu items for each role
  const menuItems: MenuItem[] = [
    // Super Admin Menu Items
    {
      id: "overview",
      label: "Dashboard Overview",
      icon: BarChart3,
      description: "Platform overview and KPIs",
      roles: ["super_admin"],
    },
    {
      id: "admin_users",
      label: "Admin User Management",
      icon: UserCheck,
      description: "Manage admin users",
      roles: ["super_admin"],
    },
    {
      id: "school_users",
      label: "School User Management",
      icon: Users,
      description: "Manage school users",
      roles: ["super_admin"],
    },
    {
      id: "schools_management",
      label: "Schools Management",
      icon: Building2,
      description: "Register and manage schools",
      roles: ["super_admin"],
    },
    {
      id: "maintenance_mode",
      label: "Maintenance Mode",
      icon: Settings,
      description: "System maintenance controls",
      roles: ["super_admin"],
    },
    {
      id: "database_settings",
      label: "Database Settings",
      icon: Database,
      description: "Database configuration",
      roles: ["super_admin"],
    },
    {
      id: "security_settings",
      label: "Security Settings",
      icon: Shield,
      description: "Security configuration",
      roles: ["super_admin"],
    },
    {
      id: "notification_settings",
      label: "Notification Settings",
      icon: Megaphone,
      description: "Notification preferences",
      roles: ["super_admin"],
    },
    {
      id: "company_details",
      label: "Company Details",
      icon: Building2,
      description: "Company information",
      roles: ["super_admin"],
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: TrendingUp,
      description: "Business intelligence",
      roles: ["super_admin"],
    },
    {
      id: "system_health",
      label: "System Health",
      icon: Activity,
      description: "System monitoring",
      roles: ["super_admin"],
    },

    // Support HR Menu Items
    {
      id: "client-relations",
      label: "Client Relations",
      icon: Headphones,
      description: "Support tickets and client management",
      roles: ["support_hr"],
    },
    {
      id: "internal-hr",
      label: "Internal HR",
      icon: Users2,
      description: "Staff directory and HR management",
      roles: ["support_hr"],
    },
    {
      id: "onboarding",
      label: "Client Onboarding",
      icon: UserCheck,
      description: "New client onboarding process",
      roles: ["support_hr"],
    },
    {
      id: "health-monitoring",
      label: "Health Monitoring",
      icon: Heart,
      description: "School health score monitoring",
      roles: ["support_hr"],
    },

    // Software Engineer Menu Items
    {
      id: "system-health",
      label: "System Health",
      icon: Activity,
      description: "Real-time system monitoring",
      roles: ["software_engineer"],
    },
    {
      id: "database",
      label: "Database Inspector",
      icon: Database,
      description: "Database performance and queries",
      roles: ["software_engineer"],
    },
    {
      id: "logs",
      label: "API & Error Logs",
      icon: FileCode,
      description: "Application logs and error tracking",
      roles: ["software_engineer"],
    },
    {
      id: "deployments",
      label: "CI/CD Pipeline",
      icon: GitBranch,
      description: "Build and deployment management",
      roles: ["software_engineer"],
    },
    {
      id: "feature-flags",
      label: "Feature Flags",
      icon: ToggleLeft,
      description: "Feature flag management",
      roles: ["software_engineer"],
    },

    // Sales Marketing Menu Items
    {
      id: "crm",
      label: "Sales CRM",
      icon: FolderKanban,
      description: "Customer relationship management",
      roles: ["sales_marketing"],
    },
    {
      id: "campaigns",
      label: "Marketing Campaigns",
      icon: Megaphone,
      description: "Email and social campaigns",
      roles: ["sales_marketing"],
    },
    {
      id: "leads",
      label: "Lead Management",
      icon: Target,
      description: "Lead scoring and automation",
      roles: ["sales_marketing"],
    },
    {
      id: "content",
      label: "Content Management",
      icon: FileText,
      description: "Blog posts and content",
      roles: ["sales_marketing"],
    },
    {
      id: "events",
      label: "School Events",
      icon: Calendar,
      description: "Event planning and management",
      roles: ["sales_marketing"],
    },
    {
      id: "academic-trips",
      label: "Academic Trips",
      icon: Plane,
      description: "Educational travel packages",
      roles: ["sales_marketing"],
    },

    // Finance Menu Items
    {
      id: "overview",
      label: "Financial Overview",
      icon: BarChart3,
      description: "KPI dashboard and metrics",
      roles: ["finance"],
    },
    {
      id: "revenue",
      label: "Revenue Management",
      icon: TrendingUp,
      description: "Revenue tracking and analysis",
      roles: ["finance"],
    },
    {
      id: "expenses",
      label: "Expense Management",
      icon: Receipt,
      description: "Company expense tracking",
      roles: ["finance"],
    },
    {
      id: "budgeting",
      label: "Budgeting & Forecasting",
      icon: Target,
      description: "Budget allocation and forecasting",
      roles: ["finance"],
    },
    {
      id: "reports",
      label: "Financial Reports",
      icon: FileText,
      description: "Generate financial reports",
      roles: ["finance"],
    },
  ];

  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role || "")
  );

  const getRoleIcon = () => {
    switch (user?.role) {
      case "super_admin":
        return <Crown className="h-5 w-5 text-yellow-600" />;
      case "support_hr":
        return <Headphones className="h-5 w-5 text-blue-600" />;
      case "software_engineer":
        return <Code className="h-5 w-5 text-purple-600" />;
      case "sales_marketing":
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case "finance":
        return <DollarSign className="h-5 w-5 text-green-600" />;
      default:
        return <User className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case "super_admin":
        return "Super Admin";
      case "support_hr":
        return "Support & HR";
      case "software_engineer":
        return "Software Engineer";
      case "sales_marketing":
        return "Sales & Marketing";
      case "finance":
        return "Finance";
      default:
        return "User";
    }
  };

  return (
    <div className="w-64 bg-white shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">EF</span>
          </div>
          <div>
            <h1 className="font-semibold text-sm">EduFam Admin</h1>
            <p className="text-xs text-muted-foreground">Internal Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-1">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant="ghost"
                className="w-full justify-start h-10 text-sm"
                title={item.description}
                onClick={() => setCurrentPage(item.label)}
              >
                <Icon className="h-4 w-4 mr-3" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default DynamicSidebar;
