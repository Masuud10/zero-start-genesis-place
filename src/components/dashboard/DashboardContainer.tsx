
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, User, Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuthUser } from '@/types/auth';
import { School } from '@/types/school';
import DashboardGreeting from './DashboardGreeting';

interface DashboardContainerProps {
  user: AuthUser;
  currentSchool: School | null;
  onLogout: () => void;
  showHeader?: boolean;
  showGreetings?: boolean;
  children: React.ReactNode;
}

const DashboardContainer: React.FC<DashboardContainerProps> = ({
  user,
  currentSchool,
  onLogout,
  showHeader = true,
  showGreetings = true,
  children
}) => {
  console.log('🏗️ DashboardContainer: Rendering with user:', user?.email, 'school:', currentSchool?.name, 'showGreetings:', showGreetings);

  if (!user) {
    console.log('🏗️ DashboardContainer: No user provided, showing error');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access the dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'edufam_admin':
        return 'EduFam Admin';
      case 'school_owner':
        return 'School Owner';
      case 'principal':
        return 'Principal';
      case 'teacher':
        return 'Teacher';
      case 'finance_officer':
        return 'Finance Officer';
      case 'parent':
        return 'Parent';
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'edufam_admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'school_owner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'principal':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'teacher':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'finance_officer':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'parent':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getFirstName = (fullName: string) => {
    return fullName?.split(" ")[0] || "User";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Greetings Container - Only show when showGreetings is true */}
      {showGreetings && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              
              {/* Main Greeting Section - Center */}
              <div className="flex-1 text-center">
                <div className="space-y-1">
                  {/* Welcome Message */}
                  <div>
                    <h1 className="text-lg md:text-xl font-bold text-gray-900 mb-0.5">
                      {getGreeting()}, {getFirstName(user?.name || "User")}! 👋
                    </h1>
                    <p className="text-gray-600 text-xs">
                      Welcome back to your dashboard
                    </p>
                  </div>
                  
                  {/* Role and School Info */}
                  <div className="flex items-center justify-center space-x-2 flex-wrap gap-1">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500 font-medium">Role:</span>
                      <Badge className={`${getRoleBadgeColor(user.role)} font-medium px-1.5 py-0.5 text-xs`}>
                        {getRoleDisplayName(user.role)}
                      </Badge>
                    </div>
                    
                    {currentSchool && (
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-400 text-xs">•</span>
                        <span className="text-xs text-gray-500 font-medium">School:</span>
                        <span className="text-gray-700 font-semibold bg-white/70 px-1.5 py-0.5 rounded-full text-xs">
                          {currentSchool.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div className="text-xs text-gray-500 font-medium">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </div>
                </div>
              </div>

              {/* Right side - User Actions */}
              <div className="flex items-center space-x-2">
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative text-gray-600 hover:text-gray-900 hover:bg-white/50 transition-colors p-2">
                  <Bell className="h-4 w-4" />
                  <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                </Button>

                {/* User Profile */}
                <div className="flex items-center space-x-2 bg-white/60 rounded-lg px-2 py-1 border border-white/40">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 text-white" />
                  </div>
                  <div className="hidden md:block text-xs">
                    <div className="font-semibold text-gray-900 text-xs">{user.email?.split('@')[0]}</div>
                    <div className="text-gray-500 text-[10px]">{user.email}</div>
                  </div>
                </div>

                {/* Settings */}
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-white/50 transition-colors p-2">
                  <Settings className="h-4 w-4" />
                </Button>
                
                {/* Logout */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onLogout}
                  className="text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors p-2"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardContainer;
