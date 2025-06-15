
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, GraduationCap, DollarSign, BarChart3, Settings, FileText } from 'lucide-react';

interface SchoolManagementActionsProps {
  onAction: (action: string) => void;
}

const SchoolManagementActions: React.FC<SchoolManagementActionsProps> = ({ onAction }) => {
  const managementActions = [
    { id: 'students', label: 'Student Management', icon: Users, description: 'Manage enrollments' },
    { id: 'teachers', label: 'Staff Management', icon: GraduationCap, description: 'Manage teachers' },
    { id: 'finance', label: 'Financial Overview', icon: DollarSign, description: 'Revenue & expenses' },
    { id: 'analytics', label: 'School Analytics', icon: BarChart3, description: 'Performance metrics' },
    { id: 'reports', label: 'Reports', icon: FileText, description: 'Generate reports' },
    { id: 'settings', label: 'School Settings', icon: Settings, description: 'Configure school' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {managementActions.map((action) => (
        <Button
          key={action.id}
          variant="outline"
          className="h-24 flex-col gap-2 p-4"
          onClick={() => onAction(action.id)}
        >
          <action.icon className="h-6 w-6" />
          <div className="text-center">
            <div className="font-medium text-sm">{action.label}</div>
            <div className="text-xs text-muted-foreground">{action.description}</div>
          </div>
        </Button>
      ))}
    </div>
  );
};

export default SchoolManagementActions;
