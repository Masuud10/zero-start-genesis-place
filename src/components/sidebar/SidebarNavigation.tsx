import React, { useState } from 'react';
import { getMenuItems } from './SidebarMenuItems';
import { MenuGroup } from './MenuGroup';
import { MenuItem } from './MenuItem';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  activeSection,
  onSectionChange
}) => {
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const menuItems = getMenuItems(user?.role);

  const handleToggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <nav className="space-y-1">
      {menuItems.map((item) => {
        // If item has subItems, render as MenuGroup
        if (item.subItems && item.subItems.length > 0) {
          return (
            <MenuGroup
              key={item.id}
              item={item}
              activeSection={activeSection}
              expandedItems={expandedItems}
              onToggleExpanded={handleToggleExpanded}
              onSectionChange={onSectionChange}
            />
          );
        }

        // Otherwise render as regular MenuItem
        return (
          <MenuItem
            key={item.id}
            item={item}
            activeSection={activeSection}
            onSectionChange={onSectionChange}
          />
        );
      })}
    </nav>
  );
};
