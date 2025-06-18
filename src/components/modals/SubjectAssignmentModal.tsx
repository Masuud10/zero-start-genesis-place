
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { supabase } from '@/integrations/supabase/client';
import { usePrincipalEntityLists } from '@/hooks/usePrincipalEntityLists';
import { UserPlus, BookOpen, Users, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SubjectAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  onAssignmentCreated: () => void;
}

const SubjectAssignmentModal: React.FC<SubjectAssignmentModalProps> = ({
  open,
  onClose,
  onAssignmentCreated
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { classList, subjectList, teacherList } = usePrincipalEntityLists(0);
  
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredSubjects = subjectList.filter(subject => 
    !selectedClass || subject.class_id === selectedClass
  );

  const handleSubmit = async () => {
    if (!selectedClass || !selectedSubject || !selectedTeacher) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if assignment already exists
      const { data: existingAssignment } = await supabase
        .from('subject_teacher_assignments')
        .select('id')
        .eq('teacher_id', selectedTeacher)
        .eq('subject_id', selectedSubject)
        .eq('class_id', selectedClass)
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .maybeSingle();

      if (existingAssignment) {
        toast({
          title: "Error",
          description: "This teacher is already assigned to this subject for this class",
          variant: "destructive"
        });
        return;
      }

      // Create new assignment
      const { error } = await supabase
        .from('subject_teacher_assignments')
        .insert({
          school_id: schoolId,
          teacher_id: selectedTeacher,
          subject_id: selectedSubject,
          class_id: selectedClass,
          assigned_by: user?.id,
          is_active: true
        });

      if (error) throw error;

      // Update the subjects table with the teacher assignment for backward compatibility
      await supabase
        .from('subjects')
        .update({ teacher_id: selectedTeacher })
        .eq('id', selectedSubject);

      toast({
        title: "Success",
        description: "Subject assigned to teacher successfully!",
      });

      onAssignmentCreated();
      handleClose();

    } catch (error: any) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create assignment",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedClass('');
    setSelectedSubject('');
    setSelectedTeacher('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Assign Subject to Teacher
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Class Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Class <span className="text-red-500">*</span>
            </label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classList.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id}>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      {classItem.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Subject <span className="text-red-500">*</span>
            </label>
            <Select 
              value={selectedSubject} 
              onValueChange={setSelectedSubject}
              disabled={!selectedClass}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {filteredSubjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {subject.name} ({subject.code})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Teacher Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Teacher <span className="text-red-500">*</span>
            </label>
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent>
                {teacherList.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {teacher.name}
                      {teacher.email && (
                        <span className="text-xs text-gray-500">({teacher.email})</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!selectedClass || !selectedSubject || !selectedTeacher || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Subject
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubjectAssignmentModal;
