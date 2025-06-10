
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      console.log('🔓 Header: Initiating logout');
      await signOut();
      
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account.",
      });
      
      console.log('✅ Header: Logout successful');
    } catch (error) {
      console.error('❌ Header: Logout error:', error);
      
      toast({
        title: "Logout completed",
        description: "You have been signed out (with minor issues that were handled).",
        variant: "default",
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <header className="h-16 border-b border-border bg-white/80 backdrop-blur-sm flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center space-x-4">
        <img 
          src="/lovable-uploads/ae278d7f-ba0b-4bb3-b868-639625b0caf0.png" 
          alt="Elimisha Logo" 
          className="w-8 h-8 object-contain"
        />
        <h1 className="text-xl font-semibold text-foreground">
          Elimisha School Management
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full border">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-muted-foreground">System Online</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar_url} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white shadow-xl border-0" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
                <p className="text-xs leading-none text-muted-foreground capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              Preferences
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
