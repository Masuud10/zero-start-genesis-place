import React, { useState } from "react";
import { getMenuItems } from "./SidebarMenuItems";
import { MenuGroup } from "./MenuGroup";
import { MenuItem } from "./MenuItem";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { Loader2 } from "lucide-react";

interface SidebarNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  activeSection,
  onSectionChange,
}) => {
  const { user } = useAuth();
  const { isReady, userRole } = useSchoolScopedData();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Wait for backend-validated role before rendering menu items
  if (!isReady || !userRole) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading navigation...
        </div>
      </div>
    );
  }

  // Use backend-validated role instead of user.role
  const menuItems = getMenuItems(userRole);

  const handleToggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
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
