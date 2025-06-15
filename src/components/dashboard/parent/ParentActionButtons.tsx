
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, GraduationCap, CalendarCheck, DollarSign, MessageSquare } from 'lucide-react';

interface ParentActionButtonsProps {
  onModalOpen: (modalType: string) => void;
}

const parentActions = [
  { id: 'grades', label: 'Child Grades', icon: GraduationCap, description: 'View academic performance' },
  { id: 'attendance', label: 'Attendance Record', icon: CalendarCheck, description: 'Check daily attendance' },
  { id: 'finance', label: 'School Fees', icon: DollarSign, description: 'Payment history & balance' },
  { id: 'messages', label: 'School Messages', icon: MessageSquare, description: 'Communications from school' },
];

const ParentActionButtons: React.FC<ParentActionButtonsProps> = ({ onModalOpen }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Parent Portal
        </CardTitle>
        <CardDescription>
          Access your child's educational information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {parentActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className="h-24 flex-col gap-2 p-4"
              onClick={() => onModalOpen(action.id)}
            >
              <action.icon className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium text-sm">{action.label}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ParentActionButtons;
