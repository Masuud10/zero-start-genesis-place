
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
      variant: 'default' as const,
      color: 'bg-blue-500 hover:bg-blue-600 text-white'
    },
    {
      id: 'teacherAdmission',
      icon: UserPlus,
      label: 'Add Teacher',
      description: 'Register new teacher',
      variant: 'default' as const,
      color: 'bg-green-500 hover:bg-green-600 text-white'
    },
    {
      id: 'add-subject',
      icon: BookOpen,
      label: 'Add Subject',
      description: 'Create new subject',
      variant: 'default' as const,
      color: 'bg-purple-500 hover:bg-purple-600 text-white'
    },
    {
      id: 'assign-subject',
      icon: Plus,
      label: 'Assign Teacher',
      description: 'Assign teacher to subject',
      variant: 'outline' as const,
      color: 'border-orange-500 text-orange-600 hover:bg-orange-50'
    },
    {
      id: 'generate-certificate',
      icon: Award,
      label: 'Generate Certificate',
      description: 'Create student certificate',
      variant: 'outline' as const,
      color: 'border-amber-500 text-amber-600 hover:bg-amber-50'
    },
    {
      id: 'reports',
      icon: FileText,
      label: 'Generate Reports',
      description: 'Create academic reports',
      variant: 'outline' as const,
      color: 'border-gray-500 text-gray-600 hover:bg-gray-50'
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
              className={`h-auto flex flex-col items-center gap-2 p-4 text-center transition-all duration-200 ${action.color}`}
              onClick={() => onModalOpen(action.id)}
            >
              <action.icon className="h-5 w-5" />
              <div>
                <div className="text-xs font-medium">{action.label}</div>
                <div className="text-xs opacity-80 mt-1">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </div>
  );
};

export default PrincipalActionButtons;
