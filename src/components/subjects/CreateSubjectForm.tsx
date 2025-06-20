
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

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) return;

    const result = await createSubject(formData);

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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Create New Subject
          </DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">
                Subject Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                placeholder="e.g., MATH"
                value={formData.code}
                onChange={(e) => {
                  setFormData({ ...formData, code: e.target.value.toUpperCase() });
                  setError(null);
                }}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="core">Core</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="arts">Arts</SelectItem>
                  <SelectItem value="languages">Languages</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Credit Hours</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={formData.credit_hours}
                onChange={(e) => setFormData({ ...formData, credit_hours: parseInt(e.target.value) || 1 })}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Class (Optional)</Label>
              <Select 
                value={formData.class_id || ''} 
                onValueChange={(value) => setFormData({ ...formData, class_id: value || undefined })}
                disabled={loading || loadingEntities}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
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
              <Label>Teacher (Optional)</Label>
              <Select 
                value={formData.teacher_id || ''} 
                onValueChange={(value) => setFormData({ ...formData, teacher_id: value || undefined })}
                disabled={loading || loadingEntities}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
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

          <div className="space-y-2">
            <Label>Curriculum</Label>
            <Select 
              value={formData.curriculum} 
              onValueChange={(value) => setFormData({ ...formData, curriculum: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cbc">CBC (Competency Based Curriculum)</SelectItem>
                <SelectItem value="8-4-4">8-4-4 System</SelectItem>
                <SelectItem value="igcse">IGCSE</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Description (Optional)</Label>
            <Input
              placeholder="Brief description of the subject"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim() || !formData.code.trim()}>
              {loading ? "Creating..." : "Create Subject"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSubjectForm;
