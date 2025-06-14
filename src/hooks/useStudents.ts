
import { useState, useEffect } from 'react';
import { useSchoolScopedData } from './useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';

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
  const { buildSchoolScopedQuery } = useSchoolScopedData();
  const { toast } = useToast();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      let query = buildSchoolScopedQuery('students', `
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

      if (classId && classId !== 'all') {
        query = query.eq('class_id', classId);
      }

      const { data, error } = await query.eq('is_active', true).order('name');

      if (error) {
        console.error('Error fetching students:', error);
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
    fetchStudents();
  }, [classId]);

  return {
    students,
    loading,
    refetchStudents: fetchStudents
  };
};
