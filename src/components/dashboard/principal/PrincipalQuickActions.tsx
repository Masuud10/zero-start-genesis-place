
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, GraduationCap, Library, BookOpen } from 'lucide-react';

interface PrincipalQuickActionsProps {
  onAddParent: () => void;
  onAddTeacher: () => void;
  onAddClass: () => void;
  onAddSubject: () => void;
}

const PrincipalQuickActions: React.FC<PrincipalQuickActionsProps> = ({
  onAddParent,
  onAddTeacher,
  onAddClass,
  onAddSubject,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Button
        variant="outline"
        className="h-20 flex-col gap-2 p-4"
        onClick={onAddTeacher}
      >
        <GraduationCap className="h-6 w-6" />
        <div className="text-center">
          <div className="font-medium text-sm">Add Teacher</div>
          <div className="text-xs text-muted-foreground">Register new teaching staff</div>
        </div>
      </Button>

      <Button
        variant="outline"
        className="h-20 flex-col gap-2 p-4"
        onClick={onAddParent}
      >
        <UserPlus className="h-6 w-6" />
        <div className="text-center">
          <div className="font-medium text-sm">Add Parent</div>
          <div className="text-xs text-muted-foreground">Register new parent</div>
        </div>
      </Button>
      
      <Button
        variant="outline"
        className="h-20 flex-col gap-2 p-4"
        onClick={onAddClass}
      >
        <Library className="h-6 w-6" />
        <div className="text-center">
          <div className="font-medium text-sm">Add Class</div>
          <div className="text-xs text-muted-foreground">Create a new class</div>
        </div>
      </Button>

      <Button
        variant="outline"
        className="h-20 flex-col gap-2 p-4"
        onClick={onAddSubject}
      >
        <BookOpen className="h-6 w-6" />
        <div className="text-center">
          <div className="font-medium text-sm">Add Subject</div>
          <div className="text-xs text-muted-foreground">Create a new subject</div>
        </div>
      </Button>
    </div>
  );
};

export default PrincipalQuickActions;
