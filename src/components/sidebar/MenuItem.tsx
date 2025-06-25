
import React from 'react';
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { MenuItem as MenuItemType } from './SidebarMenuItems';

interface MenuItemProps {
  item: MenuItemType;
  activeSection: string;
  onSectionChange: (section: string) => void;
  expandedItems: string[];
  toggleExpanded: (itemId: string) => void;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  item,
  activeSection,
  onSectionChange,
  expandedItems,
  toggleExpanded,
}) => {
  const IconComponent = item.icon;
  const isActive = activeSection === item.id;
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const isExpanded = expandedItems.includes(item.id);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => {
          if (hasSubItems) {
            toggleExpanded(item.id);
          } else {
            onSectionChange(item.id);
          }
        }}
        isActive={isActive && !hasSubItems}
        className="w-full justify-start"
      >
        <IconComponent className="w-4 h-4" />
        <span>{item.label}</span>
        {hasSubItems && (
          isExpanded ? 
            <ChevronDown className="w-4 h-4 ml-auto" /> : 
            <ChevronRight className="w-4 h-4 ml-auto" />
        )}
      </SidebarMenuButton>
      {hasSubItems && isExpanded && (
        <SidebarMenuSub>
          {item.subItems?.map((subItem) => {
            const SubIconComponent = subItem.icon;
            const isSubActive = activeSection === subItem.id;
            
            return (
              <SidebarMenuSubItem key={subItem.id}>
                <SidebarMenuSubButton
                  onClick={() => onSectionChange(subItem.id)}
                  isActive={isSubActive}
                >
                  <SubIconComponent className="w-4 h-4" />
                  <span>{subItem.label}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            );
          })}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
};
