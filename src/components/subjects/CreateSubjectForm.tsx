
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useSubjectService } from '@/hooks/useSubjectService';
import { usePrincipalEntityLists } from '@/hooks/usePrincipalEntityLists';
import { AlertCircle, BookOpen, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SubjectCreationData } from '@/types/subject';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

    if (!/^[A-Z0-9]+$/i.test(formData.code)) {
      setError("Subject code must contain only letters and numbers");
      return false;
    }

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
    
    if (!validateForm()) {
      console.log('CreateSubjectForm: Form validation failed');
      return;
    }

    try {
      const submissionData = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        name: formData.name.trim(),
        description: formData.description?.trim() || ''
      };

      console.log('CreateSubjectForm: Submitting subject creation:', submissionData);

      const result = await createSubject(submissionData);

      if (result) {
        console.log('CreateSubjectForm: Subject created successfully:', result);
        setSuccess(`Subject "${result.name}" created successfully!`);
        
        setTimeout(() => {
          handleClose();
          onSuccess();
        }, 1500);
      } else {
        console.log('CreateSubjectForm: Subject creation returned null');
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
          <div className="space-y-2">
            <Label htmlFor="subject-name" className="text-gray-700">Subject Name *</Label>
            <Input
              id="subject-name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Mathematics"
              required
              disabled={loading}
              maxLength={100}
              className="border-gray-300 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject-code" className="text-gray-700">Subject Code *</Label>
            <Input
              id="subject-code"
              value={formData.code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="e.g., MATH"
              required
              disabled={loading}
              maxLength={10}
              className="border-gray-300 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => {
                setFormData({ ...formData, category: value });
                clearMessages();
              }}
              disabled={loading}
            >
              <SelectTrigger className="border-gray-300 focus:border-blue-500">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="core">Core Subject</SelectItem>
                <SelectItem value="elective">Elective</SelectItem>
                <SelectItem value="optional">Optional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">Class (Optional)</Label>
            <Select
              value={formData.class_id || ""}
              onValueChange={(value) => {
                setFormData({ ...formData, class_id: value || undefined });
                clearMessages();
              }}
              disabled={loading || loadingEntities}
            >
              <SelectTrigger className="border-gray-300 focus:border-blue-500">
                <SelectValue placeholder="Select class (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Classes</SelectItem>
                {classList.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">Teacher (Optional)</Label>
            <Select
              value={formData.teacher_id || ""}
              onValueChange={(value) => {
                setFormData({ ...formData, teacher_id: value || undefined });
                clearMessages();
              }}
              disabled={loading || loadingEntities}
            >
              <SelectTrigger className="border-gray-300 focus:border-blue-500">
                <SelectValue placeholder="Select teacher (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassigned</SelectItem>
                {teacherList.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading || !isFormValid} className="flex-1">
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Creating...
                </>
              ) : (
                'Create Subject'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSubjectForm;
