
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, BarChart3, GraduationCap, DollarSign, CalendarCheck } from 'lucide-react';

interface SchoolAdminQuickActionsProps {
  onModalOpen: (modalType: string) => void;
}

const quickActions = [
  { id: 'students', label: 'Manage Students', icon: Users, description: 'Add, edit student records' },
  { id: 'grades', label: 'Review Grades', icon: GraduationCap, description: 'Monitor academic performance' },
  { id: 'finance', label: 'Financial Overview', icon: DollarSign, description: 'Track fees and payments' },
  { id: 'attendance', label: 'Attendance Reports', icon: CalendarCheck, description: 'Monitor daily attendance' },
  { id: 'analytics', label: 'School Analytics', icon: BarChart3, description: 'Performance insights' },
];

const SchoolAdminQuickActions: React.FC<SchoolAdminQuickActionsProps> = ({ onModalOpen }) => {
  return (
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
  );
};

export default SchoolAdminQuickActions;
