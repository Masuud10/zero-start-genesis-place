
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getMenuItems } from './SidebarMenuItems';
import { SidebarContent } from '@/components/ui/sidebar';
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

  console.log('📋 SidebarNavigation: Filtered menu items:', filteredItems.length);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSectionChange = (section: string) => {
    console.log('🎯 SidebarNavigation: Section change requested:', section);
    onSectionChange(section);
  };

  return (
    <SidebarContent>
      <div className="px-3 py-2">
        <div className="space-y-1">
          {filteredItems.map((item) => (
            <div key={item.id}>
              {item.subItems ? (
                <MenuGroup
                  item={item}
                  activeSection={activeSection}
                  expandedItems={expandedItems}
                  onToggleExpanded={toggleExpanded}
                  onSectionChange={handleSectionChange}
                />
              ) : (
                <MenuItem
                  item={item}
                  activeSection={activeSection}
                  onSectionChange={handleSectionChange}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </SidebarContent>
  );
};

export default SidebarNavigation;
