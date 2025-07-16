import {
  BarChart3,
  BookOpen,
  Calendar,
  CreditCard,
  FileText,
  GraduationCap,
  HelpCircle,
  Home,
  MessageSquare,
  Settings,
  Shield,
  Users,
  DollarSign,
  School,
  TrendingUp,
  UserPlus,
  Activity,
  Building2,
  Database,
  Megaphone,
  MapPin,
  UserCheck,
  Calculator,
  Receipt,
  Banknote,
  Coins,
  FolderKanban,
  ClipboardList,
  ChevronDown,
  Bell,
  Wrench,
  Award,
} from "lucide-react";

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  subItems?: MenuItem[];
}

export const getMenuItems = (userRole?: string): MenuItem[] => {
  const baseItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      roles: [
        "edufam_admin",
        "principal",
        "teacher",
        "parent",
        "school_director",
        "finance_officer",
        "hr",
      ],
    },
    {
      id: "project-hub",
      label: "Project Hub",
      icon: FolderKanban,
      roles: ["edufam_admin"],
    },
    {
      id: "school-management",
      label: "School Management",
      icon: Building2,
      roles: ["principal"],
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      roles: ["edufam_admin", "principal", "school_director"],
    },
    {
      id: "grades",
      label: "Grades",
      icon: GraduationCap,
      roles: ["principal", "teacher", "parent", "school_director"],
    },
    {
      id: "attendance",
      label: "Attendance",
      icon: UserCheck,
      roles: ["principal", "teacher", "school_director"],
    },
    {
      id: "students",
      label: "Students",
      icon: Users,
      roles: ["principal", "teacher", "school_director"],
    },
    {
      id: "finance",
      label: "Finance Overview",
      icon: DollarSign,
      roles: ["finance_officer", "school_director", "principal"],
    },
    {
      id: "finance-management",
      label: "Finance Management",
      icon: Calculator,
      roles: ["finance_officer"],
      subItems: [
        {
          id: "fee-management",
          label: "Fee Management",
          icon: Coins,
          roles: ["finance_officer"],
        },
        {
          id: "mpesa-payments",
          label: "MPESA Payments",
          icon: Banknote,
          roles: ["finance_officer"],
        },
        {
          id: "payments",
          label: "Process Payments",
          icon: CreditCard,
          roles: ["finance_officer"],
        },
        {
          id: "student-accounts",
          label: "Student Accounts",
          icon: Receipt,
          roles: ["finance_officer"],
        },
        {
          id: "finance-settings",
          label: "Finance Settings",
          icon: Settings,
          roles: ["finance_officer"],
        },
      ],
    },
    {
      id: "financial-reports",
      label: "Financial Reports",
      icon: FileText,
      roles: ["finance_officer"],
    },
    {
      id: "financial-analytics",
      label: "Financial Analytics",
      icon: BarChart3,
      roles: ["finance_officer", "principal", "school_director"],
    },
    {
      id: "certificates",
      label: "Certificates",
      icon: Award,
      roles: ["principal", "school_director", "edufam_admin"],
    },
    {
      id: "timetable",
      label: "Timetable",
      icon: Calendar,
      roles: ["principal", "teacher", "school_director"],
    },
    {
      id: "announcements",
      label: "Announcements",
      icon: Megaphone,
      roles: ["edufam_admin", "principal", "teacher", "school_director"],
    },
    {
      id: "messages",
      label: "Messages",
      icon: MessageSquare,
      roles: [
        "edufam_admin",
        "principal",
        "teacher",
        "parent",
        "school_director",
        "finance_officer",
        "hr",
      ],
    },
    {
      id: "reports",
      label: "Reports",
      icon: FileText,
      roles: [
        "edufam_admin",
        "principal",
        "teacher",
        "parent",
        "school_director",
        "finance_officer",
        "hr",
      ],
    },
    {
      id: "school-activity-logs",
      label: "School Activity Logs",
      icon: ClipboardList,
      roles: ["principal", "school_director"],
    },
    {
      id: "system-audit-logs",
      label: "System Audit Logs",
      icon: Shield,
      roles: ["edufam_admin"],
    },
    {
      id: "support",
      label: "Support",
      icon: HelpCircle,
      roles: [
        "edufam_admin",
        "principal",
        "teacher",
        "parent",
        "school_director",
        "finance_officer",
        "hr",
      ],
    },
  ];

  // Add System Settings with dropdown for EduFam Admins
  if (userRole === "edufam_admin") {
    baseItems.push({
      id: "system-settings",
      label: "System Settings",
      icon: Settings,
      roles: ["edufam_admin"],
      subItems: [
        {
          id: "maintenance",
          label: "Maintenance",
          icon: Wrench,
          roles: ["edufam_admin"],
        },
        {
          id: "database",
          label: "Database",
          icon: Database,
          roles: ["edufam_admin"],
        },
        {
          id: "security",
          label: "Security",
          icon: Shield,
          roles: ["edufam_admin"],
        },
        {
          id: "notifications",
          label: "Notifications",
          icon: Bell,
          roles: ["edufam_admin"],
        },
        {
          id: "user-management",
          label: "User Management",
          icon: UserPlus,
          roles: ["edufam_admin"],
        },
        {
          id: "company-settings",
          label: "Company Settings",
          icon: Building2,
          roles: ["edufam_admin"],
        },
      ],
    });
  } else {
    // Regular settings for other roles
    baseItems.push({
      id: "settings",
      label: "Settings",
      icon: Settings,
      roles: ["principal", "school_director"],
    });
  }

  baseItems.push(
    {
      id: "security",
      label: "Security",
      icon: Shield,
      roles: ["principal", "school_director"],
    },
    {
      id: "schools",
      label: "Schools",
      icon: School,
      roles: ["edufam_admin"],
    },
    {
      id: "users",
      label: "Users",
      icon: UserPlus,
      roles: ["edufam_admin"],
    },
    {
      id: "billing",
      label: "Billing",
      icon: Banknote,
      roles: ["edufam_admin"],
    },
    {
      id: "system-health",
      label: "System Health",
      icon: Activity,
      roles: ["edufam_admin"],
    }
  );

  // School Director Sidebar Items - inherits all school_owner functionality
  if (userRole === "school_director") {
    // School Director has same access as former school_owner role + additional management features
    baseItems.push(
      {
        id: "school-analytics",
        label: "School Analytics", 
        icon: TrendingUp,
        roles: ["school_director"],
      },
      {
        id: "principal-management",
        label: "Principal Management",
        icon: Users,
        roles: ["school_director"],
      }
    );
  }

  // HR Sidebar Items - comprehensive HR management features
  if (userRole === "hr") {
    baseItems.push(
      {
        id: "hr-dashboard",
        label: "HR Dashboard",
        icon: Home,
        roles: ["hr"],
      },
      {
        id: "staff-management", 
        label: "Staff Management",
        icon: Users,
        roles: ["hr"],
      },
      {
        id: "payroll",
        label: "Salaries/Payroll", 
        icon: DollarSign,
        roles: ["hr"],
      },
      {
        id: "attendance-monitoring",
        label: "Attendance Monitoring",
        icon: Calendar,
        roles: ["hr"],
      },
      {
        id: "hr-reports",
        label: "HR Reports",
        icon: FileText,
        roles: ["hr"],
      },
      {
        id: "user-management",
        label: "User Management", 
        icon: UserPlus,
        roles: ["hr"],
      },
      {
        id: "hr-analytics",
        label: "HR Analytics",
        icon: BarChart3,
        roles: ["hr"],
      }
    );
  }

  return baseItems;
};
