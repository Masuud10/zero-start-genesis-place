
import { useState, useEffect } from 'react';
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

export const useSubjects = (classId?: string) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const { isSystemAdmin, schoolId } = useSchoolScopedData();
  const { toast } = useToast();

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      
      let query = supabase.from('subjects').select(`
        id,
        name,
        code,
        school_id,
        class_id,
        teacher_id,
        created_at
      `);

      // Apply school filter for non-admin users
      if (!isSystemAdmin && schoolId) {
        query = query.eq('school_id', schoolId);
      }

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
        setSubjects([]);
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
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [classId, isSystemAdmin, schoolId]);

  return {
    subjects,
    loading,
    refetchSubjects: fetchSubjects
  };
};
