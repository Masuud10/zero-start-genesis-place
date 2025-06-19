
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from './useSchoolScopedData';

interface UseOptimizedGradeQueryProps {
  enabled?: boolean;
}

export const useOptimizedGradeQuery = ({ enabled = true }: UseOptimizedGradeQueryProps = {}) => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();

  return useQuery({
    queryKey: ['grades', user?.id, schoolId],
    queryFn: async () => {
      if (!user?.id || !schoolId) return [];

      const { data, error } = await supabase
        .from('grades')
        .select(`
          id,
          student_id,
          subject_id,
          class_id,
          term,
          exam_type,
          score,
          max_score,
          percentage,
          letter_grade,
          cbc_performance_level,
          status,
          submitted_by,
          submitted_at,
          approved_by,
          approved_at,
          created_at
        `)
        .eq('school_id', schoolId)
        .eq('submitted_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching grades:', error);
        throw error;
      }

      return data || [];
    },
    enabled: enabled && !!user?.id && !!schoolId
  });
};
