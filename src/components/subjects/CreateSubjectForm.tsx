
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSubjectService } from '@/hooks/useSubjectService';
import { usePrincipalEntityLists } from '@/hooks/usePrincipalEntityLists';
import { AlertCircle, BookOpen, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SubjectCreationData } from '@/types/subject';
import SubjectBasicInfoForm from './forms/SubjectBasicInfoForm';
import SubjectClassificationForm from './forms/SubjectClassificationForm';
import SubjectAssignmentForm from './forms/SubjectAssignmentForm';
import SubjectFormActions from './forms/SubjectFormActions';

interface CreateSubjectFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateSubjectForm: React.FC<CreateSubjectFormProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<SubjectCreationData>({
    name: '',
    code: '',
    class_id: undefined,
    teacher_id: undefined,
    curriculum: 'cbc',
    category: 'core',
    credit_hours: 1,
    description: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { createSubject, loading } = useSubjectService();
  const { classList, teacherList, loadingEntities } = usePrincipalEntityLists(0);

  // Add debugging for the modal state and data
  React.useEffect(() => {
    if (open) {
      console.log('CreateSubjectForm: Modal opened');
      console.log('CreateSubjectForm: Loading entities?', loadingEntities);
      console.log('CreateSubjectForm: Classes available:', classList?.length || 0);
      console.log('CreateSubjectForm: Teachers available:', teacherList?.length || 0);
      console.log('CreateSubjectForm: Current form data:', formData);
    }
  }, [open, loadingEntities, classList, teacherList, formData]);

  const validateForm = () => {
    setError(null);
    
    if (!formData.name.trim()) {
      setError("Subject name is required");
      return false;
    }
    
    if (!formData.code.trim()) {
      setError("Subject code is required");
      return false;
    }

    if (formData.name.length < 2) {
      setError("Subject name must be at least 2 characters");
      return false;
    }

    if (formData.code.length < 2) {
      setError("Subject code must be at least 2 characters");
      return false;
    }

    // Validate code format (letters and numbers only)
    if (!/^[A-Z0-9]+$/i.test(formData.code)) {
      setError("Subject code must contain only letters and numbers");
      return false;
    }

    // Check code length limit
    if (formData.code.length > 20) {
      setError("Subject code must be 20 characters or less");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    console.log('CreateSubjectForm: Form submission started');
    console.log('CreateSubjectForm: Form data:', formData);
    
    if (!validateForm()) {
      console.log('CreateSubjectForm: Form validation failed');
      return;
    }

    console.log('CreateSubjectForm: Submitting subject creation:', formData);

    try {
      // Ensure code is uppercase and clean data
      const submissionData = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        name: formData.name.trim(),
        description: formData.description?.trim() || ''
      };

      console.log('CreateSubjectForm: Processed submission data:', submissionData);
      console.log('CreateSubjectForm: About to call createSubject service');

      const result = await createSubject(submissionData);

      console.log('CreateSubjectForm: Service call completed, result:', result);

      if (result) {
        console.log('CreateSubjectForm: Subject created successfully:', result);
        setSuccess(`Subject "${result.name}" created successfully!`);
        
        // Small delay to show success message before closing
        setTimeout(() => {
          handleClose();
          onSuccess();
        }, 1500);
      } else {
        console.log('CreateSubjectForm: Subject creation returned null - check error handling');
        setError('Failed to create subject. Please try again.');
      }
    } catch (error: any) {
      console.error('CreateSubjectForm: Form submission error:', error);
      setError(error.message || 'Failed to create subject');
    }
  };

  const handleClose = () => {
    console.log('CreateSubjectForm: Closing form and resetting state');
    setFormData({
      name: '',
      code: '',
      class_id: undefined,
      teacher_id: undefined,
      curriculum: 'cbc',
      category: 'core',
      credit_hours: 1,
      description: ''
    });
    setError(null);
    setSuccess(null);
    onClose();
  };

  const handleCodeChange = (value: string) => {
    const upperValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setFormData({ ...formData, code: upperValue });
    setError(null);
    setSuccess(null);
  };

  const handleNameChange = (value: string) => {
    setFormData({ ...formData, name: value });
    setError(null);
    setSuccess(null);
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const isFormValid = Boolean(formData.name.trim() && formData.code.trim());

  const handleFormSubmit = () => {
    console.log('CreateSubjectForm: handleFormSubmit called');
    // Create a synthetic form event for the handleSubmit function
    const syntheticEvent = {
      preventDefault: () => {},
    } as React.FormEvent;
    handleSubmit(syntheticEvent);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <BookOpen className="h-5 w-5" />
            Create New Subject
          </DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <SubjectBasicInfoForm
            name={formData.name}
            code={formData.code}
            onNameChange={handleNameChange}
            onCodeChange={handleCodeChange}
            loading={loading}
          />

          <SubjectClassificationForm
            category={formData.category}
            creditHours={formData.credit_hours}
            curriculum={formData.curriculum}
            onCategoryChange={(value) => {
              setFormData({ ...formData, category: value });
              clearMessages();
            }}
            onCreditHoursChange={(value) => {
              setFormData({ ...formData, credit_hours: value });
              clearMessages();
            }}
            onCurriculumChange={(value) => {
              setFormData({ ...formData, curriculum: value });
              clearMessages();
            }}
            loading={loading}
          />

          <SubjectAssignmentForm
            classId={formData.class_id}
            teacherId={formData.teacher_id}
            classList={classList}
            teacherList={teacherList}
            onClassChange={(value) => {
              setFormData({ ...formData, class_id: value });
              clearMessages();
            }}
            onTeacherChange={(value) => {
              setFormData({ ...formData, teacher_id: value });
              clearMessages();
            }}
            loading={loading}
            loadingEntities={loadingEntities}
          />

          <div className="space-y-2">
            <Label className="text-gray-700">Description (Optional)</Label>
            <Input
              placeholder="Brief description of the subject"
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                clearMessages();
              }}
              disabled={loading}
              className="border-gray-300 focus:border-blue-500"
            />
          </div>

          <SubjectFormActions
            onCancel={handleClose}
            onSubmit={handleFormSubmit}
            loading={loading}
            isFormValid={isFormValid}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSubjectForm;
