
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
    { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['school_owner', 'principal', 'teacher', 'finance_officer', 'edufam_admin', 'elimisha_admin'] },
  ];

  // Elimisha admin specific items
  if (userRole === 'elimisha_admin' || userRole === 'edufam_admin') {
    return [
      ...baseItems,
      { id: 'schools', label: 'Schools', icon: Building2, roles: ['elimisha_admin', 'edufam_admin'] },
      { id: 'users', label: 'Users', icon: UserCheck, roles: ['elimisha_admin', 'edufam_admin'] },
      { id: 'billing', label: 'Billing Management', icon: CreditCard, roles: ['elimisha_admin', 'edufam_admin'] },
      { id: 'system-health', label: 'System Health', icon: Activity, roles: ['elimisha_admin', 'edufam_admin'] },
      { id: 'system-analytics', label: 'System Analytics', icon: TrendingUp, roles: ['elimisha_admin', 'edufam_admin'] },
      { id: 'support', label: 'Support Tickets', icon: Headphones, roles: ['elimisha_admin', 'edufam_admin'] },
      { id: 'settings', label: 'Settings', icon: Settings, roles: ['elimisha_admin', 'edufam_admin'] },
    ];
  }

  // Regular school items - school owners have restricted access
  const schoolItems: MenuItem[] = [
    // Available to all school users
    { id: 'finance', label: 'Finance', icon: DollarSign, roles: ['school_owner', 'principal', 'finance_officer', 'parent'] },
    { id: 'announcements', label: 'Announcements', icon: Megaphone, roles: ['school_owner', 'principal', 'teacher', 'parent'] },
    { id: 'messages', label: 'Messages', icon: MessageSquare, roles: ['school_owner', 'principal', 'teacher', 'parent'] },
    { id: 'reports', label: 'Reports', icon: FileText, roles: ['school_owner', 'principal', 'teacher', 'finance_officer'] },
    
    // Restricted items - NOT available to school_owner
    { id: 'grades', label: 'Grades', icon: GraduationCap, roles: ['principal', 'teacher', 'parent'] },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck, roles: ['principal', 'teacher', 'parent'] },
    { id: 'students', label: 'Students', icon: Users, roles: ['principal', 'teacher'] },
    { id: 'timetable', label: 'Timetable', icon: Calendar, roles: ['principal', 'teacher'] },
    { id: 'support', label: 'Support', icon: Headphones, roles: ['principal'] },
  ];

  return [...baseItems, ...schoolItems];
};
