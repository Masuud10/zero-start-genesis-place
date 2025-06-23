
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Eye } from 'lucide-react';

interface ApprovedGradesSectionProps {
  approvedGrades: any[];
  processing: string | null;
  onReleaseAll: () => void;
}

export const ApprovedGradesSection: React.FC<ApprovedGradesSectionProps> = ({
  approvedGrades,
  processing,
  onReleaseAll
}) => {
  if (approvedGrades.length === 0) return null;

  return (
    <div className="border-t pt-4">
      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-500" />
        Ready for Release ({approvedGrades.length})
      </h4>
      
      <p className="text-sm text-gray-600 mb-3">
        These grades have been approved and are ready to be released to students and parents.
      </p>

      <Button
        size="sm"
        onClick={onReleaseAll}
        disabled={processing === 'release'}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {processing === 'release' ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Releasing...
          </>
        ) : (
          <>
            <Eye className="h-4 w-4 mr-1" />
            Release All Grades ({approvedGrades.length})
          </>
        )}
      </Button>
    </div>
  );
};
