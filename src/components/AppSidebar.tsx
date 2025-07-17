
import React from 'react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
} from '@/components/ui/sidebar';
import { BookOpen, LogOut } from 'lucide-react';
import { AdminSidebarNavigation } from './sidebar/AdminSidebarNavigation';
import { useAdminAuthContext } from './auth/AdminAuthProvider';
import { Button } from '@/components/ui/button';

const AppSidebar: React.FC = () => {
  const { signOut, adminUser } = useAdminAuthContext();
  
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  return (
    <Sidebar className="border-r">
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
            <div className="text-xs text-muted-foreground font-medium">Admin Portal</div>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="flex flex-col h-full">
        <div className="flex-1">
          <AdminSidebarNavigation />
        </div>
        
        {/* Sign out button at bottom */}
        <div className="p-4 border-t">
          <Button 
            onClick={handleSignOut}
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
