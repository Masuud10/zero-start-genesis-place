
import React from 'react';
import { AuthUser } from '@/types/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, ClipboardCheck, Calendar } from 'lucide-react';

interface TeacherDashboardProps {
  user: AuthUser;
  onModalOpen: (modalType: string) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  user,
  onModalOpen
}) => {
  const quickActions = [
    {
      title: 'Mark Attendance',
      description: 'Record student attendance',
      icon: ClipboardCheck,
      action: () => onModalOpen('mark-attendance'),
      color: 'bg-green-500'
    },
    {
      title: 'Enter Grades',
      description: 'Input student grades',
      icon: BookOpen,
      action: () => onModalOpen('enter-grades'),
      color: 'bg-blue-500'
    },
    {
      title: 'View Classes',
      description: 'See your assigned classes',
      icon: Users,
      action: () => onModalOpen('my-classes'),
      color: 'bg-purple-500'
    },
    {
      title: 'Class Schedule',
      description: 'View your teaching schedule',
      icon: Calendar,
      action: () => onModalOpen('class-schedule'),
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user.name}! Manage your classes and students.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">My Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Loading...</div>
            <p className="text-xs text-gray-500 mt-1">Assigned classes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">My Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Loading...</div>
            <p className="text-xs text-gray-500 mt-1">Total students</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Grades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Loading...</div>
            <p className="text-xs text-gray-500 mt-1">Grades to submit</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Today's Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Loading...</div>
            <p className="text-xs text-gray-500 mt-1">Scheduled classes</p>
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

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>
            Your classes for today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-gray-500 text-center py-8">
              Schedule will be populated when classes are assigned to you
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
