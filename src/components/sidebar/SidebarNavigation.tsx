
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getMenuItems } from './SidebarMenuItems';
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

interface SidebarNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  activeSection,
  onSectionChange,
}) => {
  const { user } = useAuth();
  
  console.log('🔧 SidebarNavigation: Rendering with user role:', user?.role);
  
  const menuItems = getMenuItems(user?.role);
  const filteredItems = menuItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  console.log('📋 SidebarNavigation: Filtered menu items:', filteredItems.map(item => item.id));

  // Group items by category for better organization
  const systemItems = filteredItems.filter(item => 
    ['dashboard', 'analytics', 'school-analytics', 'schools', 'users', 'company-management', 'billing', 'system-health'].includes(item.id)
  );
  
  const schoolItems = filteredItems.filter(item => 
    ['school-management', 'grades', 'attendance', 'students', 'certificates', 'timetable'].includes(item.id)
  );
  
  const financeItems = filteredItems.filter(item => 
    ['finance', 'payments', 'student-accounts', 'fee-management', 'mpesa-payments', 'financial-reports', 'financial-analytics'].includes(item.id)
  );
  
  const communicationItems = filteredItems.filter(item => 
    ['announcements', 'messages'].includes(item.id)
  );
  
  const otherItems = filteredItems.filter(item => 
    !systemItems.includes(item) && !schoolItems.includes(item) && 
    !financeItems.includes(item) && !communicationItems.includes(item)
  );

  const renderMenuGroup = (items: typeof filteredItems, groupLabel?: string) => {
    if (items.length === 0) return null;
    
    return (
      <SidebarGroup key={groupLabel || 'default'}>
        {groupLabel && <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>}
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onSectionChange(item.id)}
                    isActive={isActive}
                    className="w-full justify-start"
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <SidebarContent>
      {user?.role === 'edufam_admin' ? (
        <>
          {renderMenuGroup(systemItems.filter(item => ['dashboard'].includes(item.id)))}
          {renderMenuGroup(systemItems.filter(item => ['analytics', 'school-analytics'].includes(item.id)), 'Analytics')}
          {renderMenuGroup(systemItems.filter(item => ['schools', 'users', 'company-management'].includes(item.id)), 'Management')}
          {renderMenuGroup(systemItems.filter(item => ['billing', 'system-health'].includes(item.id)), 'System')}
          {renderMenuGroup(communicationItems, 'Communication')}
          {renderMenuGroup(otherItems.filter(item => ['reports', 'support', 'settings', 'security'].includes(item.id)), 'Tools')}
        </>
      ) : (
        <>
          {renderMenuGroup(systemItems.filter(item => ['dashboard'].includes(item.id)))}
          {schoolItems.length > 0 && renderMenuGroup(schoolItems, 'Academic')}
          {financeItems.length > 0 && renderMenuGroup(financeItems, 'Finance')}
          {communicationItems.length > 0 && renderMenuGroup(communicationItems, 'Communication')}
          {otherItems.length > 0 && renderMenuGroup(otherItems, 'Tools')}
        </>
      )}
    </SidebarContent>
  );
};

export default SidebarNavigation;
