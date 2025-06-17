
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import PrincipalQuickActions from "./PrincipalQuickActions";

interface QuickActionsCardProps {
  onAddParent: () => void;
  onAddTeacher: () => void;
  onAddClass: () => void;
  onAddSubject: () => void;
}

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({ 
  onAddParent, 
  onAddTeacher,
  onAddClass,
  onAddSubject
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Plus className="h-5 w-5" />
        Quick Actions
      </CardTitle>
      <CardDescription>
        Common administrative tasks
      </CardDescription>
    </CardHeader>
    <CardContent>
      <PrincipalQuickActions
        onAddParent={onAddParent}
        onAddTeacher={onAddTeacher}
        onAddClass={onAddClass}
        onAddSubject={onAddSubject}
      />
    </CardContent>
  </Card>
);

export default QuickActionsCard;
