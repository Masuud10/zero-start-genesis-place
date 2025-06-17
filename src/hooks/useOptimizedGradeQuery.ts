
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface GradeQueryOptions {
  classId?: string;
  subjectId?: string;
  term?: string;
  examType?: string;
  enabled?: boolean;
}

export const useOptimizedGradeQuery = (options: GradeQueryOptions = {}) => {
  const { user } = useAuth();
  const { classId, subjectId, term, examType, enabled = true } = options;

  return useQuery({
    queryKey: ['grades', user?.school_id, classId, subjectId, term, examType],
    queryFn: async () => {
      if (!user?.school_id) {
        throw new Error('No school assignment found');
      }

      console.log('🔍 Fetching grades with filters:', { classId, subjectId, term, examType });

      let query = supabase
        .from('grades')
        .select(`
          *,
          students(id, name, admission_number),
          subjects(id, name, code),
          classes(id, name)
        `)
        .eq('school_id', user.school_id);

      // Apply filters conditionally
      if (classId) query = query.eq('class_id', classId);
      if (subjectId) query = query.eq('subject_id', subjectId);
      if (term) query = query.eq('term', term);
      if (examType) query = query.eq('exam_type', examType);

      // Role-based filtering
      if (user.role === 'teacher') {
        query = query.eq('submitted_by', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching grades:', error);
        throw new Error(`Failed to fetch grades: ${error.message}`);
      }

      console.log('✅ Successfully fetched grades:', data?.length || 0);
      return data || [];
    },
    enabled: enabled && !!user?.school_id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useGradeSubmissionMutation = () => {
  const { user } = useAuth();

  return async (gradeData: any) => {
    if (!user?.school_id) {
      throw new Error('No school assignment found');
    }

    if (!gradeData.class_id || !gradeData.subject_id || !gradeData.student_id) {
      throw new Error('Missing required fields: class_id, subject_id, or student_id');
    }

    const payload = {
      ...gradeData,
      school_id: user.school_id,
      submitted_by: user.id,
      submitted_at: new Date().toISOString(),
      status: user.role === 'teacher' ? 'submitted' : 'draft',
    };

    console.log('📝 Submitting grade with payload:', payload);

    const { data, error } = await supabase
      .from('grades')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('❌ Error submitting grade:', error);
      throw new Error(`Failed to submit grade: ${error.message}`);
    }

    console.log('✅ Successfully submitted grade:', data);
    return data;
  };
};
