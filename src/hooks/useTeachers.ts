import { useState, useEffect, useCallback } from 'react';
import { useSchoolScopedData } from './useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone?: string;
  school_id: string;
  created_at: string;
}

export const useTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isSystemAdmin, schoolId, isReady } = useSchoolScopedData();
  const { toast } = useToast();

  const fetchTeachers = useCallback(async () => {
    if (!isReady) {
      console.log('👨‍🏫 School context not ready yet');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('👨‍🏫 Fetching teachers for school:', schoolId);

      let query = supabase.from('profiles').select(`
        id,
        name,
        email,
        phone,
        school_id,
        created_at
      `).eq('role', 'teacher');

      // Apply school filter for non-admin users
      if (!isSystemAdmin && schoolId) {
        query = query.eq('school_id', schoolId);
      }

      // Order by name for consistent results
      query = query.order('name');

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('👨‍🏫 Teachers fetch error:', fetchError);
        throw fetchError;
      }

      console.log('👨‍🏫 Teachers fetched successfully:', data?.length || 0);
      setTeachers(data || []);
      setError(null);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch teachers data';
      console.error('👨‍🏫 Teachers fetch failed:', err);
      setError(message);
      setTeachers([]);
      
      toast({
        title: "Teachers Fetch Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isSystemAdmin, schoolId, toast, isReady]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  return {
    teachers,
    loading,
    error,
    retry: fetchTeachers
  };
}; 