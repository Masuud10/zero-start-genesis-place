
import React from 'react';
import { AuthUser } from '@/types/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { School, Users, BarChart3, Settings, Plus } from 'lucide-react';

interface SystemAdminDashboardProps {
  user: AuthUser;
  onModalOpen: (modalType: string) => void;
}

const SystemAdminDashboard: React.FC<SystemAdminDashboardProps> = ({
  user,
  onModalOpen
}) => {
  const quickActions = [
    {
      title: 'Create School',
      description: 'Add a new school to the platform',
      icon: School,
      action: () => onModalOpen('create-school'),
      color: 'bg-blue-500'
    },
    {
      title: 'Manage Users',
      description: 'View and manage all platform users',
      icon: Users,
      action: () => onModalOpen('manage-users'),
      color: 'bg-green-500'
    },
    {
      title: 'System Analytics',
      description: 'View platform-wide analytics',
      icon: BarChart3,
      action: () => onModalOpen('system-analytics'),
      color: 'bg-purple-500'
    },
    {
      title: 'Platform Settings',
      description: 'Configure system-wide settings',
      icon: Settings,
      action: () => onModalOpen('platform-settings'),
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user.name}! Manage the entire EduFam platform from here.
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => onModalOpen('create-school')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create School
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Schools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Loading...</div>
            <p className="text-xs text-gray-500 mt-1">Active institutions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Loading...</div>
            <p className="text-xs text-gray-500 mt-1">Platform users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Loading...</div>
            <p className="text-xs text-gray-500 mt-1">Enrolled students</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Excellent</div>
            <p className="text-xs text-gray-500 mt-1">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-2`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle className="text-sm font-medium">{action.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs mb-3">
                    {action.description}
                  </CardDescription>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={action.action}
                    className="w-full"
                  >
                    Open
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Platform Activity</CardTitle>
          <CardDescription>
            Latest activities across all schools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-gray-500 text-center py-8">
              Activity feed will be populated with real data from schools
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemAdminDashboard;
