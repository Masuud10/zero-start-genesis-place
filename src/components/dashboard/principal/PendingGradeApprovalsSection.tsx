
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

interface PendingGradeApprovalsSectionProps {
  pendingGrades: any[];
  processing: string | null;
  onApproveAll: () => void;
  onRejectAll: () => void;
  onDetailedReview: () => void;
}

export const PendingGradeApprovalsSection: React.FC<PendingGradeApprovalsSectionProps> = ({
  pendingGrades,
  processing,
  onApproveAll,
  onRejectAll,
  onDetailedReview
}) => {
  if (pendingGrades.length === 0) return null;

  // Group grades by class and subject for better overview
  const groupedGrades = pendingGrades.reduce((acc: Record<string, any[]>, grade: any) => {
    const key = `${grade.classes?.name || 'Unknown Class'} - ${grade.subjects?.name || 'Unknown Subject'}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(grade);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="border-t pt-4">
      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4 text-blue-500" />
        Pending Approvals ({pendingGrades.length})
      </h4>
      
      <div className="space-y-3 mb-4">
        {Object.entries(groupedGrades).map(([classSubject, grades]) => (
          <div key={classSubject} className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-sm">{classSubject}</h5>
                <p className="text-xs text-gray-600">
                  {grades.length} student{grades.length !== 1 ? 's' : ''} • 
                  Submitted by {grades[0]?.profiles?.name || 'Unknown Teacher'}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {grades[0]?.term} {grades[0]?.exam_type}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          onClick={onDetailedReview}
          variant="outline"
          className="flex items-center gap-1"
        >
          <Eye className="h-4 w-4" />
          Detailed Review
        </Button>
        
        <Button
          size="sm"
          onClick={onApproveAll}
          disabled={processing === 'approve'}
          className="bg-green-600 hover:bg-green-700"
        >
          {processing === 'approve' ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
              Approving...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve All ({pendingGrades.length})
            </>
          )}
        </Button>
        
        <Button
          size="sm"
          onClick={onRejectAll}
          disabled={processing === 'reject'}
          variant="destructive"
        >
          {processing === 'reject' ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
              Rejecting...
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 mr-1" />
              Reject All
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
