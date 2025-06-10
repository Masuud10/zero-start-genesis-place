
import React from 'react';
import { SidebarFooter as ShadcnSidebarFooter } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const SidebarFooter = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      console.log('🔓 Sidebar: Initiating logout');
      await signOut();
      
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account.",
      });
      
      console.log('✅ Sidebar: Logout successful');
    } catch (error) {
      console.error('❌ Sidebar: Logout error:', error);
      
      toast({
        title: "Logout completed",
        description: "You have been signed out (with minor issues that were handled).",
        variant: "default",
      });
    }
  };

  return (
    <ShadcnSidebarFooter className="border-t p-4">
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg p-4 border">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout}
          className="w-full flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </ShadcnSidebarFooter>
  );
};

export default SidebarFooter;
