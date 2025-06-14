
import { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSystemAdmin, schoolId } = useSchoolScopedData();
  const { toast } = useToast();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
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

      if (classId && classId !== 'all') {
        query = query.eq('class_id', classId);
      }

      const { data, error: fetchError } = await query.order('name');

      if (fetchError) {
        console.error('Error fetching students:', fetchError);
        setError(fetchError.message);
        toast({
          title: "Error",
          description: "Failed to fetch students data",
          variant: "destructive",
        });
        setStudents([]);
        return;
      }

      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: "Failed to fetch students data",
        variant: "destructive",
      });
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (schoolId !== null || isSystemAdmin) {
      fetchStudents();
    }
  }, [classId, isSystemAdmin, schoolId]);

  return {
    students,
    loading,
    error,
    refetchStudents: fetchStudents
  };
};
