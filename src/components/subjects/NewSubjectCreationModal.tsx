
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import NewSubjectCreationForm from './NewSubjectCreationForm';

interface NewSubjectCreationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  classes: Array<{ id: string; name: string; }>;
  teachers: Array<{ id: string; name: string; email: string; }>;
}

const NewSubjectCreationModal: React.FC<NewSubjectCreationModalProps> = ({
  open,
  onClose,
  onSuccess,
  classes,
  teachers
}) => {
  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Create New Subject</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[90vh]">
          <NewSubjectCreationForm
            onSuccess={handleSuccess}
            onCancel={onClose}
            classes={classes}
            teachers={teachers}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default NewSubjectCreationModal;
