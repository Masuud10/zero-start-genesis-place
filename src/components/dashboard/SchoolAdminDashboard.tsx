
import React from 'react';
import { AuthUser } from '@/types/auth';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, Calendar, DollarSign, Plus, BarChart3 } from 'lucide-react';

interface SchoolAdminDashboardProps {
  user: AuthUser;
  onModalOpen: (modalType: string) => void;
}

const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({
  user,
  onModalOpen
}) => {
  const { schoolId } = useSchoolScopedData();

  const quickActions = [
    {
      title: 'Add User',
      description: 'Create new teachers, staff, or admins',
      icon: Users,
      action: () => onModalOpen('create-user'),
      color: 'bg-blue-500'
    },
    {
      title: 'Create Class',
      description: 'Set up a new class',
      icon: BookOpen,
      action: () => onModalOpen('create-class'),
      color: 'bg-green-500'
    },
    {
      title: 'Schedule Event',
      description: 'Add events to the school calendar',
      icon: Calendar,
      action: () => onModalOpen('create-event'),
      color: 'bg-purple-500'
    },
    {
      title: 'Financial Reports',
      description: 'View school financial data',
      icon: DollarSign,
      action: () => onModalOpen('financial-reports'),
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">School Management</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user.name}! Manage your school operations from here.
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => onModalOpen('create-user')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* School Info Alert */}
      {!schoolId && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">School Assignment Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700">
              Your account needs to be properly linked to a school. Please contact the system administrator.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Loading...</div>
            <p className="text-xs text-gray-500 mt-1">Active enrollment</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Teaching Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Loading...</div>
            <p className="text-xs text-gray-500 mt-1">Active teachers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Loading...</div>
            <p className="text-xs text-gray-500 mt-1">Active classes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Loading...</div>
            <p className="text-xs text-gray-500 mt-1">Fee collections</p>
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
          <CardTitle>Recent School Activity</CardTitle>
          <CardDescription>
            Latest activities in your school
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-gray-500 text-center py-8">
              Activity feed will show real school data once students and classes are added
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolAdminDashboard;
