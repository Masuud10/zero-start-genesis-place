
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

interface SidebarNavigationProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ 
  activeSection, 
  onSectionChange 
}) => {
  const { user } = useAuth();
  
  const menuItems = getMenuItems(user?.role);
  const filteredItems = menuItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  const handleSectionChange = (section: string) => {
    onSectionChange?.(section);
  };

  return (
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
  );
};

export default SidebarNavigation;
