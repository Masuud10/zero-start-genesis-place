
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
      
      // Ensure all required fields are present with defaults
      const completeData: SubjectCreationData = {
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        curriculum: data.curriculum || 'cbc',
        category: data.category || 'core',
        credit_hours: data.credit_hours || 1,
        class_id: data.class_id || undefined,
        teacher_id: data.teacher_id || undefined,
        description: data.description?.trim() || ''
      };

      // Validate required fields
      if (!completeData.name) {
        throw new Error('Subject name is required');
      }
      if (!completeData.code) {
        throw new Error('Subject code is required');
      }
      if (!completeData.curriculum) {
        throw new Error('Curriculum type is required');
      }
      if (!completeData.category) {
        throw new Error('Subject category is required');
      }

      const result = await SubjectService.createSubject(completeData, schoolId);
      
      console.log('useSubjectService: Subject created successfully:', result);
      
      toast({
        title: "Success",
        description: `Subject "${result.name}" created successfully with ${result.curriculum?.toUpperCase() || 'CBC'} curriculum!`,
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
