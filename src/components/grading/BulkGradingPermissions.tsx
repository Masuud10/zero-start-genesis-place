
import React from 'react';

interface BulkGradingPermissionsProps {
  existingGradesStatus: string;
  isPrincipal: boolean;
  setIsReadOnly: (readOnly: boolean) => void;
  setExistingGradesStatus: (status: string) => void;
}

export const useBulkGradingPermissions = ({
  existingGradesStatus,
  isPrincipal,
  setIsReadOnly,
  setExistingGradesStatus
}: BulkGradingPermissionsProps) => {
  
  const updatePermissions = (data: any[]) => {
    if (data && data.length > 0) {
      // Check status of existing grades
      const statuses = [...new Set(data.map(g => g.status))];
      const hasSubmitted = statuses.includes('submitted');
      const hasApproved = statuses.includes('approved');
      const hasReleased = statuses.includes('released');

      console.log('Grade statuses found:', statuses);

      if (hasReleased) {
        setExistingGradesStatus('released');
        setIsReadOnly(true);
      } else if (hasApproved) {
        setExistingGradesStatus('approved');
        setIsReadOnly(!isPrincipal); // Only principals can edit approved grades
      } else if (hasSubmitted) {
        setExistingGradesStatus('submitted');
        setIsReadOnly(!isPrincipal); // Only principals can edit submitted grades
      } else {
        setExistingGradesStatus('draft');
        setIsReadOnly(false);
      }
    } else {
      setExistingGradesStatus('');
      setIsReadOnly(false);
    }
  };

  return { updatePermissions };
};
