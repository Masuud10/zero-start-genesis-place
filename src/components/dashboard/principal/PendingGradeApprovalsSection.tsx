
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Settings, AlertTriangle } from 'lucide-react';

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

  return (
    <div className="border-t pt-4">
      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        Pending Approvals ({pendingGrades.length})
      </h4>
      
      <div className="space-y-3 mb-4">
        {pendingGrades.slice(0, 3).map((grade) => (
          <div key={grade.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{grade.students?.name || 'Unknown Student'}</p>
              <p className="text-sm text-gray-600">
                {grade.subjects?.name || 'Unknown Subject'} • {grade.classes?.name || 'Unknown Class'}
              </p>
              <p className="text-xs text-gray-500">
                Score: {grade.score}/{grade.max_score} • Submitted: {new Date(grade.submitted_at).toLocaleDateString()}
              </p>
            </div>
            <Badge variant="outline" className="border-yellow-300 text-yellow-700">
              Pending
            </Badge>
          </div>
        ))}
        
        {pendingGrades.length > 3 && (
          <p className="text-sm text-gray-600 text-center">
            +{pendingGrades.length - 3} more grades pending approval
          </p>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          onClick={onApproveAll}
          disabled={processing === 'approve'}
          className="bg-green-600 hover:bg-green-700"
        >
          {processing === 'approve' ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
          variant="destructive"
          onClick={onRejectAll}
          disabled={processing === 'reject'}
        >
          {processing === 'reject' ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Rejecting...
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 mr-1" />
              Reject All
            </>
          )}
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={onDetailedReview}
        >
          <Settings className="h-4 w-4 mr-1" />
          Detailed Review
        </Button>
      </div>
    </div>
  );
};
