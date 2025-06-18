
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSubjectManagement } from './useSubjectManagement';

interface AssignTeacherParams {
  teacherId: string;
  classId: string;
  subjectId: string;
}

interface UnassignTeacherParams {
  assignmentId: string;
  classId?: string;
}

export const useRelationships = () => {
  const { toast } = useToast();
  const { assignTeacherToSubject, removeAssignment } = useSubjectManagement();
  const [loading, setLoading] = useState(false);

  const assignTeacher = async (params: AssignTeacherParams) => {
    setLoading(true);
    try {
      const result = await assignTeacherToSubject({
        subject_id: params.subjectId,
        teacher_id: params.teacherId,
        class_id: params.classId
      });

      if (result) {
        toast({
          title: "Success",
          description: "Teacher assigned successfully"
        });
        return result;
      }
      return null;
    } catch (error: any) {
      console.error('Error in assignTeacher:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign teacher",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const unassignTeacher = async (params: UnassignTeacherParams) => {
    setLoading(true);
    try {
      const success = await removeAssignment(params.assignmentId);
      if (success) {
        toast({
          title: "Success",
          description: "Teacher unassigned successfully"
        });
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error in unassignTeacher:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to unassign teacher",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    assignTeacher,
    unassignTeacher,
    loading
  };
};
