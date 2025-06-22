
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useSubjectService } from '@/hooks/useSubjectService';
import { usePrincipalEntityLists } from '@/hooks/usePrincipalEntityLists';
import { AlertCircle, UserPlus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreateAssignmentData } from '@/types/subject';

interface AssignTeacherFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AssignTeacherForm: React.FC<AssignTeacherFormProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<CreateAssignmentData>({
    subject_id: '',
    teacher_id: '',
    class_id: ''
  });
  const [error, setError] = useState<string | null>(null);

  const { createAssignment, loading } = useSubjectService();
  const { classList, teacherList, subjectList, loadingEntities } = usePrincipalEntityLists(0);

  const validateForm = () => {
    if (!formData.subject_id) {
      setError("Please select a subject");
      return false;
    }
    
    if (!formData.teacher_id) {
      setError("Please select a teacher");
      return false;
    }

    if (!formData.class_id) {
      setError("Please select a class");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) return;

    console.log('Submitting assignment:', formData);

    const result = await createAssignment(formData);

    if (result) {
      handleClose();
      onSuccess();
    }
  };

  const handleClose = () => {
    setFormData({
      subject_id: '',
      teacher_id: '',
      class_id: ''
    });
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <UserPlus className="h-5 w-5" />
            Assign Teacher to Subject
          </DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-gray-700">
              Subject <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={formData.subject_id} 
              onValueChange={(value) => {
                setFormData({ ...formData, subject_id: value });
                setError(null);
              }}
              disabled={loading || loadingEntities}
            >
              <SelectTrigger className="border-gray-300 focus:border-blue-500">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {subjectList.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">
              Teacher <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={formData.teacher_id} 
              onValueChange={(value) => {
                setFormData({ ...formData, teacher_id: value });
                setError(null);
              }}
              disabled={loading || loadingEntities}
            >
              <SelectTrigger className="border-gray-300 focus:border-blue-500">
                <SelectValue placeholder="Select a teacher" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {teacherList.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">
              Class <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={formData.class_id} 
              onValueChange={(value) => {
                setFormData({ ...formData, class_id: value });
                setError(null);
              }}
              disabled={loading || loadingEntities}
            >
              <SelectTrigger className="border-gray-300 focus:border-blue-500">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {classList.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
              disabled={loading || !formData.subject_id || !formData.teacher_id || !formData.class_id}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Assigning..." : "Assign Teacher"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignTeacherForm;
