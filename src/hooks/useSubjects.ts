
import { useState, useEffect, useCallback } from 'react';
import { useSchoolScopedData } from './useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Subject {
  id: string;
  name: string;
  code: string;
  school_id: string;
  class_id?: string;
  teacher_id?: string;
  created_at: string;
}

function useTimeoutPromise<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), ms)
    )
  ]) as Promise<T>;
}

export const useSubjects = (classId?: string) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isSystemAdmin, schoolId } = useSchoolScopedData();
  const { toast } = useToast();

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('subjects').select(`
        id,
        name,
        code,
        school_id,
        class_id,
        teacher_id,
        created_at
      `);

      if (!isSystemAdmin && schoolId) {
        query = query.eq('school_id', schoolId);
      }
      if (classId && classId !== 'all') {
        query = query.eq('class_id', classId);
      }

      query = query.order('name');
      const { data, error: fetchError } = await useTimeoutPromise(
        Promise.resolve(query.then(x => x)),
        7000
      );
      if (fetchError) throw fetchError;

      setSubjects(data || []);
      setError(null);
    } catch (err: any) {
      const message = err?.message || 'Failed to fetch subjects data';
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
