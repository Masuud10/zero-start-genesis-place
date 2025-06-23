
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
        <AlertTriangle className="h-4 w-4 text-orange-500" />
        Pending Approvals ({pendingGrades.length})
      </h4>
      
      <Alert className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Teachers have submitted {pendingGrades.length} grades for your review and approval.
        </AlertDescription>
      </Alert>

      {/* Show recent submissions */}
      <div className="mb-4 max-h-40 overflow-y-auto">
        <div className="space-y-2">
          {pendingGrades.slice(0, 5).map((grade: any) => (
            <div key={grade.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
              <div>
                <span className="font-medium">{grade.students?.name || 'Unknown Student'}</span>
                <span className="text-gray-500 ml-2">• {grade.subjects?.name || 'Unknown Subject'}</span>
                <span className="text-gray-500 ml-2">• {grade.classes?.name || 'Unknown Class'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">{grade.score}/{grade.max_score}</span>
                <Badge variant="outline" className="text-xs">
                  {grade.term} {grade.exam_type}
                </Badge>
              </div>
            </div>
          ))}
          {pendingGrades.length > 5 && (
            <p className="text-sm text-gray-500 text-center">
              +{pendingGrades.length - 5} more grades pending...
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
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
          className="ml-2"
        >
          <Settings className="h-4 w-4 mr-1" />
          Detailed Review
        </Button>
      </div>
    </div>
  );
};
