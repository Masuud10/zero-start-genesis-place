
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import IGCSEGradesModal from '../IGCSEGradesModal';
import { CBCGradesModal } from '../CBCGradesModal';
import { detectCurriculumType } from '@/utils/curriculum-detector';

interface CurriculumModalSwitcherProps {
  curriculumType: string;
  onClose: () => void;
  userRole: string;
}

const CurriculumModalSwitcher: React.FC<CurriculumModalSwitcherProps> = ({
  curriculumType,
  onClose,
  userRole
}) => {
  const detectedCurriculumType = detectCurriculumType(curriculumType);

  // Modal switching: CBC custom flow
  if (detectedCurriculumType === 'CBC') {
    return <CBCGradesModal onClose={onClose} />;
  }

  // Modal switching: IGCSE custom flow
  if (detectedCurriculumType === 'IGCSE') {
    return <IGCSEGradesModal onClose={onClose} userRole={userRole} />;
  }

  // Handle unsupported curriculum types
  if (curriculumType && !['standard', 'CBC', 'IGCSE'].includes(detectedCurriculumType)) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center p-6">
            <p>Unsupported curriculum type: {curriculumType}</p>
            <p className="text-sm text-gray-600 mt-2">
              Detected: {detectedCurriculumType}
            </p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
};

export default CurriculumModalSwitcher;
