
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export const useGradeSubmissionMutation = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gradeData: any) => {
      if (!user?.id || !schoolId) {
        throw new Error('User ID and School ID are required');
      }

      // Ensure all required fields are present
      if (!gradeData.student_id || !gradeData.subject_id || !gradeData.class_id || !gradeData.term || !gradeData.exam_type) {
        throw new Error('Missing required grade data fields');
      }

      const completeGradeData = {
        ...gradeData,
        school_id: schoolId,
        submitted_by: user.id,
        submitted_at: new Date().toISOString(),
        status: gradeData.status || 'draft',
        exam_type: gradeData.exam_type.toUpperCase() // Ensure uppercase format
      };

      console.log('Submitting grade:', completeGradeData);

      const { data, error } = await supabase
        .from('grades')
        .upsert(completeGradeData, {
          onConflict: 'school_id,student_id,subject_id,class_id,term,exam_type,submitted_by',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('Grade submission error:', error);
        throw new Error(`Failed to submit grade: ${error.message}`);
      }
      
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch grades
      queryClient.invalidateQueries({ queryKey: ['grades'] });
    },
    onError: (error) => {
      console.error('Grade submission mutation error:', error);
    }
  });
};
