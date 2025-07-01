
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import NewSubjectCreationForm from './NewSubjectCreationForm';
import { NewSubjectFormData } from '@/types/subject';
import { createSubject } from '@/services/subject/subjectDatabaseService';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: NewSubjectFormData) => {
    setIsSubmitting(true);
    try {
      await createSubject(data);
      toast.success('Subject created successfully!');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating subject:', error);
      toast.error('Failed to create subject. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Create New Subject</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[90vh]">
          <NewSubjectCreationForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            classes={classes}
            teachers={teachers}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default NewSubjectCreationModal;
