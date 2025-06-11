
import React from 'react';
import { Sidebar } from '@/components/ui/sidebar';
import SidebarHeader from '@/components/sidebar/SidebarHeader';
import SidebarNavigation from '@/components/sidebar/SidebarNavigation';
import SidebarFooter from '@/components/sidebar/SidebarFooter';

interface AppSidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ activeSection, onSectionChange }) => {
  console.log('🏠 AppSidebar: Rendering with activeSection:', activeSection);
  
  return (
    <Sidebar className="border-r">
      <SidebarHeader />
      <SidebarNavigation 
        activeSection={activeSection} 
        onSectionChange={onSectionChange} 
      />
      <SidebarFooter />
    </Sidebar>
  );
};

export default AppSidebar;
