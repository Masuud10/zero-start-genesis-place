
import React from 'react';
import {
  Sidebar,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { BookOpen } from 'lucide-react';
import SidebarNavigation from './sidebar/SidebarNavigation';
import { useNavigation } from '@/contexts/NavigationContext';

const AppSidebar: React.FC = () => {
  const { activeSection, onSectionChange } = useNavigation();
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              EduFam
            </span>
            <div className="text-xs text-gray-500 font-medium">School Management</div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarNavigation 
        activeSection={activeSection} 
        onSectionChange={onSectionChange} 
      />
    </Sidebar>
  );
};

export default AppSidebar;
