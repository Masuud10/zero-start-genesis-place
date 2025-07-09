
import { 
  LayoutDashboard, 
  BarChart3, 
  GraduationCap, 
  CalendarCheck, 
  Users, 
  DollarSign, 
  Calendar, 
  Megaphone, 
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
  Coins,
  Award,
  Globe,
  PieChart,
  Banknote,
  FolderKanban,
  BookOpen,
  UserPlus,
  ArrowUpDown,
  Archive
} from 'lucide-react';

import { LucideIcon } from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  roles: string[];
  permission?: string;
  subItems?: MenuItem[];
}

export const getMenuItems = (userRole?: string): MenuItem[] => {
  const baseItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['school_owner', 'principal', 'teacher', 'parent', 'finance_officer', 'edufam_admin'] },
  ];

  // System admin specific items - ensure Project Hub is prominently placed
  if (userRole === 'edufam_admin') {
    return [
      ...baseItems,
      { id: 'project-hub', label: 'Project Hub', icon: FolderKanban, roles: ['edufam_admin'] },
      { id: 'analytics', label: 'System Analytics', icon: BarChart3, roles: ['edufam_admin'] },
      { id: 'school-analytics', label: 'Schools Analytics', icon: TrendingUp, roles: ['edufam_admin'] },
      { id: 'schools', label: 'Schools Management', icon: Building2, roles: ['edufam_admin'] },
      { id: 'company-management', label: 'Company Management', icon: Globe, roles: ['edufam_admin'] },
      { id: 'users', label: 'User Management', icon: UserCheck, roles: ['edufam_admin'] },
      { id: 'certificates', label: 'Certificate Management', icon: Award, roles: ['edufam_admin'] },
      { id: 'announcements', label: 'Communication Center', icon: Megaphone, roles: ['edufam_admin'] },
      { id: 'reports', label: 'System Reports', icon: FileText, roles: ['edufam_admin'] },
      { id: 'billing', label: 'Billing Management', icon: CreditCard, roles: ['edufam_admin'] },
      { id: 'system-health', label: 'System Health', icon: Activity, roles: ['edufam_admin'] },
      { id: 'support', label: 'Support Center', icon: Headphones, roles: ['edufam_admin'] },
      { id: 'security', label: 'Security', icon: Shield, roles: ['edufam_admin'] },
      { id: 'settings', label: 'System Settings', icon: Settings, roles: ['edufam_admin'] },
    ];
  }

  // School Owner - school-wide access, excluding grades and attendance
  if (userRole === 'school_owner') {
    return [
      ...baseItems,
      { id: 'analytics', label: 'School Analytics', icon: BarChart3, roles: ['school_owner'] },
      { id: 'users', label: 'Staff Management', icon: UserCheck, roles: ['school_owner'] },
      { id: 'students', label: 'Student Management', icon: Users, roles: ['school_owner'] },
      { id: 'finance', label: 'Financial Overview', icon: DollarSign, roles: ['school_owner'] },
      { id: 'certificates', label: 'View Certificates', icon: Award, roles: ['school_owner'] },
      { id: 'timetable', label: 'School Timetables', icon: Calendar, roles: ['school_owner'] },
      { id: 'announcements', label: 'School Announcements', icon: Megaphone, roles: ['school_owner'] },
      { id: 'reports', label: 'School Reports', icon: FileText, roles: ['school_owner'] },
      { id: 'support', label: 'Support Tickets', icon: Headphones, roles: ['school_owner'] },
    ];
  }

  // Principal - full school operational access (Grades Management RESTORED)
  if (userRole === 'principal') {
    return [
      ...baseItems,
      { id: 'school-management', label: 'School Management', icon: SchoolIcon, roles: ['principal'] },
      { 
        id: 'academic-management', 
        label: 'Academic Management', 
        icon: BookOpen, 
        roles: ['principal'],
        subItems: [
          { id: 'student-admission', label: 'Student Admission', icon: UserPlus, roles: ['principal'] },
          { id: 'student-promotion', label: 'Student Promotion', icon: ArrowUpDown, roles: ['principal'] },
          { id: 'student-information', label: 'Student Information', icon: Users, roles: ['principal'] },
          { id: 'transfer-management', label: 'Transfer Management', icon: TrendingUp, roles: ['principal'] },
          { id: 'exit-management', label: 'Exit Management', icon: Archive, roles: ['principal'] },
        ]
      },
      { id: 'grades', label: 'Grades Management', icon: GraduationCap, roles: ['principal'] },
      { id: 'examinations', label: 'Examinations', icon: BookOpen, roles: ['principal'] },
      { id: 'analytics', label: 'School Analytics', icon: BarChart3, roles: ['principal'] },
      { id: 'attendance', label: 'Attendance Management', icon: CalendarCheck, roles: ['principal'] },
      { id: 'students', label: 'Student Management', icon: Users, roles: ['principal'] },
      { id: 'finance', label: 'Financial Overview', icon: DollarSign, roles: ['principal'] },
      { id: 'certificates', label: 'Certificate Generation', icon: Award, roles: ['principal'] },
      { id: 'timetable', label: 'Timetable Generator', icon: Calendar, roles: ['principal'] },
      { id: 'announcements', label: 'School Announcements', icon: Megaphone, roles: ['principal'] },
      { id: 'reports', label: 'School Reports', icon: FileText, roles: ['principal'] },
      { id: 'support', label: 'Support', icon: Headphones, roles: ['principal'] },
    ];
  }

  // Teacher - class-level access only (Security removed)
  if (userRole === 'teacher') {
    return [
      ...baseItems,
      { id: 'analytics', label: 'Class Analytics', icon: BarChart3, roles: ['teacher'] },
      { id: 'grades', label: 'My Class Grades', icon: GraduationCap, roles: ['teacher'] },
      { id: 'attendance', label: 'Class Attendance', icon: CalendarCheck, roles: ['teacher'] },
      { id: 'students', label: 'My Students', icon: Users, roles: ['teacher'] },
      { id: 'timetable', label: 'My Timetable', icon: Calendar, roles: ['teacher'] },
      { id: 'announcements', label: 'Class Announcements', icon: Megaphone, roles: ['teacher'] },
      { id: 'reports', label: 'Class Reports', icon: FileText, roles: ['teacher'] },
      { id: 'support', label: 'Support', icon: Headphones, roles: ['teacher'] },
    ];
  }

  // Finance Officer - ONLY financial operations (Security removed)
  if (userRole === 'finance_officer') {
    return [
      ...baseItems,
      { id: 'finance', label: 'Financial Overview', icon: DollarSign, roles: ['finance_officer'] },
      { id: 'fee-management', label: 'Fee Management', icon: Coins, roles: ['finance_officer'] },
      { id: 'mpesa-payments', label: 'MPESA Payments', icon: CreditCard, roles: ['finance_officer'] },
      { id: 'financial-reports', label: 'Financial Reports', icon: FileText, roles: ['finance_officer'] },
      { id: 'financial-analytics', label: 'Financial Analytics', icon: PieChart, roles: ['finance_officer'] },
      { id: 'student-accounts', label: 'Student Accounts', icon: Users, roles: ['finance_officer'] },
      { id: 'announcements', label: 'Finance Notices', icon: Megaphone, roles: ['finance_officer'] },
      { id: 'finance-settings', label: 'Finance Settings', icon: Settings, roles: ['finance_officer'] },
      { id: 'support', label: 'Support', icon: Headphones, roles: ['finance_officer'] },
    ];
  }

  // Parent - student-focused access (Security removed)
  if (userRole === 'parent') {
    return [
      ...baseItems,
      { id: 'grades', label: 'Child Grades', icon: GraduationCap, roles: ['parent'] },
      { id: 'attendance', label: 'Child Attendance', icon: CalendarCheck, roles: ['parent'] },
      { id: 'finance', label: 'School Fees', icon: DollarSign, roles: ['parent'] },
      { id: 'timetable', label: 'Class Timetable', icon: Calendar, roles: ['parent'] },
      { id: 'announcements', label: 'School News', icon: Megaphone, roles: ['parent'] },
      { id: 'reports', label: 'Progress Reports', icon: FileText, roles: ['parent'] },
      { id: 'support', label: 'Support', icon: Headphones, roles: ['parent'] },
    ];
  }

  // Fallback - return base items only
  return baseItems;
};
