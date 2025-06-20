
import React from 'react';
import AssignTeacherForm from '@/components/subjects/AssignTeacherForm';

interface SubjectAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  onAssignmentCreated: () => void;
}

const SubjectAssignmentModal: React.FC<SubjectAssignmentModalProps> = (props) => {
  return <AssignTeacherForm {...props} onSuccess={props.onAssignmentCreated} />;
};

export default SubjectAssignmentModal;
