
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { PrincipalGradeApprovalInterface } from '@/components/grading/PrincipalGradeApprovalInterface';

interface PendingGradesTabProps {
  grades: any[];
  onBulkAction: (gradeIds: string[], action: 'approve' | 'reject' | 'release') => Promise<void>;
  processing: string | null;
  schoolId: string;
}

export const PendingGradesTab: React.FC<PendingGradesTabProps> = ({
  grades,
  onBulkAction,
  processing,
  schoolId
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Grades Pending Approval</CardTitle>
      </CardHeader>
      <CardContent>
        {grades.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No grades pending approval</p>
          </div>
        ) : (
          <PrincipalGradeApprovalInterface
            grades={grades}
            onBulkAction={onBulkAction}
            processing={processing}
            schoolId={schoolId}
          />
        )}
      </CardContent>
    </Card>
  );
};
