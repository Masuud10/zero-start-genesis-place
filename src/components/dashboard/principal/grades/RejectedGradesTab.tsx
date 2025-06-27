
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { PrincipalGradeApprovalInterface } from '@/components/grading/PrincipalGradeApprovalInterface';

interface RejectedGradesTabProps {
  grades: any[];
  onBulkAction: (gradeIds: string[], action: 'approve' | 'reject' | 'release') => Promise<void>;
  processing: string | null;
  schoolId: string;
}

export const RejectedGradesTab: React.FC<RejectedGradesTabProps> = ({
  grades,
  onBulkAction,
  processing,
  schoolId
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rejected Grades</CardTitle>
      </CardHeader>
      <CardContent>
        {grades.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No rejected grades</p>
          </div>
        ) : (
          <PrincipalGradeApprovalInterface
            grades={grades}
            onBulkAction={onBulkAction}
            processing={processing}
            schoolId={schoolId}
            readOnly={true}
          />
        )}
      </CardContent>
    </Card>
  );
};
