
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
      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
      <h3 className="font-medium text-gray-900">All Caught Up!</h3>
      <p className="text-gray-500">No grades pending approval at this time.</p>
      {totalGrades > 0 && (
        <p className="text-sm text-gray-400 mt-2">
          Total grades managed: {totalGrades}
        </p>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={onOpenAdvancedInterface}
        className="mt-3"
      >
        <Settings className="h-4 w-4 mr-1" />
        View All Grade Management
      </Button>
    </div>
  );
};
