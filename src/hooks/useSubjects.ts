
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
  curriculum?: string;
  created_at: string;
}

function useTimeoutPromise<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), ms)
    )
  ]);
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
      console.log('Fetching subjects with params:', { classId, isSystemAdmin, schoolId });
      
      let query = supabase.from('subjects').select(`
        id,
        name,
        code,
        school_id,
        class_id,
        teacher_id,
        curriculum,
        created_at
      `);

      // Multi-tenancy is now enforced by RLS policies, but we still filter for performance
      if (!isSystemAdmin && schoolId) {
        query = query.eq('school_id', schoolId);
      }
      
      // Only filter by class if classId is provided and not 'all'
      if (classId && classId !== 'all') {
        query = query.eq('class_id', classId);
      }

      query = query.order('name');
      
      // Execute the query with timeout
      const result = await useTimeoutPromise(
        query,
        7000
      );
      
      if (result.error) {
        console.error('Subjects fetch error:', result.error);
        throw result.error;
      }

      console.log('Fetched subjects:', result.data?.length || 0);
      setSubjects(result.data || []);
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
    // Only fetch if we have school context or user is system admin
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
