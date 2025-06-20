
import { useState, useEffect, useCallback } from 'react';
import { useSchoolScopedData } from './useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';
import { SubjectService } from '@/services/subjectService';
import { Subject } from '@/types/subject';

export const useSubjects = (classId?: string) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isSystemAdmin, schoolId } = useSchoolScopedData();
  const { toast } = useToast();

  const fetchSubjects = useCallback(async () => {
    if (!schoolId && !isSystemAdmin) {
      setSubjects([]);
      setLoading(false);
      return;
    }

    if (!schoolId) {
      setError('No school context found');
      setSubjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching subjects with params:', { classId, isSystemAdmin, schoolId });
      
      const data = await SubjectService.getSubjects(schoolId, classId);
      
      console.log('Fetched subjects:', data?.length || 0);
      setSubjects(data || []);
      setError(null);
      
    } catch (err: any) {
      const message = err?.message || 'Failed to fetch subjects data';
      console.error('Error fetching subjects:', err);
      setError(message);
      setSubjects([]);
      toast({
        title: "Subjects Fetch Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [classId, isSystemAdmin, schoolId, toast]);

  useEffect(() => {
    if (schoolId !== null || isSystemAdmin) {
      fetchSubjects();
    } else {
      setSubjects([]);
      setLoading(false);
    }
  }, [classId, isSystemAdmin, schoolId, fetchSubjects]);

  return {
    subjects,
    loading,
    error,
    retry: fetchSubjects
  };
};
