
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, School, BookOpen, Calendar, FileText, Settings } from 'lucide-react';

interface SchoolAdminQuickActionsProps {
  onModalOpen: (modalType: string) => void;
}

const SchoolAdminQuickActions: React.FC<SchoolAdminQuickActionsProps> = ({ onModalOpen }) => {
  const actions = [
    {
      title: 'Add Student',
      icon: UserPlus,
      action: () => onModalOpen('studentAdmission'),
      color: 'bg-blue-50 hover:bg-blue-100 text-blue-700'
    },
    {
      title: 'Add Teacher',
      icon: UserPlus,
      action: () => onModalOpen('teacherAdmission'),
      color: 'bg-green-50 hover:bg-green-100 text-green-700'
    },
    {
      title: 'Add Class',
      icon: School,
      action: () => onModalOpen('addClass'),
      color: 'bg-purple-50 hover:bg-purple-100 text-purple-700'
    },
    {
      title: 'Add Subject',
      icon: BookOpen,
      action: () => onModalOpen('addSubject'),
      color: 'bg-orange-50 hover:bg-orange-100 text-orange-700'
    },
    {
      title: 'Manage Timetable',
      icon: Calendar,
      action: () => onModalOpen('timetable'),
      color: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
    },
    {
      title: 'View Reports',
      icon: FileText,
      action: () => onModalOpen('reports'),
      color: 'bg-pink-50 hover:bg-pink-100 text-pink-700'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className={`h-auto p-4 flex flex-col items-center gap-2 ${action.color}`}
                onClick={action.action}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium">{action.title}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolAdminQuickActions;
