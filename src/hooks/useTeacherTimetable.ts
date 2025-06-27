
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';

export const useTeacherTimetable = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();

  return useQuery({
    queryKey: ['teacher-timetable', user?.id, schoolId],
    queryFn: async () => {
      if (!user?.id || !schoolId || user.role !== 'teacher') {
        return [];
      }

      const { data, error } = await supabase
        .from('timetables')
        .select(`
          id,
          day_of_week,
          start_time,
          end_time,
          room,
          subjects!inner(id, name),
          classes!inner(id, name)
        `)
        .eq('teacher_id', user.id)
        .eq('school_id', schoolId)
        .eq('is_published', true)
        .order('day_of_week')
        .order('start_time');

      if (error) {
        console.error('Error fetching teacher timetable:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id && !!schoolId && user?.role === 'teacher',
  });
};
