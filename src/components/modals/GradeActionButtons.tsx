
import React from 'react';
import { Button } from '@/components/ui/button';

interface GradeActionButtonsProps {
  onClose: () => void;
  onSubmit: () => void;
  loading: boolean;
  permissions: {
    canInput: boolean;
    canSubmit: boolean;
    canApprove: boolean;
    canRelease: boolean;
    canOverride: boolean;
  };
  role: 'teacher' | 'principal';
  isPrincipal: boolean;
  isTeacher: boolean;
  canRelease: boolean;
  handleRelease: () => void;
}

const GradeActionButtons: React.FC<GradeActionButtonsProps> = ({
  onClose,
  onSubmit,
  loading,
  permissions,
  role,
  isPrincipal,
  isTeacher,
  canRelease,
  handleRelease
}) => {
  const { canInput, canSubmit, canApprove, canOverride } = permissions;

  return (
    <>
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
      {(canInput || canSubmit || canApprove) && (
        <Button
          type="submit"
          onClick={onSubmit}
          disabled={loading || (!canInput && !canApprove && !canSubmit)}
        >
          {loading
            ? 'Submitting...'
            : (isTeacher && canSubmit ? 'Submit for Approval'
              : isPrincipal && canOverride ? 'Add/Update Grade'
              : isPrincipal && canApprove ? 'Approve'
              : isPrincipal && canInput ? 'Submit'
              : 'Submit')}
        </Button>
      )}
      {isPrincipal && canRelease && (
        <Button
          type="button"
          variant="default"
          className="ml-2"
          onClick={handleRelease}
        >
          Release Results
        </Button>
      )}
    </>
  );
};

export default GradeActionButtons;
