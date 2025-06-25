
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, Settings, LogOut } from 'lucide-react';
import { AuthUser } from '@/types/auth';
import { School } from '@/types/school';
import UserProfileSettings from '@/components/user/UserProfileSettings';

interface UserProfileDropdownProps {
  user: AuthUser;
  currentSchool?: School | null;
  onLogout: () => Promise<void>;
}

const UserProfileDropdown = ({ user, currentSchool, onLogout }: UserProfileDropdownProps) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <div className="flex-shrink-0 ml-4 md:ml-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 md:h-12 md:w-12 rounded-full hover:shadow-lg transition-all">
              <Avatar className="h-10 w-10 md:h-12 md:w-12 ring-2 ring-blue-100">
                <AvatarImage src={user?.avatar_url} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 bg-white shadow-xl border-0 rounded-xl" align="end" forceMount>
            <DropdownMenuLabel className="font-normal p-4">
              <div className="flex flex-col space-y-2">
                <p className="text-base font-semibold leading-none">{user?.name}</p>
                <p className="text-sm leading-none text-muted-foreground">
                  {user?.email}
                </p>
                <p className="text-xs leading-none text-muted-foreground capitalize bg-blue-50 px-2 py-1 rounded-md">
                  {user?.role?.replace('_', ' ')}
                </p>
                {currentSchool && (
                  <p className="text-xs leading-none text-muted-foreground bg-green-50 px-2 py-1 rounded-md">
                    {currentSchool.name}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer hover:bg-blue-50 mx-2 rounded-lg flex items-center gap-2"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-destructive focus:text-destructive hover:bg-red-50 mx-2 rounded-lg flex items-center gap-2"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </DialogTitle>
          </DialogHeader>
          <UserProfileSettings />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserProfileDropdown;
