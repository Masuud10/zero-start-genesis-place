
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
  Settings
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: any;
  roles: string[];
}

export const getMenuItems = (userRole?: string): MenuItem[] => {
  const baseItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['school_owner', 'principal', 'teacher', 'parent', 'finance_officer', 'edufam_admin', 'elimisha_admin'] },
  ];

  // Elimisha/EduFam admin specific items - full system access
  if (userRole === 'elimisha_admin' || userRole === 'edufam_admin') {
    return [
      ...baseItems,
      { id: 'analytics', label: 'System Analytics', icon: BarChart3, roles: ['elimisha_admin', 'edufam_admin'] },
      { id: 'schools', label: 'Schools Management', icon: Building2, roles: ['elimisha_admin', 'edufam_admin'] },
      { id: 'users', label: 'User Management', icon: UserCheck, roles: ['elimisha_admin', 'edufam_admin'] },
      { id: 'billing', label: 'Billing Management', icon: CreditCard, roles: ['elimisha_admin', 'edufam_admin'] },
      { id: 'system-health', label: 'System Health', icon: Activity, roles: ['elimisha_admin', 'edufam_admin'] },
      { id: 'support', label: 'Support Center', icon: Headphones, roles: ['elimisha_admin', 'edufam_admin'] },
      { id: 'settings', label: 'System Settings', icon: Settings, roles: ['elimisha_admin', 'edufam_admin'] },
    ];
  }

  // School Owner - financial and administrative oversight, NO direct academic access
  if (userRole === 'school_owner') {
    return [
      ...baseItems,
      { id: 'analytics', label: 'School Analytics', icon: BarChart3, roles: ['school_owner'] },
      { id: 'finance', label: 'Financial Management', icon: DollarSign, roles: ['school_owner'] },
      { id: 'reports', label: 'Financial Reports', icon: FileText, roles: ['school_owner'] },
      { id: 'announcements', label: 'Announcements', icon: Megaphone, roles: ['school_owner'] },
      { id: 'messages', label: 'Messages', icon: MessageSquare, roles: ['school_owner'] },
      { id: 'support', label: 'Support', icon: Headphones, roles: ['school_owner'] },
      { id: 'settings', label: 'School Settings', icon: Settings, roles: ['school_owner'] },
    ];
  }

  // Principal - full school operational access
  if (userRole === 'principal') {
    return [
      ...baseItems,
      { id: 'analytics', label: 'School Analytics', icon: BarChart3, roles: ['principal'] },
      { id: 'grades', label: 'Grades Management', icon: GraduationCap, roles: ['principal'] },
      { id: 'attendance', label: 'Attendance', icon: CalendarCheck, roles: ['principal'] },
      { id: 'students', label: 'Student Management', icon: Users, roles: ['principal'] },
      { id: 'finance', label: 'Finance Overview', icon: DollarSign, roles: ['principal'] },
      { id: 'timetable', label: 'Timetable', icon: Calendar, roles: ['principal'] },
      { id: 'announcements', label: 'Announcements', icon: Megaphone, roles: ['principal'] },
      { id: 'messages', label: 'Messages', icon: MessageSquare, roles: ['principal'] },
      { id: 'reports', label: 'Reports', icon: FileText, roles: ['principal'] },
      { id: 'support', label: 'Support', icon: Headphones, roles: ['principal'] },
    ];
  }

  // Teacher - academic and classroom management
  if (userRole === 'teacher') {
    return [
      ...baseItems,
      { id: 'analytics', label: 'Class Analytics', icon: BarChart3, roles: ['teacher'] },
      { id: 'grades', label: 'Grade Entry', icon: GraduationCap, roles: ['teacher'] },
      { id: 'attendance', label: 'Mark Attendance', icon: CalendarCheck, roles: ['teacher'] },
      { id: 'students', label: 'My Students', icon: Users, roles: ['teacher'] },
      { id: 'timetable', label: 'My Timetable', icon: Calendar, roles: ['teacher'] },
      { id: 'announcements', label: 'Class Announcements', icon: Megaphone, roles: ['teacher'] },
      { id: 'messages', label: 'Messages', icon: MessageSquare, roles: ['teacher'] },
      { id: 'reports', label: 'Class Reports', icon: FileText, roles: ['teacher'] },
    ];
  }

  // Finance Officer - financial operations only
  if (userRole === 'finance_officer') {
    return [
      ...baseItems,
      { id: 'analytics', label: 'Financial Analytics', icon: BarChart3, roles: ['finance_officer'] },
      { id: 'finance', label: 'Fee Management', icon: DollarSign, roles: ['finance_officer'] },
      { id: 'students', label: 'Student Fees', icon: Users, roles: ['finance_officer'] },
      { id: 'reports', label: 'Financial Reports', icon: FileText, roles: ['finance_officer'] },
      { id: 'announcements', label: 'Fee Notices', icon: Megaphone, roles: ['finance_officer'] },
      { id: 'messages', label: 'Messages', icon: MessageSquare, roles: ['finance_officer'] },
    ];
  }

  // Parent - very limited access, only child-related information
  if (userRole === 'parent') {
    return [
      ...baseItems,
      { id: 'grades', label: "Child's Grades", icon: GraduationCap, roles: ['parent'] },
      { id: 'attendance', label: "Child's Attendance", icon: CalendarCheck, roles: ['parent'] },
      { id: 'finance', label: 'School Fees', icon: DollarSign, roles: ['parent'] },
      { id: 'announcements', label: 'School News', icon: Megaphone, roles: ['parent'] },
      { id: 'messages', label: 'Messages', icon: MessageSquare, roles: ['parent'] },
    ];
  }

  // Default fallback
  return baseItems;
};
