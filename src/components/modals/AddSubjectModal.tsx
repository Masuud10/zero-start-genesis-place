
import React from 'react';
import SubjectCreationForm from '@/components/subjects/SubjectCreationForm';

interface AddSubjectModalProps {
  open: boolean;
  onClose: () => void;
  onSubjectCreated: () => void;
}

const AddSubjectModal: React.FC<AddSubjectModalProps> = (props) => {
  return <SubjectCreationForm {...props} />;
};

export default AddSubjectModal;
