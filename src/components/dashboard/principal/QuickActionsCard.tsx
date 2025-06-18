
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Users, GraduationCap, BookOpen, UserCheck } from 'lucide-react';

interface QuickActionsCardProps {
  onAddTeacher: () => void;
  onAddParent: () => void;
  onAddClass: () => void;
  onAddSubject: () => void;
  onSubjectAssignment?: () => void;
}

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  onAddTeacher,
  onAddParent,
  onAddClass,
  onAddSubject,
  onSubjectAssignment
}) => {
  return (
    <Card className="shadow-lg border-0 rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl">
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <p className="text-blue-100 text-sm">Manage your school efficiently</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button 
            onClick={onAddTeacher}
            className="h-20 flex-col gap-2 bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Users className="h-6 w-6" />
            <span className="text-sm font-medium">Add Teacher</span>
          </Button>
          
          <Button 
            onClick={onAddParent}
            className="h-20 flex-col gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            <UserPlus className="h-6 w-6" />
            <span className="text-sm font-medium">Add Parent</span>
          </Button>
          
          <Button 
            onClick={onAddClass}
            className="h-20 flex-col gap-2 bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            <GraduationCap className="h-6 w-6" />
            <span className="text-sm font-medium">Add Class</span>
          </Button>
          
          <Button 
            onClick={onAddSubject}
            className="h-20 flex-col gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            <BookOpen className="h-6 w-6" />
            <span className="text-sm font-medium">Add Subject</span>
          </Button>

          {onSubjectAssignment && (
            <Button 
              onClick={onSubjectAssignment}
              className="h-20 flex-col gap-2 bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <UserCheck className="h-6 w-6" />
              <span className="text-sm font-medium">Subject Assignment</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
