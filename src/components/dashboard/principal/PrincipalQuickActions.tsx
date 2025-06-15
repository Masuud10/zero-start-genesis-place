
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, GraduationCap } from 'lucide-react';

interface PrincipalQuickActionsProps {
  onAddParent: () => void;
  onAddTeacher: () => void;
}

const PrincipalQuickActions: React.FC<PrincipalQuickActionsProps> = ({
  onAddParent,
  onAddTeacher
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </div>
  );
};

export default PrincipalQuickActions;
