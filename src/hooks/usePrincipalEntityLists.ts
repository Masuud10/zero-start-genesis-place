
import { useQuery } from '@tanstack/react-query';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { supabase } from '@/integrations/supabase/client';

export const usePrincipalEntityLists = (reloadKey: number) => {
  const { schoolId } = useSchoolScopedData();

  const { data: classList = [], isLoading: classListLoading } = useQuery({
    queryKey: ['principal-classes', schoolId, reloadKey],
    queryFn: async () => {
      if (!schoolId) return [];
      
      const { data, error } = await supabase
        .from('classes')
        .select('id, name')
        .eq('school_id', schoolId)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!schoolId,
  });

  const { data: subjectList = [], isLoading: subjectListLoading } = useQuery({
    queryKey: ['principal-subjects', schoolId, reloadKey],
    queryFn: async () => {
      if (!schoolId) return [];
      
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!schoolId,
  });

  const { data: teacherList = [], isLoading: teacherListLoading } = useQuery({
    queryKey: ['principal-teachers', schoolId, reloadKey],
    queryFn: async () => {
      if (!schoolId) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('school_id', schoolId)
        .eq('role', 'teacher')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!schoolId,
  });

  return {
    classList,
    subjectList,
    teacherList,
    isLoading: classListLoading || subjectListLoading || teacherListLoading,
  };
};
