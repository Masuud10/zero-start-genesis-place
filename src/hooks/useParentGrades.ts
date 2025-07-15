import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ParentGradeData {
  id: string;
  name: string;
  grades: Array<{
    id: string;
    score: number;
    max_score: number;
    percentage: number;
    letter_grade: string;
    position: number;
    term: string;
    academic_year: string;
    exam_type: string;
    status: string;
    created_at: string;
    subject: {
      name: string;
      code: string;
    };
    class: {
      name: string;
      level: string;
    };
  }>;
}

export const useParentGrades = () => {
  return useQuery({
    queryKey: ['parent-grades'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('parent-grades');
      
      if (error) {
        throw new Error(error.message || 'Failed to fetch children grades');
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }
      
      return data?.data as ParentGradeData[];
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};