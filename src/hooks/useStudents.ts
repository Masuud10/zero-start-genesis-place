
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

function useTimeoutPromise<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), ms)
    )
  ]) as Promise<T>;
}

export const useStudents = (classId?: string) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isSystemAdmin, schoolId } = useSchoolScopedData();
  const { toast } = useToast();

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
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

      setStudents(data || []);
      setError(null);
    } catch (err: any) {
      const message = err?.message || 'Failed to fetch students data';
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
  }, [classId, isSystemAdmin, schoolId, toast]);

  useEffect(() => {
    if (schoolId !== null || isSystemAdmin) {
      fetchStudents();
    } else {
      setStudents([]);
      setLoading(false);
    }
  }, [classId, isSystemAdmin, schoolId, fetchStudents]);

  return {
    students,
    loading,
    error,
    retry: fetchStudents
  };
};
