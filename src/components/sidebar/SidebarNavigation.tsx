
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
import { useAccessControl } from '@/hooks/useAccessControl';

interface SidebarNavigationProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ 
  activeSection, 
  onSectionChange 
}) => {
  const { user } = useAuth();
  const { checkAccess } = useAccessControl();
  
  console.log('🧭 SidebarNavigation: Rendering for user role:', user?.role);
  
  const menuItems = getMenuItems(user?.role);
  
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
