
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, User, Bell, School } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuthUser } from '@/types/auth';

interface School {
  id: string;
  name: string;
  ownerId: string;
  principalId: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  settings: {
    academicYear: string;
    terms: string[];
    gradeReleaseEnabled: boolean;
    attendanceEnabled: boolean;
  };
}

interface DashboardContainerProps {
  user: AuthUser;
  currentSchool: School | null;
  onLogout: () => void;
  showHeader?: boolean;
  children: React.ReactNode;
}

const DashboardContainer: React.FC<DashboardContainerProps> = ({
  user,
  currentSchool,
  onLogout,
  showHeader = true,
  children
}) => {
  console.log('🏗️ DashboardContainer: Rendering with user:', user?.email, 'school:', currentSchool?.name);

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
      case 'elimisha_admin':
        return 'Elimisha Admin';
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
      case 'elimisha_admin':
        return 'bg-purple-100 text-purple-800';
      case 'edufam_admin':
        return 'bg-blue-100 text-blue-800';
      case 'school_owner':
        return 'bg-green-100 text-green-800';
      case 'principal':
        return 'bg-orange-100 text-orange-800';
      case 'teacher':
        return 'bg-cyan-100 text-cyan-800';
      case 'finance_officer':
        return 'bg-yellow-100 text-yellow-800';
      case 'parent':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showHeader && (
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Left side - Logo and School Info */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <School className="h-8 w-8 text-blue-600" />
                  <span className="text-xl font-bold text-gray-900">EduFam</span>
                </div>
                
                {currentSchool && (
                  <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                    <span>/</span>
                    <span className="font-medium">{currentSchool.name}</span>
                  </div>
                )}
              </div>

              {/* Right side - User info and actions */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <Bell className="h-5 w-5" />
                </Button>

                {/* User info */}
                <div className="flex items-center space-x-3">
                  <div className="hidden md:block text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name || user.email?.split('@')[0] || 'User'}
                    </div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                  
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {getRoleDisplayName(user.role)}
                  </Badge>
                  
                  <Button variant="ghost" size="sm" className="text-gray-600">
                    <User className="h-5 w-5" />
                  </Button>
                </div>

                {/* Settings and Logout */}
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="text-gray-600">
                    <Settings className="h-5 w-5" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onLogout}
                    className="text-gray-600 hover:text-red-600"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>
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
