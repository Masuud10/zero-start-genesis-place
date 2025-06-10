
import React from 'react';
import StudentAdmissionModal from '../../modals/StudentAdmissionModal';
import TeacherAdmissionModal from '../../modals/TeacherAdmissionModal';
import ParentAdmissionModal from '../../modals/ParentAdmissionModal';
import PrincipalReportsModal from '../../modals/PrincipalReportsModal';

interface PrincipalModalsProps {
  activeModal: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PrincipalModals: React.FC<PrincipalModalsProps> = ({ activeModal, onClose, onSuccess }) => {
  return (
    <>
      {activeModal === 'student-admission' && (
        <StudentAdmissionModal 
          onClose={onClose} 
          onSuccess={onSuccess}
        />
      )}
      {activeModal === 'teacher-admission' && (
        <TeacherAdmissionModal 
          onClose={onClose} 
          onSuccess={onSuccess}
        />
      )}
      {activeModal === 'parent-admission' && (
        <ParentAdmissionModal 
          onClose={onClose} 
          onSuccess={onSuccess}
        />
      )}
      {activeModal === 'principal-reports' && (
        <PrincipalReportsModal 
          onClose={onClose} 
        />
      )}
    </>
  );
};

export default PrincipalModals;
