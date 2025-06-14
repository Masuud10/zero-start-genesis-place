
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthUser } from '@/types/auth';
import { User, GraduationCap, CalendarCheck, DollarSign, MessageSquare } from 'lucide-react';

interface ParentDashboardProps {
  user: AuthUser;
  onModalOpen: (modalType: string) => void;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ user, onModalOpen }) => {
  console.log('👨‍👩‍👧‍👦 ParentDashboard: Rendering for parent:', user.email);

  const parentActions = [
    { id: 'grades', label: 'Child Grades', icon: GraduationCap, description: 'View academic performance' },
    { id: 'attendance', label: 'Attendance Record', icon: CalendarCheck, description: 'Check daily attendance' },
    { id: 'finance', label: 'School Fees', icon: DollarSign, description: 'Payment history & balance' },
    { id: 'messages', label: 'School Messages', icon: MessageSquare, description: 'Communications from school' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Parent Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome {user.name}! Stay connected with your child's education.
          </p>
        </div>
      </div>

      {/* Parent Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Children Enrolled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">2</div>
            <p className="text-xs text-muted-foreground">Active students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">96%</div>
            <p className="text-xs text-muted-foreground">Excellent attendance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fee Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">KES 5,200</div>
            <p className="text-xs text-muted-foreground">Due next week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">B+</div>
            <p className="text-xs text-muted-foreground">Mathematics</p>
          </CardContent>
        </Card>
      </div>

      {/* Parent Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Parent Portal
          </CardTitle>
          <CardDescription>
            Access your child's educational information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {parentActions.map((action) => (
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

export default ParentDashboard;
