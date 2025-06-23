
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PrincipalGradeApprovalInterface } from '@/components/grading/PrincipalGradeApprovalInterface';
import { CheckCircle, Settings, RefreshCw } from 'lucide-react';
import { usePrincipalGradeManagement } from '@/hooks/usePrincipalGradeManagement';
import { GradeApprovalOverviewCards } from './GradeApprovalOverviewCards';
import { PendingGradeApprovalsSection } from './PendingGradeApprovalsSection';
import { ApprovedGradesSection } from './ApprovedGradesSection';
import { GradeApprovalEmptyState } from './GradeApprovalEmptyState';
import { GradeApprovalErrorState } from './GradeApprovalErrorState';

const PrincipalGradesManager: React.FC = () => {
  const [showApprovalInterface, setShowApprovalInterface] = useState(false);
  
  const {
    grades,
    isLoading,
    error,
    processing,
    refetch,
    handleApproveGrades,
    handleRejectGrades,
    handleReleaseGrades
  } = usePrincipalGradeManagement();

  const pendingApproval = grades?.filter(grade => grade.status === 'submitted') || [];
  const approvedGrades = grades?.filter(grade => grade.status === 'approved') || [];
  const rejectedGrades = grades?.filter(grade => grade.status === 'rejected') || [];
  const releasedGrades = grades?.filter(grade => grade.status === 'released') || [];

  const openApprovalInterface = () => {
    setShowApprovalInterface(true);
  };

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Grade Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <GradeApprovalErrorState error={error} onRetry={() => refetch()} />
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Grade Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading grades...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Grade Approvals
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={openApprovalInterface}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Advanced Review
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Status Overview */}
          <GradeApprovalOverviewCards
            pendingCount={pendingApproval.length}
            approvedCount={approvedGrades.length}
            releasedCount={releasedGrades.length}
            rejectedCount={rejectedGrades.length}
          />

          {/* Pending Approvals Section */}
          <PendingGradeApprovalsSection
            pendingGrades={pendingApproval}
            processing={processing}
            onApproveAll={() => handleApproveGrades(pendingApproval.map(g => g.id))}
            onRejectAll={() => handleRejectGrades(pendingApproval.map(g => g.id))}
            onDetailedReview={openApprovalInterface}
          />

          {/* Approved Grades Section */}
          <ApprovedGradesSection
            approvedGrades={approvedGrades}
            processing={processing}
            onReleaseAll={() => handleReleaseGrades(approvedGrades.map(g => g.id))}
          />

          {/* No Pending Actions */}
          {pendingApproval.length === 0 && approvedGrades.length === 0 && (
            <GradeApprovalEmptyState
              totalGrades={grades?.length || 0}
              onOpenAdvancedInterface={openApprovalInterface}
            />
          )}
        </div>
      </CardContent>

      {/* Advanced Approval Interface Dialog */}
      <Dialog open={showApprovalInterface} onOpenChange={setShowApprovalInterface}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Advanced Grade Review & Approval</DialogTitle>
          </DialogHeader>
          <PrincipalGradeApprovalInterface />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PrincipalGradesManager;
