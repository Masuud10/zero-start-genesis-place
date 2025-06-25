
import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { MenuItem as MenuItemType } from './SidebarMenuItems';
import { MenuItem } from './MenuItem';

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
  const Icon = item.icon;

  const handleToggle = () => {
    onToggleExpanded(item.id);
  };

  const isActive = activeSection === item.id || 
    (item.subItems && item.subItems.some(subItem => activeSection === subItem.id));

  return (
    <div>
      {/* Group Header */}
      <button
        onClick={handleToggle}
        className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
          isActive
            ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      {/* Sub Items */}
      {isExpanded && item.subItems && (
        <div className="ml-6 mt-1 space-y-1">
          {item.subItems.map((subItem) => (
            <MenuItem
              key={subItem.id}
              item={subItem}
              activeSection={activeSection}
              onSectionChange={onSectionChange}
              isSubItem={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};
