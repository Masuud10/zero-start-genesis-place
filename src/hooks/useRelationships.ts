
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ClassManagementService } from '@/services/classManagementService';

export const useRelationships = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const assignTeacher = async (teacherId: string, classId: string, subjectId?: string) => {
    try {
      setLoading(true);
      const { error } = await ClassManagementService.assignTeacherToClass({
        teacherId,
        classId,
        subjectId
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to assign teacher to class",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "Teacher assigned to class successfully",
      });
      return true;
    } catch (error) {
      console.error('Error assigning teacher:', error);
      toast({
        title: "Error",
        description: "Failed to assign teacher to class",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const enrollStudent = async (studentId: string, classId: string, academicYear?: string) => {
    try {
      setLoading(true);
      const { error } = await ClassManagementService.enrollStudent({
        studentId,
        classId,
        academicYear
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to enroll student in class",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "Student enrolled in class successfully",
      });
      return true;
    } catch (error) {
      console.error('Error enrolling student:', error);
      toast({
        title: "Error",
        description: "Failed to enroll student in class",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const linkParent = async (parentId: string, studentId: string, relationshipType?: string, isPrimaryContact?: boolean) => {
    try {
      setLoading(true);
      const { error } = await ClassManagementService.linkParentToStudent({
        parentId,
        studentId,
        relationshipType,
        isPrimaryContact
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to link parent to student",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "Parent linked to student successfully",
      });
      return true;
    } catch (error) {
      console.error('Error linking parent:', error);
      toast({
        title: "Error",
        description: "Failed to link parent to student",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    assignTeacher,
    enrollStudent,
    linkParent
  };
};
