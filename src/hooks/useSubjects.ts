
import { useState, useEffect } from 'react';
import { useSchoolScopedData } from './useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';

interface Subject {
  id: string;
  name: string;
  code: string;
  school_id: string;
  class_id?: string;
  teacher_id?: string;
  created_at: string;
}

export const useSubjects = (classId?: string) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const { createSchoolScopedQuery } = useSchoolScopedData();
  const { toast } = useToast();

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      let query = createSchoolScopedQuery('subjects', `
        id,
        name,
        code,
        school_id,
        class_id,
        teacher_id,
        created_at
      `);

      if (classId && classId !== 'all') {
        query = query.eq('class_id', classId);
      }

      const { data, error } = await query.order('name');

      if (error) {
        console.error('Error fetching subjects:', error);
        toast({
          title: "Error",
          description: "Failed to fetch subjects data",
          variant: "destructive",
        });
        return;
      }

      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast({
        title: "Error",
        description: "Failed to fetch subjects data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [classId]);

  return {
    subjects,
    loading,
    refetchSubjects: fetchSubjects
  };
};
