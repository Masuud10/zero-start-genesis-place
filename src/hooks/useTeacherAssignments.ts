
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
  class: { id: string, name: string };
}

const fetchTeacherAssignments = async (classId: string, schoolId: string): Promise<TeacherAssignment[]> => {
  const { data, error } = await supabase
    .from('teacher_classes')
    .select(`
      id,
      class_id,
      subject_id,
      teacher_id,
      teacher:profiles (id, name),
      subject:subjects (id, name),
      class:classes (id, name)
    `)
    .eq('school_id', schoolId)
    .eq('class_id', classId);

  if (error) throw new Error(error.message);

  return (data || []).map((item: any) => ({
    ...item,
    teacher: item.teacher || { id: item.teacher_id, name: 'Unknown Teacher' },
    subject: item.subject || { id: item.subject_id, name: 'Unknown Subject' },
    class: item.class || { id: item.class_id, name: 'Unknown Class' },
  }));
};

export const useTeacherAssignments = (classId: string | null) => {
  const { schoolId } = useSchoolScopedData();

  return useQuery<TeacherAssignment[], Error>({
    queryKey: ['teacherAssignments', classId, schoolId],
    queryFn: () => fetchTeacherAssignments(classId!, schoolId!),
    enabled: !!classId && !!schoolId,
  });
};
