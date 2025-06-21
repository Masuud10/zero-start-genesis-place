
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface GradeApproval {
  id: string;
  grade_id: string;
  approver_id: string;
  action: string;
  notes?: string;
  created_at: string;
  profiles: {
    name: string;
    role: string;
  } | null;
}

interface GradingWorkflowPanelProps {
  gradeId: string;
  currentStatus: 'draft' | 'submitted' | 'approved' | 'released';
  approvals: GradeApproval[];
  onApprove?: () => void;
  onReject?: () => void;
  userRole: string;
}

const GradingWorkflowPanel: React.FC<GradingWorkflowPanelProps> = ({
  gradeId,
  currentStatus,
  approvals,
  onApprove,
  onReject,
  userRole
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'submitted':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'released':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canApprove = userRole === 'principal' && currentStatus === 'submitted';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon(currentStatus)}
          Grade Workflow Status
          <Badge className={getStatusColor(currentStatus)}>
            {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Workflow History */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Approval History</h4>
          {approvals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No approval history available</p>
          ) : (
            approvals.map((approval) => (
              <div key={approval.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                {getStatusIcon(approval.action)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {approval.profiles?.name || 'Unknown User'}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {approval.profiles?.role || 'Unknown Role'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {approval.action.charAt(0).toUpperCase() + approval.action.slice(1)} on{' '}
                    {new Date(approval.created_at).toLocaleDateString()}
                  </p>
                  {approval.notes && (
                    <p className="text-sm mt-1 text-gray-700">{approval.notes}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action Buttons */}
        {canApprove && (
          <div className="flex gap-2 pt-2 border-t">
            <Button
              size="sm"
              onClick={onApprove}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={onReject}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        )}

        {currentStatus === 'draft' && (
          <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md">
            <AlertCircle className="h-4 w-4 inline mr-1" />
            This grade is still in draft mode. Submit it for approval to begin the workflow.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GradingWorkflowPanel;
