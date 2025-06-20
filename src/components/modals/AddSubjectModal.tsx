
import React from 'react';
import CreateSubjectForm from '@/components/subjects/CreateSubjectForm';

interface AddSubjectModalProps {
  open: boolean;
  onClose: () => void;
  onSubjectCreated: () => void;
}

const AddSubjectModal: React.FC<AddSubjectModalProps> = (props) => {
  return <CreateSubjectForm {...props} onSuccess={props.onSubjectCreated} />;
};

export default AddSubjectModal;
