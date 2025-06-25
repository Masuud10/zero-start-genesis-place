
import React from 'react';
import { MenuItem as MenuItemType } from './SidebarMenuItems';
import { MenuGroupHeader } from './MenuGroupHeader';
import { MenuSubItems } from './MenuSubItems';

interface MenuGroupProps {
  item: MenuItemType;
  activeSection: string;
  expandedItems: string[];
  onToggleExpanded: (itemId: string) => void;
  onSectionChange: (section: string) => void;
}

export const MenuGroup: React.FC<MenuGroupProps> = ({
  item,
  activeSection,
  expandedItems,
  onToggleExpanded,
  onSectionChange
}) => {
  const isExpanded = expandedItems.includes(item.id);

  const handleToggle = () => {
    onToggleExpanded(item.id);
  };

  const isActive = activeSection === item.id || 
    (item.subItems && item.subItems.some(subItem => activeSection === subItem.id));

  return (
    <div>
      <MenuGroupHeader
        item={item}
        isExpanded={isExpanded}
        isActive={isActive}
        onToggle={handleToggle}
      />

      {isExpanded && item.subItems && item.subItems.length > 0 && (
        <MenuSubItems
          subItems={item.subItems}
          activeSection={activeSection}
          onSectionChange={onSectionChange}
        />
      )}
    </div>
  );
};
