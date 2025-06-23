
import { useQuery } from '@tanstack/react-query';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { supabase } from '@/integrations/supabase/client';

export const usePrincipalEntityLists = (reloadKey: number) => {
  const { schoolId } = useSchoolScopedData();

  const { data: classList = [], isLoading: classListLoading, error: classListError } = useQuery({
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

  const { data: subjectList = [], isLoading: subjectListLoading, error: subjectListError } = useQuery({
    queryKey: ['principal-subjects', schoolId, reloadKey],
    queryFn: async () => {
      if (!schoolId) return [];
      
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name, code')
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!schoolId,
  });

  const { data: teacherList = [], isLoading: teacherListLoading, error: teacherListError } = useQuery({
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

  const { data: parentList = [], isLoading: parentListLoading, error: parentListError } = useQuery({
    queryKey: ['principal-parents', schoolId, reloadKey],
    queryFn: async () => {
      if (!schoolId) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('school_id', schoolId)
        .eq('role', 'parent')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!schoolId,
  });

  const isLoading = classListLoading || subjectListLoading || teacherListLoading || parentListLoading;
  const errorEntities = classListError?.message || subjectListError?.message || teacherListError?.message || parentListError?.message || null;

  return {
    classList,
    subjectList,
    teacherList,
    parentList,
    isLoading,
    loadingEntities: isLoading,
    errorEntities,
  };
};
