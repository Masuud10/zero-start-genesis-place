
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
  PieChart,
  Award,
  Globe
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: any;
  roles: string[];
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
      id: 'school-analytics',
      label: 'School Analytics',
      icon: PieChart,
      roles: ['edufam_admin']
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
      id: 'timetable',
      label: 'Timetable',
      icon: Calendar,
      roles: ['principal', 'teacher', 'school_owner']
    },
    {
      id: 'certificates',
      label: 'Certificates',
      icon: Award,
      roles: ['principal', 'school_owner', 'edufam_admin']
    },
    {
      id: 'announcements',
      label: userRole === 'edufam_admin' ? 'Communication Center' : 'Announcements',
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
      id: 'support',
      label: 'Support',
      icon: HelpCircle,
      roles: ['edufam_admin', 'principal', 'teacher', 'parent', 'school_owner', 'finance_officer']
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      roles: ['edufam_admin', 'principal', 'school_owner']
    },
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
      roles: ['edufam_admin', 'principal', 'school_owner']
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
      id: 'company-management',
      label: 'Company Management',
      icon: Globe,
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
  ];

  return baseItems;
};
