
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

export const useStudents = (classId?: string, pagination?: { page: number; pageSize: number }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalStudents, setTotalStudents] = useState(0);
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
      console.log('📚 Fetching students for school:', schoolId, 'class:', classId, 'pagination:', pagination);

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
      `, { count: 'exact' });

      // Apply school filter for non-admin users
      if (!isSystemAdmin && schoolId) {
        query = query.eq('school_id', schoolId);
      }

      // Apply class filter if specified
      if (classId && classId !== 'all') {
        query = query.eq('class_id', classId);
      }

      // Apply pagination if provided
      if (pagination) {
        const offset = (pagination.page - 1) * pagination.pageSize;
        query = query
          .order('name')
          .range(offset, offset + pagination.pageSize - 1);
      } else {
        // Default pagination for performance
        query = query.order('name').limit(50);
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        console.error('📚 Students fetch error:', fetchError);
        throw fetchError;
      }

      console.log('📚 Students fetched successfully:', data?.length || 0, 'Total:', count || 0);
      setStudents(data || []);
      setTotalStudents(count || 0);
      setError(null);

    } catch (err) {
      console.error('📚 Students fetch failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
      setStudents([]);
      setTotalStudents(0);
    } finally {
      setLoading(false);
    }
  }, [isReady, schoolId, classId, isSystemAdmin, pagination]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    loading,
    error,
    retry: fetchStudents,
    totalStudents
  };
};
