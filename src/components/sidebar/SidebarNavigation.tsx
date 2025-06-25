
import React, { useState } from 'react';
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { MenuGroup } from './MenuGroup';
import { MenuItem } from './MenuItem';

interface SidebarNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  activeSection,
  onSectionChange,
}) => {
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(['system-settings']);
  
  console.log('🔧 SidebarNavigation: Rendering with user role:', user?.role);
  
  const menuItems = getMenuItems(user?.role);
  const filteredItems = menuItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  console.log('📋 SidebarNavigation: Filtered menu items:', filteredItems.map(item => item.id));

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Group items by category for better organization
  const systemItems = filteredItems.filter(item => 
    ['dashboard', 'project-hub', 'analytics', 'school-analytics', 'schools', 'users', 'company-management', 'billing', 'system-health'].includes(item.id)
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

  return (
    <SidebarContent>
      {user?.role === 'edufam_admin' ? (
        <>
          <MenuGroup
            items={systemItems.filter(item => ['dashboard'].includes(item.id))}
            activeSection={activeSection}
            onSectionChange={onSectionChange}
            expandedItems={expandedItems}
            toggleExpanded={toggleExpanded}
          />
          <MenuGroup
            items={systemItems.filter(item => ['project-hub'].includes(item.id))}
            groupLabel="Project Management"
            activeSection={activeSection}
            onSectionChange={onSectionChange}
            expandedItems={expandedItems}
            toggleExpanded={toggleExpanded}
          />
          <MenuGroup
            items={systemItems.filter(item => ['analytics', 'school-analytics'].includes(item.id))}
            groupLabel="Analytics"
            activeSection={activeSection}
            onSectionChange={onSectionChange}
            expandedItems={expandedItems}
            toggleExpanded={toggleExpanded}
          />
          <MenuGroup
            items={systemItems.filter(item => ['schools', 'users', 'company-management'].includes(item.id))}
            groupLabel="Management"
            activeSection={activeSection}
            onSectionChange={onSectionChange}
            expandedItems={expandedItems}
            toggleExpanded={toggleExpanded}
          />
          <MenuGroup
            items={systemItems.filter(item => ['billing', 'system-health'].includes(item.id))}
            groupLabel="System"
            activeSection={activeSection}
            onSectionChange={onSectionChange}
            expandedItems={expandedItems}
            toggleExpanded={toggleExpanded}
          />
          <MenuGroup
            items={communicationItems}
            groupLabel="Communication"
            activeSection={activeSection}
            onSectionChange={onSectionChange}
            expandedItems={expandedItems}
            toggleExpanded={toggleExpanded}
          />
          <MenuGroup
            items={otherItems.filter(item => ['reports', 'support'].includes(item.id))}
            groupLabel="Tools"
            activeSection={activeSection}
            onSectionChange={onSectionChange}
            expandedItems={expandedItems}
            toggleExpanded={toggleExpanded}
          />
          <MenuGroup
            items={otherItems.filter(item => ['system-settings', 'security'].includes(item.id))}
            groupLabel="Settings"
            activeSection={activeSection}
            onSectionChange={onSectionChange}
            expandedItems={expandedItems}
            toggleExpanded={toggleExpanded}
          />
        </>
      ) : (
        <>
          <MenuGroup
            items={systemItems.filter(item => ['dashboard'].includes(item.id))}
            activeSection={activeSection}
            onSectionChange={onSectionChange}
            expandedItems={expandedItems}
            toggleExpanded={toggleExpanded}
          />
          {schoolItems.length > 0 && (
            <MenuGroup
              items={schoolItems}
              groupLabel="Academic"
              activeSection={activeSection}
              onSectionChange={onSectionChange}
              expandedItems={expandedItems}
              toggleExpanded={toggleExpanded}
            />
          )}
          {financeItems.length > 0 && (
            <MenuGroup
              items={financeItems}
              groupLabel="Finance"
              activeSection={activeSection}
              onSectionChange={onSectionChange}
              expandedItems={expandedItems}
              toggleExpanded={toggleExpanded}
            />
          )}
          {communicationItems.length > 0 && (
            <MenuGroup
              items={communicationItems}
              groupLabel="Communication"
              activeSection={activeSection}
              onSectionChange={onSectionChange}
              expandedItems={expandedItems}
              toggleExpanded={toggleExpanded}
            />
          )}
          {otherItems.length > 0 && (
            <MenuGroup
              items={otherItems}
              groupLabel="Tools"
              activeSection={activeSection}
              onSectionChange={onSectionChange}
              expandedItems={expandedItems}
              toggleExpanded={toggleExpanded}
            />
          )}
        </>
      )}
    </SidebarContent>
  );
};

export default SidebarNavigation;
