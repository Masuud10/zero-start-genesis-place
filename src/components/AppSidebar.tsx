
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  BookOpen, 
  DollarSign, 
  Calendar,
  MessageSquare,
  Megaphone,
  BarChart3,
  FileText,
  HelpCircle,
  Settings,
  Shield,
  School,
  UserPlus,
  CreditCard,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AppSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ activeSection, onSectionChange }) => {
  const { user } = useAuth();

  if (!user) return null;

  const getMenuItems = () => {
    const items = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ];

    // Role-based menu items
    if (['edufam_admin', 'school_owner', 'principal', 'teacher'].includes(user.role)) {
      items.push(
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'grades', label: 'Grades', icon: GraduationCap },
        { id: 'attendance', label: 'Attendance', icon: Users },
        { id: 'students', label: 'Students', icon: BookOpen },
        { id: 'timetable', label: 'Timetable', icon: Calendar },
        { id: 'announcements', label: 'Announcements', icon: Megaphone },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
        { id: 'reports', label: 'Reports', icon: FileText }
      );
    }

    if (['edufam_admin', 'school_owner', 'principal', 'finance_officer'].includes(user.role)) {
      items.push({ id: 'finance', label: 'Finance', icon: DollarSign });
    }

    // Admin-only items
    if (['edufam_admin'].includes(user.role)) {
      items.push(
        { id: 'schools', label: 'Schools', icon: School },
        { id: 'users', label: 'Users', icon: UserPlus },
        { id: 'billing', label: 'Billing', icon: CreditCard },
        { id: 'system-health', label: 'System Health', icon: Activity }
      );
    }

    // Common items for all authenticated users
    items.push(
      { id: 'support', label: 'Support', icon: HelpCircle },
      { id: 'security', label: 'Security', icon: Shield }
    );

    // Settings for admins only
    if (['edufam_admin'].includes(user.role)) {
      items.push({ id: 'settings', label: 'Settings', icon: Settings });
    }

    return items;
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              EduFam
            </span>
            <div className="text-xs text-gray-500 font-medium">School Management</div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {getMenuItems().map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                onClick={() => onSectionChange(item.id)}
                isActive={activeSection === item.id}
                className="w-full justify-start"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
