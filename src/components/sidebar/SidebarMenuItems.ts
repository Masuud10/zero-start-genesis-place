
import { 
  LayoutDashboard, 
  BarChart3, 
  GraduationCap, 
  CalendarCheck, 
  Users, 
  DollarSign, 
  Calendar, 
  Megaphone, 
  MessageSquare, 
  FileText, 
  Headphones, 
  Building2,
  CreditCard,
  Activity,
  TrendingUp,
  UserCheck,
  Settings,
  Shield,
  SchoolIcon,
  Receipt,
  Calculator,
  Coins
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: any;
  roles: string[];
  permission?: string;
}

export const getMenuItems = (userRole?: string): MenuItem[] => {
  const baseItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['school_owner', 'principal', 'teacher', 'parent', 'finance_officer', 'edufam_admin'] },
  ];

  // System admin specific items - full system access
  if (userRole === 'edufam_admin') {
    return [
      ...baseItems,
      { id: 'analytics', label: 'Schools Analytics', icon: BarChart3, roles: ['edufam_admin'] },
      { id: 'schools', label: 'Schools Management', icon: Building2, roles: ['edufam_admin'] },
      { id: 'users', label: 'User Management', icon: UserCheck, roles: ['edufam_admin'] },
      { id: 'grades', label: 'All Grades', icon: GraduationCap, roles: ['edufam_admin'] },
      { id: 'attendance', label: 'All Attendance', icon: CalendarCheck, roles: ['edufam_admin'] },
      { id: 'students', label: 'All Students', icon: Users, roles: ['edufam_admin'] },
      { id: 'finance', label: 'All Finance', icon: DollarSign, roles: ['edufam_admin'] },
      { id: 'certificates', label: 'Certificate Management', icon: Award, roles: ['edufam_admin'] },
      { id: 'timetable', label: 'All Timetables', icon: Calendar, roles: ['edufam_admin'] },
      { id: 'announcements', label: 'All Announcements', icon: Megaphone, roles: ['edufam_admin'] },
      { id: 'messages', label: 'All Messages', icon: MessageSquare, roles: ['edufam_admin'] },
      { id: 'reports', label: 'System Reports', icon: FileText, roles: ['edufam_admin'] },
      { id: 'billing', label: 'Billing Management', icon: CreditCard, roles: ['edufam_admin'] },
      { id: 'system-health', label: 'System Health', icon: Activity, roles: ['edufam_admin'] },
      { id: 'support', label: 'Support Center', icon: Headphones, roles: ['edufam_admin'] },
      { id: 'security', label: 'Security', icon: Shield, roles: ['edufam_admin'] },
      { id: 'settings', label: 'System Settings', icon: Settings, roles: ['edufam_admin'] },
    ];
  }

  // School Owner - school-wide access, including user management
  if (userRole === 'school_owner') {
    return [
      ...baseItems,
      { id: 'analytics', label: 'School Analytics', icon: BarChart3, roles: ['school_owner'] },
      { id: 'users', label: 'Staff Management', icon: UserCheck, roles: ['school_owner'] },
      { id: 'grades', label: 'School Grades', icon: GraduationCap, roles: ['school_owner'] },
      { id: 'attendance', label: 'School Attendance', icon: CalendarCheck, roles: ['school_owner'] },
      { id: 'students', label: 'Student Management', icon: Users, roles: ['school_owner'] },
      { id: 'finance', label: 'Financial Management', icon: DollarSign, roles: ['school_owner'] },
      { id: 'certificates', label: 'View Certificates', icon: Award, roles: ['school_owner'] },
      { id: 'timetable', label: 'School Timetables', icon: Calendar, roles: ['school_owner'] },
      { id: 'announcements', label: 'School Announcements', icon: Megaphone, roles: ['school_owner'] },
      { id: 'messages', label: 'School Messages', icon: MessageSquare, roles: ['school_owner'] },
      { id: 'reports', label: 'School Reports', icon: FileText, roles: ['school_owner'] },
      { id: 'security', label: 'Security', icon: Shield, roles: ['school_owner'] },
      { id: 'support', label: 'Support Tickets', icon: Headphones, roles: ['school_owner'] },
    ];
  }

  // Principal - full school operational access
  if (userRole === 'principal') {
    return [
      ...baseItems,
      { id: 'school-management', label: 'School Management', icon: SchoolIcon, roles: ['principal'] },
      { id: 'analytics', label: 'School Analytics', icon: BarChart3, roles: ['principal'] },
      { id: 'grades', label: 'Grades Management', icon: GraduationCap, roles: ['principal'] },
      { id: 'attendance', label: 'Attendance Management', icon: CalendarCheck, roles: ['principal'] },
      { id: 'students', label: 'Student Management', icon: Users, roles: ['principal'] },
      { id: 'finance', label: 'Financial Management', icon: DollarSign, roles: ['principal'] },
      { id: 'certificates', label: 'Certificate Generation', icon: Award, roles: ['principal'] },
      { id: 'timetable', label: 'Timetable Management', icon: Calendar, roles: ['principal'] },
      { id: 'announcements', label: 'School Announcements', icon: Megaphone, roles: ['principal'] },
      { id: 'messages', label: 'School Messages', icon: MessageSquare, roles: ['principal'] },
      { id: 'reports', label: 'School Reports', icon: FileText, roles: ['principal'] },
      { id: 'security', label: 'Security', icon: Shield, roles: ['principal'] },
      { id: 'support', label: 'Support', icon: Headphones, roles: ['principal'] },
    ];
  }

  // Teacher - class-level access only
  if (userRole === 'teacher') {
    return [
      ...baseItems,
      { id: 'analytics', label: 'Class Analytics', icon: BarChart3, roles: ['teacher'] },
      { id: 'grades', label: 'My Class Grades', icon: GraduationCap, roles: ['teacher'] },
      { id: 'attendance', label: 'Class Attendance', icon: CalendarCheck, roles: ['teacher'] },
      { id: 'students', label: 'My Students', icon: Users, roles: ['teacher'] },
      { id: 'timetable', label: 'My Timetable', icon: Calendar, roles: ['teacher'] },
      { id: 'announcements', label: 'Class Announcements', icon: Megaphone, roles: ['teacher'] },
      { id: 'messages', label: 'Class Messages', icon: MessageSquare, roles: ['teacher'] },
      { id: 'reports', label: 'Class Reports', icon: FileText, roles: ['teacher'] },
      { id: 'security', label: 'Security', icon: Shield, roles: ['teacher'] },
      { id: 'support', label: 'Support', icon: Headphones, roles: ['teacher'] },
    ];
  }

  // Finance Officer - financial operations and related features
  if (userRole === 'finance_officer') {
    return [
      ...baseItems,
      { id: 'analytics', label: 'Financial Analytics', icon: BarChart3, roles: ['finance_officer'] },
      { id: 'finance', label: 'Fee Management', icon: DollarSign, roles: ['finance_officer'] },
      { id: 'payments', label: 'Process Payments', icon: CreditCard, roles: ['finance_officer'] },
      { id: 'student-accounts', label: 'Student Accounts', icon: Users, roles: ['finance_officer'] },
      { id: 'fee-management', label: 'Fee Assignment', icon: Coins, roles: ['finance_officer'] },
      { id: 'reports', label: 'Financial Reports', icon: FileText, roles: ['finance_officer'] },
      { id: 'finance-settings', label: 'Finance Settings', icon: Settings, roles: ['finance_officer'] },
      { id: 'announcements', label: 'Finance Notices', icon: Megaphone, roles: ['finance_officer'] },
      { id: 'messages', label: 'Finance Messages', icon: MessageSquare, roles: ['finance_officer'] },
      { id: 'attendance', label: 'Student Attendance', icon: CalendarCheck, roles: ['finance_officer'] },
      { id: 'timetable', label: 'School Timetable', icon: Calendar, roles: ['finance_officer'] },
      { id: 'security', label: 'Security', icon: Shield, roles: ['finance_officer'] },
      { id: 'support', label: 'Support', icon: Headphones, roles: ['finance_officer'] },
    ];
  }

  // Parent - student-focused access
  if (userRole === 'parent') {
    return [
      ...baseItems,
      { id: 'grades', label: 'Child Grades', icon: GraduationCap, roles: ['parent'] },
      { id: 'attendance', label: 'Child Attendance', icon: CalendarCheck, roles: ['parent'] },
      { id: 'finance', label: 'School Fees', icon: DollarSign, roles: ['parent'] },
      { id: 'timetable', label: 'Class Timetable', icon: Calendar, roles: ['parent'] },
      { id: 'announcements', label: 'School News', icon: Megaphone, roles: ['parent'] },
      { id: 'messages', label: 'Messages', icon: MessageSquare, roles: ['parent'] },
      { id: 'reports', label: 'Progress Reports', icon: FileText, roles: ['parent'] },
      { id: 'security', label: 'Security', icon: Shield, roles: ['parent'] },
      { id: 'support', label: 'Support', icon: Headphones, roles: ['parent'] },
    ];
  }

  // Fallback - return base items only
  return baseItems;
};
