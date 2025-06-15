
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Class, Subject } from '@/types/academic';

export interface TeacherClassInfo {
  class: Class;
  subject?: Subject;
}

const fetchTeacherClasses = async (teacherId: string): Promise<TeacherClassInfo[]> => {
  const { data, error } = await supabase
    .from('teacher_classes')
    .select(`
      classes (*),
      subjects (*)
    `)
    .eq('teacher_id', teacherId);

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return [];
  }

  const teacherClasses: TeacherClassInfo[] = data.map((item: any) => {
    const classData = item.classes;
    const subjectData = item.subjects;

    const mappedClass: Class = {
        id: classData.id,
        name: classData.name,
        schoolId: classData.school_id,
        created_at: classData.created_at,
        teacherId: classData.teacher_id,
    };

    const mappedSubject: Subject | undefined = subjectData ? {
        id: subjectData.id,
        name: subjectData.name,
        code: subjectData.code,
        schoolId: subjectData.school_id,
        classId: subjectData.class_id,
        teacherId: subjectData.teacher_id,
        created_at: subjectData.created_at,
    } : undefined;

    return {
      class: mappedClass,
      subject: mappedSubject,
    };
  });

  return teacherClasses;
};

export const useTeacherClasses = () => {
  const { user } = useAuth();
  const teacherId = user?.id;

  return useQuery<TeacherClassInfo[], Error>({
    queryKey: ['teacherClasses', teacherId],
    queryFn: () => fetchTeacherClasses(teacherId!),
    enabled: !!teacherId,
  });
};
