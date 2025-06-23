
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
      const errorMsg = "No school context found. Please ensure you're logged in as a Principal.";
      console.error('createSubject: No schoolId available');
      toast({
        title: "Authentication Error",
        description: errorMsg,
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    try {
      console.log('useSubjectService.createSubject: Starting creation process', { data, schoolId });
      
      const subject = await SubjectService.createSubject(data, schoolId);
      
      console.log('useSubjectService.createSubject: Subject created successfully', subject);
      
      toast({
        title: "Success",
        description: `Subject "${subject.name}" created successfully`
      });
      
      return subject;
    } catch (error: any) {
      console.error('useSubjectService.createSubject: Creation failed', error);
      
      // Enhanced error handling with specific messages
      let errorMessage = error.message || "Failed to create subject";
      
      if (error.message?.includes('already exists')) {
        errorMessage = error.message;
      } else if (error.message?.includes('Permission denied')) {
        errorMessage = "You don't have permission to create subjects. Please contact your administrator.";
      } else if (error.message?.includes('Invalid reference')) {
        errorMessage = "The selected class or teacher is invalid. Please refresh the page and try again.";
      } else if (error.message?.includes('School ID is required')) {
        errorMessage = "Session expired. Please log out and log back in.";
      }
      
      toast({
        title: "Error Creating Subject",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [schoolId, toast]);

  const createAssignment = useCallback(async (data: CreateAssignmentData): Promise<SubjectAssignment | null> => {
    if (!schoolId) {
      const errorMsg = "No school context found. Please ensure you're logged in properly.";
      console.error('createAssignment: No schoolId available');
      toast({
        title: "Authentication Error",
        description: errorMsg,
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    try {
      console.log('useSubjectService.createAssignment: Starting assignment process', { data, schoolId });
      
      const assignment = await SubjectService.createAssignment(data, schoolId);
      
      console.log('useSubjectService.createAssignment: Assignment created successfully', assignment);
      
      toast({
        title: "Success",
        description: "Teacher assigned to subject successfully"
      });
      
      return assignment;
    } catch (error: any) {
      console.error('useSubjectService.createAssignment: Assignment failed', error);
      
      let errorMessage = error.message || "Failed to assign teacher";
      
      if (error.message?.includes('already assigned')) {
        errorMessage = error.message;
      } else if (error.message?.includes('Permission denied')) {
        errorMessage = "You don't have permission to create assignments. Please contact your administrator.";
      }
      
      toast({
        title: "Error Creating Assignment",
        description: errorMessage,
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
      console.log('useSubjectService.removeAssignment: Starting removal', assignmentId);
      
      await SubjectService.removeAssignment(assignmentId);
      
      console.log('useSubjectService.removeAssignment: Assignment removed successfully');
      
      toast({
        title: "Success",
        description: "Assignment removed successfully"
      });
      
      return true;
    } catch (error: any) {
      console.error('useSubjectService.removeAssignment: Removal failed', error);
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
