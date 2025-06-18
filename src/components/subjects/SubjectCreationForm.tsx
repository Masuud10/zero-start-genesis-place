
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSubjectManagement } from '@/hooks/useSubjectManagement';
import { usePrincipalEntityLists } from '@/hooks/usePrincipalEntityLists';
import { AlertCircle, BookOpen } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SubjectCreationFormProps {
  open: boolean;
  onClose: () => void;
  onSubjectCreated: () => void;
}

const SubjectCreationForm: React.FC<SubjectCreationFormProps> = ({
  open,
  onClose,
  onSubjectCreated
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    class_id: '',
    teacher_id: '',
    curriculum: 'cbc'
  });
  const [error, setError] = useState<string | null>(null);

  const { createSubject, loading } = useSubjectManagement();
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

    const result = await createSubject({
      name: formData.name.trim(),
      code: formData.code.trim(),
      class_id: formData.class_id || undefined,
      teacher_id: formData.teacher_id || undefined,
      curriculum: formData.curriculum
    });

    if (result) {
      handleClose();
      onSubjectCreated();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      code: '',
      class_id: '',
      teacher_id: '',
      curriculum: 'cbc'
    });
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
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
          <div className="space-y-2">
            <Label htmlFor="name">
              Subject Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Mathematics, English"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setError(null);
              }}
              required
              maxLength={100}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">
              Subject Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="code"
              placeholder="e.g., MATH, ENG"
              value={formData.code}
              onChange={(e) => {
                setFormData({ ...formData, code: e.target.value.toUpperCase() });
                setError(null);
              }}
              required
              maxLength={10}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Code will be automatically converted to uppercase
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="class_id">Class (Optional)</Label>
              <Select 
                value={formData.class_id} 
                onValueChange={(value) => setFormData({ ...formData, class_id: value })}
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
              <Label htmlFor="teacher_id">Teacher (Optional)</Label>
              <Select 
                value={formData.teacher_id} 
                onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}
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
            <Label htmlFor="curriculum">Curriculum</Label>
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

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim() || !formData.code.trim()}>
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Creating...
                </>
              ) : (
                "Create Subject"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubjectCreationForm;
