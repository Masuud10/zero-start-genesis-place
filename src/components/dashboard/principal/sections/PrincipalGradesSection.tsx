
import React from 'react';
import PrincipalGradesManager from '../PrincipalGradesManager';

interface PrincipalGradesSectionProps {
  schoolId: string;
  onModalOpen: (modalType: string) => void;
}

const PrincipalGradesSection: React.FC<PrincipalGradesSectionProps> = ({
  schoolId,
  onModalOpen
}) => {
  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Grade Management</h2>
      <div className="bg-white rounded-lg border shadow-sm">
        <PrincipalGradesManager 
          schoolId={schoolId}
          onModalOpen={onModalOpen}
        />
      </div>
    </section>
  );
};

export default PrincipalGradesSection;
