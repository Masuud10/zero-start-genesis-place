
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Users, BookOpen } from 'lucide-react';

interface PrincipalActionButtonsProps {
  onModalOpen: (modalType: string) => void;
}

const PrincipalActionButtons: React.FC<PrincipalActionButtonsProps> = ({ onModalOpen }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center gap-2"
            onClick={() => onModalOpen('student-admission')}
          >
            <Users className="h-6 w-6" />
            <span className="text-sm">Add Student</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center gap-2"
            onClick={() => onModalOpen('add-teacher')}
          >
            <Plus className="h-6 w-6" />
            <span className="text-sm">Add Teacher</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center gap-2"
            onClick={() => onModalOpen('add-subject')}
          >
            <BookOpen className="h-6 w-6" />
            <span className="text-sm">Add Subject</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center gap-2"
            onClick={() => onModalOpen('reports')}
          >
            <FileText className="h-6 w-6" />
            <span className="text-sm">Generate Reports</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrincipalActionButtons;
