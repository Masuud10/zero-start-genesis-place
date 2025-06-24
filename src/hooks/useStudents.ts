
import { useState, useEffect, useCallback } from 'react';
import { useSchoolScopedData } from './useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Student {
  id: string;
  name: string;
  admission_number: string;
  class_id: string;
  school_id: string;
  parent_id?: string;
  roll_number?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  parent_contact?: string;
  is_active: boolean;
  created_at: string;
}

export const useStudents = (classId?: string) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isSystemAdmin, schoolId, isReady } = useSchoolScopedData();
  const { toast } = useToast();

  const fetchStudents = useCallback(async () => {
    if (!isReady) {
      console.log('📚 School context not ready yet');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('📚 Fetching students for school:', schoolId, 'class:', classId);

      let query = supabase.from('students').select(`
        id,
        name,
        admission_number,
        class_id,
        school_id,
        parent_id,
        roll_number,
        date_of_birth,
        gender,
        address,
        parent_contact,
        is_active,
        created_at
      `);

      // Apply school filter for non-admin users
      if (!isSystemAdmin && schoolId) {
        query = query.eq('school_id', schoolId);
      }

      // Apply class filter if specified
      if (classId && classId !== 'all') {
        query = query.eq('class_id', classId);
      }

      // Order by name for consistent results
      query = query.order('name');

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('📚 Students fetch error:', fetchError);
        throw fetchError;
      }

      console.log('📚 Students fetched successfully:', data?.length || 0);
      setStudents(data || []);
      setError(null);

    } catch (err: any) {
      const message = err?.message || 'Failed to fetch students data';
      console.error('📚 Students fetch failed:', err);
      setError(message);
      setStudents([]);
      
      toast({
        title: "Student Fetch Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [classId, isSystemAdmin, schoolId, toast, isReady]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    loading,
    error,
    retry: fetchStudents
  };
};
