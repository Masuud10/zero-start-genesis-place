
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Users, BookOpen, GraduationCap, Settings } from 'lucide-react';

interface QuickActionsCardProps {
  onAddTeacher: () => void;
  onAddParent: () => void;
  onAddClass: () => void;
  onAddSubject: () => void;
  onSubjectAssignment: () => void;
}

const QuickActionsCard = ({
  onAddTeacher,
  onAddParent,
  onAddClass,
  onAddSubject,
  onSubjectAssignment,
}: QuickActionsCardProps) => {
  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <p className="text-gray-600 text-sm">Manage your school efficiently</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Button
            variant="outline"
            className="h-20 flex-col gap-2 hover:bg-gray-50"
            onClick={onAddTeacher}
          >
            <UserPlus className="h-5 w-5" />
            <span className="text-sm font-medium">Add Teacher</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex-col gap-2 hover:bg-gray-50"
            onClick={onAddParent}
          >
            <Users className="h-5 w-5" />
            <span className="text-sm font-medium">Add Parent</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex-col gap-2 hover:bg-gray-50"
            onClick={onAddClass}
          >
            <GraduationCap className="h-5 w-5" />
            <span className="text-sm font-medium">Add Class</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex-col gap-2 hover:bg-gray-50"
            onClick={onAddSubject}
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-sm font-medium">Add Subject</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex-col gap-2 hover:bg-gray-50"
            onClick={onSubjectAssignment}
          >
            <Settings className="h-5 w-5" />
            <span className="text-sm font-medium">Assign Subject</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
