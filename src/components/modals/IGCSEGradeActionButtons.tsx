
import React from 'react';
import { Button } from '@/components/ui/button';

interface IGCSEGradeActionButtonsProps {
  loading: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

const IGCSEGradeActionButtons: React.FC<IGCSEGradeActionButtonsProps> = ({
  loading,
  onCancel,
  onSubmit,
}) => (
  <>
    <Button variant="secondary" onClick={onCancel}>Cancel</Button>
    <Button type="submit" onClick={onSubmit} disabled={loading}>
      {loading ? 'Submitting...' : 'Submit'}
    </Button>
  </>
);

export default IGCSEGradeActionButtons;
