
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from './useSchoolScopedData';
import { SubjectService } from '@/services/subjectService';
import { Subject } from '@/types/subject';

export const useSubjectService = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { schoolId } = useSchoolScopedData();

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
    getSubjects,
    loading
  };
};
