
import React from 'react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from '@/components/ui/sidebar';
import { MenuItem, MenuItem as MenuItemComponent } from './MenuItem';

interface MenuGroupProps {
  items: MenuItem[];
  groupLabel?: string;
  activeSection: string;
  onSectionChange: (section: string) => void;
  expandedItems: string[];
  toggleExpanded: (itemId: string) => void;
}

export const MenuGroup: React.FC<MenuGroupProps> = ({
  items,
  groupLabel,
  activeSection,
  onSectionChange,
  expandedItems,
  toggleExpanded,
}) => {
  if (items.length === 0) return null;
  
  return (
    <SidebarGroup>
      {groupLabel && <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(item => (
            <MenuItemComponent
              key={item.id}
              item={item}
              activeSection={activeSection}
              onSectionChange={onSectionChange}
              expandedItems={expandedItems}
              toggleExpanded={toggleExpanded}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
