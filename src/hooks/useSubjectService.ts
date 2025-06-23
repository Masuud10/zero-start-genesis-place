
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from './useSchoolScopedData';
import { SubjectService } from '@/services/subjectService';
import { SubjectDatabaseService } from '@/services/subject/subjectDatabaseService';
import { Subject, SubjectCreationData, SubjectAssignment, CreateAssignmentData } from '@/types/subject';

export const useSubjectService = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { schoolId, isReady } = useSchoolScopedData();

  const createSubject = useCallback(async (data: SubjectCreationData): Promise<Subject | null> => {
    console.log('useSubjectService.createSubject: Starting with data:', data);
    console.log('useSubjectService.createSubject: School context:', { schoolId, isReady });

    if (!isReady) {
      const errorMsg = "Authentication context not ready. Please refresh the page.";
      console.error('useSubjectService.createSubject: Context not ready');
      toast({
        title: "Authentication Error",
        description: errorMsg,
        variant: "destructive"
      });
      return null;
    }

    if (!schoolId) {
      const errorMsg = "No school context found. Please ensure you're logged in as a Principal.";
      console.error('useSubjectService.createSubject: No schoolId available');
      toast({
        title: "Authentication Error", 
        description: errorMsg,
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    try {
      console.log('useSubjectService.createSubject: Testing database connection');
      
      // Test database connection first
      const connectionOk = await SubjectDatabaseService.testConnection();
      if (!connectionOk) {
        throw new Error('Database connection failed. Please check your internet connection and try again.');
      }

      console.log('useSubjectService.createSubject: Database connection confirmed, starting creation process');
      console.log('useSubjectService.createSubject: Data to create:', { data, schoolId });
      
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
      
      // Handle specific error types
      if (error.message?.includes('already exists')) {
        errorMessage = error.message;
      } else if (error.message?.includes('Permission denied') || error.message?.includes('access denied')) {
        errorMessage = "You don't have permission to create subjects. Please contact your administrator.";
      } else if (error.message?.includes('Invalid reference') || error.message?.includes('does not exist')) {
        errorMessage = "The selected class or teacher is invalid. Please refresh the page and try again.";
      } else if (error.message?.includes('School ID is required') || error.message?.includes('authentication')) {
        errorMessage = "Session expired. Please log out and log back in.";
      } else if (error.message?.includes('required')) {
        errorMessage = error.message;
      } else if (error.message?.includes('Database connection failed')) {
        errorMessage = "Unable to connect to the database. Please check your internet connection and try again.";
      } else if (error.message?.includes('User authentication required')) {
        errorMessage = "Please log in again to continue.";
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
  }, [schoolId, isReady, toast]);

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
