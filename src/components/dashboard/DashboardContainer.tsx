
import React from 'react';
import { User } from '@/types/auth';
import { School } from '@/types/school';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';

interface DashboardContainerProps {
  user: User;
  currentSchool?: School | null;
  onLogout: () => Promise<void>;
  children: React.ReactNode;
}

const DashboardContainer = ({ user, currentSchool, onLogout, children }: DashboardContainerProps) => {
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatUserName = (name: string) => {
    return name.split(' ')[0]; // Use first name only
  };

  const getCurrentDateTime = () => {
    return format(new Date(), 'EEEE, MMMM do, yyyy • h:mm a');
  };

  return (
    <div className="min-h-screen">
      {/* Top Header Container */}
      <Card className="rounded-none border-x-0 border-t-0 border-b shadow-sm bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4 md:p-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground">
              {getTimeBasedGreeting()}, {formatUserName(user.name)}!
            </h1>
            <p className="text-sm text-muted-foreground">
              {getCurrentDateTime()}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {currentSchool && (
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-foreground">{currentSchool.name}</p>
                <p className="text-xs text-muted-foreground">{user.role?.replace('_', ' ')}</p>
              </div>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url} alt={user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="w-[200px] truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={onLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <main className="p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardContainer;
