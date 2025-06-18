
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from './useSchoolScopedData';

export interface TeacherSubject {
  id: string;
  name: string;
  code: string;
  class_id: string;
  class_name: string;
}

const fetchTeacherSubjects = async (teacherId: string, schoolId: string): Promise<TeacherSubject[]> => {
  const { data, error } = await supabase
    .from('teacher_classes')
    .select(`
      subject:subjects (id, name, code, class_id),
      class:classes (id, name)
    `)
    .eq('teacher_id', teacherId)
    .eq('school_id', schoolId)
    .not('subject_id', 'is', null);

  if (error) {
    console.error('Error fetching teacher subjects:', error);
    throw new Error(error.message);
  }

  return (data || []).map((item: any) => ({
    id: item.subject?.id || '',
    name: item.subject?.name || 'Unknown Subject',
    code: item.subject?.code || '',
    class_id: item.subject?.class_id || item.class?.id || '',
    class_name: item.class?.name || 'Unknown Class',
  })).filter(subject => subject.id); // Filter out any subjects without valid IDs
};

export const useTeacherSubjects = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const teacherId = user?.id;

  return useQuery<TeacherSubject[], Error>({
    queryKey: ['teacherSubjects', teacherId, schoolId],
    queryFn: () => fetchTeacherSubjects(teacherId!, schoolId!),
    enabled: !!teacherId && !!schoolId && user?.role === 'teacher',
  });
};
