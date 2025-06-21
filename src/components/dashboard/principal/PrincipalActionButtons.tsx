
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Users, BookOpen, Award, UserPlus } from 'lucide-react';

interface PrincipalActionButtonsProps {
  onModalOpen: (modalType: string) => void;
}

const PrincipalActionButtons: React.FC<PrincipalActionButtonsProps> = ({ onModalOpen }) => {
  const actionButtons = [
    {
      id: 'studentAdmission',
      icon: Users,
      label: 'Add Student',
      description: 'Register new student',
      variant: 'outline' as const
    },
    {
      id: 'teacherAdmission',
      icon: UserPlus,
      label: 'Add Teacher',
      description: 'Register new teacher',
      variant: 'outline' as const
    },
    {
      id: 'add-subject',
      icon: BookOpen,
      label: 'Add Subject',
      description: 'Create new subject',
      variant: 'outline' as const
    },
    {
      id: 'assign-subject',
      icon: Plus,
      label: 'Assign Teacher',
      description: 'Assign teacher to subject',
      variant: 'outline' as const
    },
    {
      id: 'generate-certificate',
      icon: Award,
      label: 'Generate Certificate',
      description: 'Create student certificate',
      variant: 'outline' as const
    },
    {
      id: 'reports',
      icon: FileText,
      label: 'Generate Reports',
      description: 'Create academic reports',
      variant: 'outline' as const
    }
  ];

  return (
    <div className="p-6">
      <CardHeader className="px-0 pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {actionButtons.map((action) => (
            <Button
              key={action.id}
              variant={action.variant}
              size="sm"
              className="h-auto flex flex-col items-center gap-2 p-4 text-center transition-all duration-200 border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => onModalOpen(action.id)}
            >
              <action.icon className="h-5 w-5" />
              <div>
                <div className="text-xs font-medium">{action.label}</div>
                <div className="text-xs opacity-70 mt-1">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </div>
  );
};

export default PrincipalActionButtons;
