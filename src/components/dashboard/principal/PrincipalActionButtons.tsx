
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  UserPlus, 
  Users, 
  School, 
  Plus, 
  Award,
  Calendar,
  FileText,
  BookOpen,
  Settings
} from 'lucide-react';

interface PrincipalActionButtonsProps {
  onModalOpen: (modalType: string) => void;
}

const PrincipalActionButtons: React.FC<PrincipalActionButtonsProps> = ({ onModalOpen }) => {
  const actionButtons = [
    {
      title: "Add Student",
      description: "Register new students",
      icon: UserPlus,
      color: "bg-blue-600 hover:bg-blue-700",
      action: () => onModalOpen('studentAdmission')
    },
    {
      title: "Add Teacher",
      description: "Register new teachers",
      icon: Users,
      color: "bg-green-600 hover:bg-green-700",
      action: () => onModalOpen('teacherAdmission')
    },
    {
      title: "Add Class",
      description: "Create new classes",
      icon: School,
      color: "bg-purple-600 hover:bg-purple-700",
      action: () => onModalOpen('addClass')
    },
    {
      title: "Add Subject",
      description: "Add new subjects",
      icon: BookOpen,
      color: "bg-orange-600 hover:bg-orange-700",
      action: () => onModalOpen('add-subject')
    },
    {
      title: "Assign Subjects",
      description: "Assign subjects to teachers",
      icon: Settings,
      color: "bg-indigo-600 hover:bg-indigo-700",
      action: () => onModalOpen('assign-subject')
    },
    {
      title: "Generate Certificate",
      description: "Create student certificates",
      icon: Award,
      color: "bg-yellow-600 hover:bg-yellow-700",
      action: () => onModalOpen('generate-certificate')
    },
    {
      title: "Generate Timetable",
      description: "Create class timetables",
      icon: Calendar,
      color: "bg-teal-600 hover:bg-teal-700",
      action: () => onModalOpen('generate-timetable')
    },
    {
      title: "Generate Reports",
      description: "Create school reports",
      icon: FileText,
      color: "bg-pink-600 hover:bg-pink-700",
      action: () => onModalOpen('reports')
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actionButtons.map((button, index) => (
            <Button
              key={index}
              onClick={button.action}
              className={`${button.color} text-white h-auto p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform`}
            >
              <button.icon className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium text-sm">{button.title}</div>
                <div className="text-xs opacity-90">{button.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PrincipalActionButtons;
