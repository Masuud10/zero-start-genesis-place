
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Settings } from 'lucide-react';

interface GradeApprovalEmptyStateProps {
  totalGrades: number;
  onOpenAdvancedInterface: () => void;
}

export const GradeApprovalEmptyState: React.FC<GradeApprovalEmptyStateProps> = ({
  totalGrades,
  onOpenAdvancedInterface
}) => {
  return (
    <div className="text-center py-8">
      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">All grades processed!</h3>
      <p className="text-gray-600 mb-4">
        {totalGrades > 0 
          ? `You have ${totalGrades} grades in the system, all properly managed.`
          : 'No grade submissions found. Teachers will submit grades for approval here.'
        }
      </p>
      <Button
        onClick={onOpenAdvancedInterface}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Settings className="h-4 w-4" />
        Advanced Grade Management
      </Button>
    </div>
  );
};
