
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
  Award
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: any;
  roles: string[];
  subItems?: MenuItem[];
}

export const getMenuItems = (userRole?: string): MenuItem[] => {
  const baseItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      roles: ['edufam_admin', 'principal', 'teacher', 'parent', 'school_owner', 'finance_officer']
    },
    {
      id: 'project-hub',
      label: 'Project Hub',
      icon: FolderKanban,
      roles: ['edufam_admin']
    },
    {
      id: 'school-management',
      label: 'School Management',
      icon: Building2,
      roles: ['principal']
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      roles: ['edufam_admin', 'principal', 'school_owner']
    },
    {
      id: 'grades',
      label: 'Grades',
      icon: GraduationCap,
      roles: ['principal', 'teacher', 'parent', 'school_owner']
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: UserCheck,
      roles: ['principal', 'teacher', 'school_owner']
    },
    {
      id: 'students',
      label: 'Students',
      icon: Users,
      roles: ['principal', 'teacher', 'school_owner']
    },
    {
      id: 'finance',
      label: 'Finance Overview',
      icon: DollarSign,
      roles: ['finance_officer', 'school_owner', 'principal']
    },
    {
      id: 'payments',
      label: 'Process Payments',
      icon: CreditCard,
      roles: ['finance_officer']
    },
    {
      id: 'student-accounts',
      label: 'Student Accounts',
      icon: Receipt,
      roles: ['finance_officer']
    },
    {
      id: 'fee-management',
      label: 'Fee Management',
      icon: Coins,
      roles: ['finance_officer']
    },
    {
      id: 'mpesa-payments',
      label: 'MPESA Payments',
      icon: Banknote,
      roles: ['finance_officer']
    },
    {
      id: 'financial-analytics',
      label: 'Financial Analytics',
      icon: BarChart3,
      roles: ['finance_officer', 'principal', 'school_owner']
    },
    {
      id: 'financial-reports',
      label: 'Financial Reports',
      icon: FileText,
      roles: ['finance_officer', 'principal', 'school_owner']
    },
    {
      id: 'finance-settings',
      label: 'Finance Settings',
      icon: Settings,
      roles: ['finance_officer']
    },
    {
      id: 'certificates',
      label: 'Certificates',
      icon: Award,
      roles: ['principal', 'school_owner', 'edufam_admin']
    },
    {
      id: 'timetable',
      label: 'Timetable',
      icon: Calendar,
      roles: ['principal', 'teacher', 'school_owner']
    },
    {
      id: 'announcements',
      label: 'Announcements',
      icon: Megaphone,
      roles: ['edufam_admin', 'principal', 'teacher', 'school_owner']
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      roles: ['edufam_admin', 'principal', 'teacher', 'parent', 'school_owner', 'finance_officer']
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      roles: ['edufam_admin', 'principal', 'teacher', 'parent', 'school_owner', 'finance_officer']
    },
    {
      id: 'school-activity-logs',
      label: 'School Activity Logs',
      icon: ClipboardList,
      roles: ['principal', 'school_owner']
    },
    {
      id: 'system-audit-logs',
      label: 'System Audit Logs',
      icon: Shield,
      roles: ['edufam_admin']
    },
    {
      id: 'support',
      label: 'Support',
      icon: HelpCircle,
      roles: ['edufam_admin', 'principal', 'teacher', 'parent', 'school_owner', 'finance_officer']
    }
  ];

  // Add System Settings with dropdown for EduFam Admins
  if (userRole === 'edufam_admin') {
    baseItems.push({
      id: 'system-settings',
      label: 'System Settings',
      icon: Settings,
      roles: ['edufam_admin'],
      subItems: [
        {
          id: 'maintenance',
          label: 'Maintenance',
          icon: Wrench,
          roles: ['edufam_admin']
        },
        {
          id: 'database',
          label: 'Database',
          icon: Database,
          roles: ['edufam_admin']
        },
        {
          id: 'security',
          label: 'Security',
          icon: Shield,
          roles: ['edufam_admin']
        },
        {
          id: 'notifications',
          label: 'Notifications',
          icon: Bell,
          roles: ['edufam_admin']
        },
        {
          id: 'user-management',
          label: 'User Management',
          icon: UserPlus,
          roles: ['edufam_admin']
        },
        {
          id: 'company-settings',
          label: 'Company Settings',
          icon: Building2,
          roles: ['edufam_admin']
        }
      ]
    });
  } else {
    // Regular settings for other roles
    baseItems.push({
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      roles: ['principal', 'school_owner']
    });
  }

  baseItems.push(
    {
      id: 'finance-settings',
      label: 'Finance Settings',
      icon: Calculator,
      roles: ['finance_officer']
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
      roles: ['principal', 'school_owner']
    },
    {
      id: 'schools',
      label: 'Schools',
      icon: School,
      roles: ['edufam_admin']
    },
    {
      id: 'users',
      label: 'Users',
      icon: UserPlus,
      roles: ['edufam_admin']
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: Banknote,
      roles: ['edufam_admin']
    },
    {
      id: 'system-health',
      label: 'System Health',
      icon: Activity,
      roles: ['edufam_admin']
    }
  );

  return baseItems;
};
