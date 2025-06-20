
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from './useSchoolScopedData';
import { SubjectService } from '@/services/subjectService';
import { Subject, SubjectCreationData, SubjectAssignment, CreateAssignmentData } from '@/types/subject';

export const useSubjectService = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { schoolId } = useSchoolScopedData();

  const createSubject = useCallback(async (data: SubjectCreationData): Promise<Subject | null> => {
    if (!schoolId) {
      toast({
        title: "Error",
        description: "No school context found",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    try {
      const subject = await SubjectService.createSubject(data, schoolId);
      
      toast({
        title: "Success",
        description: "Subject created successfully"
      });
      
      return subject;
    } catch (error: any) {
      console.error('Subject creation failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create subject",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [schoolId, toast]);

  const createAssignment = useCallback(async (data: CreateAssignmentData): Promise<SubjectAssignment | null> => {
    if (!schoolId) {
      toast({
        title: "Error",
        description: "No school context found",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    try {
      const assignment = await SubjectService.createAssignment(data, schoolId);
      
      toast({
        title: "Success",
        description: "Teacher assigned to subject successfully"
      });
      
      return assignment;
    } catch (error: any) {
      console.error('Assignment creation failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign teacher",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [schoolId, toast]);

  const removeAssignment = useCallback(async (assignmentId: string): Promise<boolean> => {
    setLoading(true);
    try {
      await SubjectService.removeAssignment(assignmentId);
      
      toast({
        title: "Success",
        description: "Assignment removed successfully"
      });
      
      return true;
    } catch (error: any) {
      console.error('Assignment removal failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove assignment",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    createSubject,
    createAssignment,
    removeAssignment,
    loading
  };
};
