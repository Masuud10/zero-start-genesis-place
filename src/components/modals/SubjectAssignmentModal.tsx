
import React from 'react';
import TeacherAssignmentForm from '@/components/subjects/TeacherAssignmentForm';

interface SubjectAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  onAssignmentCreated: () => void;
}

const SubjectAssignmentModal: React.FC<SubjectAssignmentModalProps> = (props) => {
  return <TeacherAssignmentForm {...props} />;
};

export default SubjectAssignmentModal;
