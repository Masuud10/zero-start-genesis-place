
import React from 'react';
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { getMenuItems } from './SidebarMenuItems';
import { usePermissions, PERMISSIONS } from '@/utils/permissions';
import { UserRole } from '@/types/user';

interface SidebarNavigationProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ 
  activeSection, 
  onSectionChange 
}) => {
  const { user } = useAuth();
  
  console.log('🧭 SidebarNavigation: Rendering for user role:', user?.role);
  
  // Use the permissions system to check individual permissions
  const { hasPermission } = usePermissions(
    user?.role as UserRole, 
    user?.school_id
  );

  const menuItems = getMenuItems(user?.role);
  
  const checkAccess = (section: string): boolean => {
    if (!user?.role) {
      return false;
    }

    if (section === 'dashboard') return true;

    switch (section) {
      case 'grades':
        return hasPermission(PERMISSIONS.VIEW_GRADEBOOK);
      case 'attendance':
        return hasPermission(PERMISSIONS.VIEW_ATTENDANCE);
      case 'students':
        return hasPermission(PERMISSIONS.VIEW_CLASS_INFO);
      case 'finance':
        return hasPermission(PERMISSIONS.VIEW_FEE_BALANCE);
      case 'timetable':
        return hasPermission(PERMISSIONS.VIEW_TIMETABLE);
      case 'announcements':
        return hasPermission(PERMISSIONS.VIEW_ANNOUNCEMENTS);
      case 'messages':
        return hasPermission(PERMISSIONS.SEND_MESSAGES);
      case 'reports':
        return hasPermission(PERMISSIONS.VIEW_REPORTS);
      case 'analytics':
        return hasPermission(PERMISSIONS.VIEW_ANALYTICS);
      case 'schools':
        return hasPermission(PERMISSIONS.VIEW_OTHER_SCHOOLS);
      case 'users':
        return hasPermission(PERMISSIONS.MANAGE_USERS);
      case 'billing':
        return hasPermission(PERMISSIONS.VIEW_FEE_BALANCE) || 
               user.role === 'edufam_admin';
      case 'system-health':
        return user.role === 'edufam_admin';
      case 'settings':
        return user.role === 'edufam_admin';
      case 'security':
        return hasPermission(PERMISSIONS.MANAGE_SECURITY);
      case 'support':
        return hasPermission(PERMISSIONS.ACCESS_SUPPORT);
      default:
        return false;
    }
  };
  
  // Filter menu items based on unified access logic
  const filteredItems = menuItems.filter(item => checkAccess(item.id));

  console.log('🧭 SidebarNavigation: Filtered items for role', user?.role, ':', filteredItems.map(item => item.id));

  const handleSectionChange = (section: string) => {
    console.log('🧭 SidebarNavigation: Section change requested:', section);
    onSectionChange?.(section);
  };

  if (!user) {
    console.log('🧭 SidebarNavigation: No user found');
    return null;
  }

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>
          {user.role === 'edufam_admin' 
            ? 'System Administration' 
            : 'Main Navigation'
          }
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {filteredItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => handleSectionChange(item.id)}
                  isActive={activeSection === item.id}
                  className="w-full transition-all duration-200 hover:bg-accent"
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
  );
};

export default SidebarNavigation;
