
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from './useSchoolScopedData';

export interface TeacherAssignment {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  teacher: { id: string; name: string };
  subject: { id: string; name: string };
  class: { id: string; name: string };
}

export const useTeacherAssignments = (classId?: string | null) => {
  const { schoolId } = useSchoolScopedData();

  return useQuery({
    queryKey: ['teacher-assignments', schoolId, classId],
    queryFn: async () => {
      if (!schoolId) return [];

      let query = supabase
        .from('subject_teacher_assignments')
        .select(`
          *,
          subject:subjects(id, name, code),
          teacher:profiles!teacher_id(id, name, email),
          class:classes(id, name)
        `)
        .eq('school_id', schoolId)
        .eq('is_active', true);

      if (classId) {
        query = query.eq('class_id', classId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching teacher assignments:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!schoolId
  });
};
