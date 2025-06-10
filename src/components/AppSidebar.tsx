
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
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
  LogOut,
  Settings
} from 'lucide-react';

interface AppSidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ activeSection, onSectionChange }) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['school_owner', 'principal', 'teacher', 'parent', 'finance_officer', 'edufam_admin', 'elimisha_admin'] },
      { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['school_owner', 'principal', 'teacher', 'finance_officer', 'edufam_admin', 'elimisha_admin'] },
    ];

    // Elimisha admin specific items
    if (user?.role === 'elimisha_admin' || user?.role === 'edufam_admin') {
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
    const schoolItems = [
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

  const menuItems = getMenuItems();
  const filteredItems = menuItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'school_owner':
        return 'School Owner';
      case 'principal':
        return 'Principal';
      case 'teacher':
        return 'Teacher';
      case 'parent':
        return 'Parent';
      case 'finance_officer':
        return 'Finance Officer';
      case 'edufam_admin':
        return 'EduFam Admin';
      case 'elimisha_admin':
        return 'Elimisha Admin';
      default:
        return role;
    }
  };

  const handleSectionChange = (section: string) => {
    onSectionChange?.(section);
  };

  const handleLogout = async () => {
    try {
      console.log('🔓 Sidebar: Initiating logout');
      await signOut();
      
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account.",
      });
      
      console.log('✅ Sidebar: Logout successful');
    } catch (error) {
      console.error('❌ Sidebar: Logout error:', error);
      
      toast({
        title: "Logout completed",
        description: "You have been signed out (with minor issues that were handled).",
        variant: "default",
      });
    }
  };

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">🎓</span>
          </div>
          <div>
            <h2 className="font-bold text-xl text-foreground">Elimisha</h2>
            <p className="text-sm text-muted-foreground">{getRoleDisplay(user?.role || '')}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => handleSectionChange(item.id)}
                    isActive={activeSection === item.id}
                    className="w-full"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg p-4 border">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="w-full flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
