
import { useState, useEffect, useCallback } from 'react';
import { useSchoolScopedData } from './useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Class {
  id: string;
  name: string;
  school_id: string;
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

export const useClasses = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isSystemAdmin, schoolId } = useSchoolScopedData();
  const { toast } = useToast();

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('classes').select(`
        id,
        name,
        school_id,
        teacher_id,
        created_at
      `);

      if (!isSystemAdmin && schoolId) {
        query = query.eq('school_id', schoolId);
      }

      // Always call order before making the request!
      query = query.order('name');

      // The key fix is here:
      const { data, error: fetchError } = await useTimeoutPromise(
        query.then(x => x),
        7000
      );
      if (fetchError) throw fetchError;

      setClasses(data || []);
    } catch (err: any) {
      const message = err?.message || 'Failed to fetch classes data';
      setError(message);
      setClasses([]);
      toast({
        title: "Class Fetch Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isSystemAdmin, schoolId, toast]);

  useEffect(() => {
    if (schoolId !== null || isSystemAdmin) {
      fetchClasses();
    } else {
      setClasses([]);
      setLoading(false);
    }
  }, [isSystemAdmin, schoolId, fetchClasses]);

  return {
    classes,
    loading,
    error,
    refetchClasses: fetchClasses
  };
};
