
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSubjectService } from '@/hooks/useSubjectService';
import { usePrincipalEntityLists } from '@/hooks/usePrincipalEntityLists';
import { AlertCircle, BookOpen } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SubjectCreationData } from '@/types/subject';

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

  const { createSubject, loading } = useSubjectService();
  const { classList, teacherList, loadingEntities } = usePrincipalEntityLists(0);

  const validateForm = () => {
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
    if (!/^[A-Z0-9]+$/.test(formData.code.toUpperCase())) {
      setError("Subject code must contain only letters and numbers");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) return;

    console.log('Submitting subject creation:', formData);

    // Ensure code is uppercase
    const submissionData = {
      ...formData,
      code: formData.code.toUpperCase()
    };

    const result = await createSubject(submissionData);

    if (result) {
      handleClose();
      onSuccess();
    }
  };

  const handleClose = () => {
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
    onClose();
  };

  const handleCodeChange = (value: string) => {
    const upperValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setFormData({ ...formData, code: upperValue });
    setError(null);
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

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">
                Subject Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Mathematics"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setError(null);
                }}
                required
                disabled={loading}
                className="border-gray-300 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code" className="text-gray-700">
                Subject Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                placeholder="e.g., MATH101"
                value={formData.code}
                onChange={(e) => handleCodeChange(e.target.value)}
                required
                disabled={loading}
                maxLength={10}
                className="border-gray-300 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Classification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                disabled={loading}
              >
                <SelectTrigger className="border-gray-300 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="core">Core Subject</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="arts">Arts & Humanities</SelectItem>
                  <SelectItem value="languages">Languages</SelectItem>
                  <SelectItem value="technical">Technical/Vocational</SelectItem>
                  <SelectItem value="sports">Physical Education</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">Credit Hours</Label>
              <Select 
                value={formData.credit_hours?.toString()} 
                onValueChange={(value) => setFormData({ ...formData, credit_hours: parseInt(value) || 1 })}
                disabled={loading}
              >
                <SelectTrigger className="border-gray-300 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {[1, 2, 3, 4, 5, 6].map((hours) => (
                    <SelectItem key={hours} value={hours.toString()}>
                      {hours} {hours === 1 ? 'Hour' : 'Hours'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignment Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700">Class (Optional)</Label>
              <Select 
                value={formData.class_id || ''} 
                onValueChange={(value) => setFormData({ ...formData, class_id: value || undefined })}
                disabled={loading || loadingEntities}
              >
                <SelectTrigger className="border-gray-300 focus:border-blue-500">
                  <SelectValue placeholder="Select specific class or leave for all" />
                </SelectTrigger>
                <SelectContent className="bg-white">
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
                value={formData.teacher_id || ''} 
                onValueChange={(value) => setFormData({ ...formData, teacher_id: value || undefined })}
                disabled={loading || loadingEntities}
              >
                <SelectTrigger className="border-gray-300 focus:border-blue-500">
                  <SelectValue placeholder="Assign teacher later" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="">No teacher assigned</SelectItem>
                  {teacherList.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Curriculum */}
          <div className="space-y-2">
            <Label className="text-gray-700">Curriculum System</Label>
            <Select 
              value={formData.curriculum} 
              onValueChange={(value) => setFormData({ ...formData, curriculum: value })}
              disabled={loading}
            >
              <SelectTrigger className="border-gray-300 focus:border-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="cbc">CBC (Competency Based Curriculum)</SelectItem>
                <SelectItem value="8-4-4">8-4-4 System</SelectItem>
                <SelectItem value="igcse">IGCSE</SelectItem>
                <SelectItem value="ib">International Baccalaureate</SelectItem>
                <SelectItem value="other">Other System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-gray-700">Description (Optional)</Label>
            <Input
              placeholder="Brief description of the subject"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={loading}
              className="border-gray-300 focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose} 
              disabled={loading}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.name.trim() || !formData.code.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Creating..." : "Create Subject"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSubjectForm;
