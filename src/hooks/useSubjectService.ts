
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from './useSchoolScopedData';
import { SubjectService } from '@/services/subjectService';
import { Subject, SubjectCreationData } from '@/types/subject';

export const useSubjectService = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { schoolId } = useSchoolScopedData();

  const createSubject = useCallback(async (data: SubjectCreationData): Promise<Subject | null> => {
    if (!schoolId) {
      toast({
        title: "Error",
        description: "No school context found. Please contact your administrator.",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    try {
      console.log('useSubjectService: Creating subject with data:', data);
      
      const result = await SubjectService.createSubject(data, schoolId);
      
      console.log('useSubjectService: Subject created successfully:', result);
      
      toast({
        title: "Success",
        description: `Subject "${result.name}" created successfully!`,
      });
      
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to create subject';
      console.error('useSubjectService: Error creating subject:', error);
      
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

  const getSubjects = useCallback(async (classId?: string): Promise<Subject[]> => {
    if (!schoolId) {
      return [];
    }

    try {
      return await SubjectService.getSubjects(schoolId, classId);
    } catch (error: any) {
      console.error('useSubjectService: Error fetching subjects:', error);
      return [];
    }
  }, [schoolId]);

  return {
    createSubject,
    getSubjects,
    loading
  };
};
