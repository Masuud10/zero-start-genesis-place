
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  UserPlus, 
  Calendar,
  FileText,
  Award,
  ClipboardList,
  Plus
} from 'lucide-react';

interface PrincipalActionButtonsProps {
  onModalOpen: (modalType: string) => void;
}

const PrincipalActionButtons: React.FC<PrincipalActionButtonsProps> = ({ onModalOpen }) => {
  const actionButtons = [
    {
      id: 'studentAdmission',
      label: 'Add Student',
      icon: UserPlus,
      description: 'Register new students',
      color: 'text-blue-600 hover:bg-blue-50'
    },
    {
      id: 'teacherAdmission',
      label: 'Add Teacher',
      icon: Users,
      description: 'Add teaching staff',
      color: 'text-green-600 hover:bg-green-50'
    },
    {
      id: 'addClass',
      label: 'Add Class',
      icon: GraduationCap,
      description: 'Create new classes',
      color: 'text-purple-600 hover:bg-purple-50'
    },
    {
      id: 'add-subject',
      label: 'Add Subject',
      icon: BookOpen,
      description: 'Add new subjects',
      color: 'text-orange-600 hover:bg-orange-50'
    },
    {
      id: 'assign-subject',
      label: 'Assign Teacher',
      icon: ClipboardList,
      description: 'Assign teachers to subjects',
      color: 'text-indigo-600 hover:bg-indigo-50'
    },
    {
      id: 'generate-timetable',
      label: 'Generate Timetable',
      icon: Calendar,
      description: 'Create class timetables',
      color: 'text-teal-600 hover:bg-teal-50'
    },
    {
      id: 'generate-certificate',
      label: 'Generate Certificate',
      icon: Award,
      description: 'Create student certificates',
      color: 'text-yellow-600 hover:bg-yellow-50'
    },
    {
      id: 'reports',
      label: 'Generate Reports',
      icon: FileText,
      description: 'Create PDF reports',
      color: 'text-red-600 hover:bg-red-50'
    }
  ];

  return (
    <CardContent className="p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actionButtons.map((button) => {
          const IconComponent = button.icon;
          return (
            <Button
              key={button.id}
              variant="outline"
              className={`h-20 flex flex-col items-center gap-2 ${button.color} border-gray-200 transition-all duration-200`}
              onClick={() => onModalOpen(button.id)}
            >
              <IconComponent className="h-6 w-6" />
              <span className="text-sm font-medium">{button.label}</span>
            </Button>
          );
        })}
      </div>
    </CardContent>
  );
};

export default PrincipalActionButtons;
