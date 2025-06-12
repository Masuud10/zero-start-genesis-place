
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { BulkGradeSubmission } from '@/types/grading';
import { getGradingPermissions, canApproveGrade, canReleaseResults, getGradeStatusColor } from '@/utils/grading-permissions';
import { CheckCircle, XCircle, Send, Eye, AlertCircle } from 'lucide-react';

interface GradeWorkflowManagerProps {
  submission: BulkGradeSubmission;
  onApprove: (submissionId: string, notes?: string) => void;
  onReject: (submissionId: string, reason: string) => void;
  onRelease: (submissionId: string) => void;
  onReview: (submissionId: string) => void;
}

const GradeWorkflowManager: React.FC<GradeWorkflowManagerProps> = ({
  submission,
  onApprove,
  onReject,
  onRelease,
  onReview
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const permissions = getGradingPermissions(user?.role as any);

  const handleApprove = () => {
    if (!permissions.canApproveGrades) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to approve grades.",
        variant: "destructive",
      });
      return;
    }

    onApprove(submission.id, notes);
    setNotes('');
    
    toast({
      title: "Grades Approved",
      description: "The grade submission has been approved successfully.",
    });
  };

  const handleReject = () => {
    if (!permissions.canRejectGrades || !rejectionReason.trim()) {
      toast({
        title: "Invalid Action",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }

    onReject(submission.id, rejectionReason);
    setRejectionReason('');
    setShowRejectForm(false);
    
    toast({
      title: "Grades Rejected",
      description: "The submission has been rejected and sent back to the teacher.",
    });
  };

  const handleRelease = () => {
    if (!permissions.canReleaseResults) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to release results.",
        variant: "destructive",
      });
      return;
    }

    onRelease(submission.id);
    
    toast({
      title: "Results Released",
      description: "Results have been released to parents and students.",
    });
  };

  const getStatusIcon = () => {
    switch (submission.status) {
      case 'draft': return <AlertCircle className="w-4 h-4" />;
      case 'submitted': return <Send className="w-4 h-4" />;
      case 'under_review': return <Eye className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'released': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Grade Submission Workflow</span>
          <Badge className={getGradeStatusColor(submission.status)}>
            <span className="flex items-center gap-2">
              {getStatusIcon()}
              {submission.status.replace('_', ' ').toUpperCase()}
            </span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Class:</span> {submission.classId}
          </div>
          <div>
            <span className="font-medium">Subject:</span> {submission.subjectId}
          </div>
          <div>
            <span className="font-medium">Term:</span> {submission.term}
          </div>
          <div>
            <span className="font-medium">Exam:</span> {submission.examType}
          </div>
          <div>
            <span className="font-medium">Students:</span> {submission.gradesEntered}/{submission.totalStudents}
          </div>
          <div>
            <span className="font-medium">Submitted:</span> {new Date(submission.submittedAt).toLocaleDateString()}
          </div>
        </div>

        {submission.principalNotes && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <Label className="text-sm font-medium">Principal Notes:</Label>
            <p className="text-sm mt-1">{submission.principalNotes}</p>
          </div>
        )}

        {/* Review Actions for Principal */}
        {user?.role === 'principal' && submission.status === 'submitted' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Review Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this grade submission..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Grades
              </Button>
              <Button 
                onClick={() => setShowRejectForm(true)} 
                variant="destructive"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject Grades
              </Button>
              <Button onClick={() => onReview(submission.id)} variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Review Details
              </Button>
            </div>

            {showRejectForm && (
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <Label htmlFor="rejection-reason">Reason for Rejection *</Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please explain why these grades are being rejected..."
                  rows={3}
                  className="mt-2"
                />
                <div className="flex gap-2 mt-3">
                  <Button onClick={handleReject} variant="destructive" size="sm">
                    Confirm Rejection
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectionReason('');
                    }} 
                    variant="outline" 
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Release Results for Principal */}
        {user?.role === 'principal' && submission.status === 'approved' && (
          <div className="p-4 border border-green-200 rounded-lg bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-green-800">Ready to Release</h4>
                <p className="text-sm text-green-600">
                  These grades have been approved and are ready to be released to parents.
                </p>
              </div>
              <Button onClick={handleRelease} className="bg-purple-600 hover:bg-purple-700">
                <Send className="w-4 h-4 mr-2" />
                Release Results
              </Button>
            </div>
          </div>
        )}

        {/* Status Information for Other Roles */}
        {submission.status === 'released' && (
          <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-800">Results Released</span>
            </div>
            <p className="text-sm text-purple-600 mt-1">
              These results have been released to parents and are now visible to students.
            </p>
            {submission.releasedAt && (
              <p className="text-xs text-purple-500 mt-2">
                Released on: {new Date(submission.releasedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GradeWorkflowManager;
