
import React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface GradeModalHeaderProps {
  curriculumType: string;
  isTeacher: boolean;
  isPrincipal: boolean;
  permissions: {
    canSubmitGrades: boolean;
    canApproveGrades: boolean;
    canOverrideGrades: boolean;
    canReleaseResults: boolean;
  };
}

const GradeModalHeader: React.FC<GradeModalHeaderProps> = ({
  curriculumType,
  isTeacher,
  isPrincipal,
  permissions
}) => {
  return (
    <DialogHeader>
      <DialogTitle>
        Enter Grades ({curriculumType?.toUpperCase() || 'STANDARD'} Curriculum)
        <span className="ml-2 inline-block align-middle">
          {isTeacher && permissions.canSubmitGrades && (
            <span className="text-xs text-blue-700 font-semibold">(Teacher: submit for approval)</span>
          )}
          {isPrincipal && (
            <span className="text-xs text-green-700 font-semibold ml-1">(Principal: {[
              permissions.canApproveGrades ? "approve, " : "",
              permissions.canOverrideGrades ? "override, " : "",
              permissions.canReleaseResults ? "release, " : "",
              "input marks"
            ].join('').replace(/, $/, '')})</span>
          )}
        </span>
      </DialogTitle>
    </DialogHeader>
  );
};

export default GradeModalHeader;
