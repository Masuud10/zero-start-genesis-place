
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye } from 'lucide-react';
import { PrincipalGradeApprovalInterface } from '@/components/grading/PrincipalGradeApprovalInterface';

interface ApprovedGradesTabProps {
  grades: any[];
  onBulkAction: (gradeIds: string[], action: 'approve' | 'reject' | 'release') => Promise<void>;
  processing: string | null;
  schoolId: string;
}

export const ApprovedGradesTab: React.FC<ApprovedGradesTabProps> = ({
  grades,
  onBulkAction,
  processing,
  schoolId
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Approved Grades</CardTitle>
      </CardHeader>
      <CardContent>
        {grades.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No approved grades</p>
          </div>
        ) : (
          <PrincipalGradeApprovalInterface
            grades={grades}
            onBulkAction={onBulkAction}
            processing={processing}
            schoolId={schoolId}
            allowRelease={true}
          />
        )}
      </CardContent>
    </Card>
  );
};
