
import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { MenuItem } from './SidebarMenuItems';

interface MenuGroupHeaderProps {
  item: MenuItem;
  isExpanded: boolean;
  isActive: boolean;
  onToggle: () => void;
}

export const MenuGroupHeader: React.FC<MenuGroupHeaderProps> = ({
  item,
  isExpanded,
  isActive,
  onToggle
}) => {
  const Icon = item.icon;

  return (
    <button
      onClick={onToggle}
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
  );
};
