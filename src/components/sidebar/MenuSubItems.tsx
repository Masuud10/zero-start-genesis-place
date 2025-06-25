
import React from 'react';
import { MenuItem as MenuItemType } from './SidebarMenuItems';
import { MenuItem } from './MenuItem';

interface MenuSubItemsProps {
  subItems: MenuItemType[];
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const MenuSubItems: React.FC<MenuSubItemsProps> = ({
  subItems,
  activeSection,
  onSectionChange
}) => {
  return (
    <div className="ml-6 mt-1 space-y-1">
      {subItems.map((subItem) => (
        <MenuItem
          key={subItem.id}
          item={subItem}
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          isSubItem={true}
        />
      ))}
    </div>
  );
};
