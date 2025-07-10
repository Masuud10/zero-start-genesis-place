import React from "react";
import { MenuItem as MenuItemType } from "./SidebarMenuItems";

interface MenuItemProps {
  item: MenuItemType;
  activeSection: string;
  onSectionChange: (section: string) => void;
  isSubItem?: boolean;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  item,
  activeSection,
  onSectionChange,
  isSubItem = false,
}) => {
  const Icon = item.icon;
  const isActive = activeSection === item.id;

  const handleClick = () => {
    onSectionChange(item.id);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
        isActive
          ? "bg-blue-50 text-blue-700 border border-blue-200"
          : "text-gray-700 hover:bg-gray-100 border border-transparent"
      } ${isSubItem ? "" : "px-3 py-2 text-sm"}`}
    >
      <Icon className={`flex-shrink-0 ${isSubItem ? "h-3 w-3" : "h-4 w-4"}`} />
      <span className="flex-1 text-left truncate">{item.label}</span>
    </button>
  );
};
