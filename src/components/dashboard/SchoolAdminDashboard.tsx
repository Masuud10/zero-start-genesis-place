
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthUser } from '@/types/auth';
import { Building2, Users, BarChart3, GraduationCap, DollarSign, CalendarCheck } from 'lucide-react';

interface SchoolAdminDashboardProps {
  user: AuthUser;
  onModalOpen: (modalType: string) => void;
}

const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({ user, onModalOpen }) => {
  console.log('🏫 SchoolAdminDashboard: Rendering for school admin:', user.email, 'Role:', user.role);

  const quickActions = [
    { id: 'students', label: 'Manage Students', icon: Users, description: 'Add, edit student records' },
    { id: 'grades', label: 'Review Grades', icon: GraduationCap, description: 'Monitor academic performance' },
    { id: 'finance', label: 'Financial Overview', icon: DollarSign, description: 'Track fees and payments' },
    { id: 'attendance', label: 'Attendance Reports', icon: CalendarCheck, description: 'Monitor daily attendance' },
    { id: 'analytics', label: 'School Analytics', icon: BarChart3, description: 'Performance insights' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">School Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {user.name}! Here's what's happening at your school.
          </p>
        </div>
      </div>

      {/* School Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">245</div>
            <p className="text-xs text-muted-foreground">+5 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94.2%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fee Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">87.5%</div>
            <p className="text-xs text-muted-foreground">Current term</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">18</div>
            <p className="text-xs text-muted-foreground">All departments</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Access key school management features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="h-24 flex-col gap-2 p-4"
                onClick={() => onModalOpen(action.id)}
              >
                <action.icon className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolAdminDashboard;
