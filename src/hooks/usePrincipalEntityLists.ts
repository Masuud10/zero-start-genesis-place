
import { useQuery } from '@tanstack/react-query';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { supabase } from '@/integrations/supabase/client';

export const usePrincipalEntityLists = (reloadKey: number) => {
  const { schoolId } = useSchoolScopedData();

  // Optimized single query for all subjects with proper error handling
  const { data: subjectList = [], isLoading: subjectListLoading, error: subjectListError } = useQuery({
    queryKey: ['principal-subjects-optimized', schoolId, reloadKey],
    queryFn: async () => {
      if (!schoolId) {
        console.warn('No school ID provided for subject fetch');
        return [];
      }
      
      console.log('Fetching subjects for school:', schoolId);
      
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select(`
            id, 
            name, 
            code, 
            class_id, 
            teacher_id, 
            curriculum, 
            category, 
            is_active,
            credit_hours,
            assessment_weight,
            description,
            created_at
          `)
          .eq('school_id', schoolId)
          .eq('is_active', true)
          .order('name')
          .limit(1000); // Prevent runaway queries

        if (error) {
          console.error('Supabase error fetching subjects:', error);
          throw new Error(`Database error: ${error.message} (Code: ${error.code})`);
        }

        console.log('Successfully fetched subjects:', data?.length || 0);
        return data || [];
      } catch (error: any) {
        console.error('Subject fetch error:', error);
        throw new Error(error.message || 'Failed to fetch subjects');
      }
    },
    enabled: !!schoolId,
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });

  // Separate optimized queries for other entities
  const { data: classList = [], isLoading: classListLoading, error: classListError } = useQuery({
    queryKey: ['principal-classes-optimized', schoolId, reloadKey],
    queryFn: async () => {
      if (!schoolId) return [];
      
      try {
        const { data, error } = await supabase
          .from('classes')
          .select('id, name, level, stream, curriculum_type')
          .eq('school_id', schoolId)
          .order('name')
          .limit(500);
        
        if (error) {
          console.error('Error fetching classes:', error);
          throw new Error(`Failed to fetch classes: ${error.message}`);
        }
        
        return data || [];
      } catch (error: any) {
        console.error('Class fetch error:', error);
        throw error;
      }
    },
    enabled: !!schoolId,
    retry: 2,
    staleTime: 60000,
  });

  const { data: teacherList = [], isLoading: teacherListLoading, error: teacherListError } = useQuery({
    queryKey: ['principal-teachers-optimized', schoolId, reloadKey],
    queryFn: async () => {
      if (!schoolId) return [];
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email')
          .eq('school_id', schoolId)
          .eq('role', 'teacher')
          .order('name')
          .limit(500);
        
        if (error) {
          console.error('Error fetching teachers:', error);
          throw new Error(`Failed to fetch teachers: ${error.message}`);
        }
        
        return data || [];
      } catch (error: any) {
        console.error('Teacher fetch error:', error);
        throw error;
      }
    },
    enabled: !!schoolId,
    retry: 2,
    staleTime: 60000,
  });

  const { data: parentList = [], isLoading: parentListLoading, error: parentListError } = useQuery({
    queryKey: ['principal-parents-optimized', schoolId, reloadKey],
    queryFn: async () => {
      if (!schoolId) return [];
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email')
          .eq('school_id', schoolId)
          .eq('role', 'parent')
          .order('name')
          .limit(1000);
        
        if (error) {
          console.error('Error fetching parents:', error);
          throw new Error(`Failed to fetch parents: ${error.message}`);
        }
        
        return data || [];
      } catch (error: any) {
        console.error('Parent fetch error:', error);
        throw error;
      }
    },
    enabled: !!schoolId,
    retry: 2,
    staleTime: 60000,
  });

  const isLoading = subjectListLoading || classListLoading || teacherListLoading || parentListLoading;
  
  // Better error handling - identify which specific query failed
  const getErrorMessage = () => {
    if (subjectListError) return `Subjects: ${subjectListError.message}`;
    if (classListError) return `Classes: ${classListError.message}`;
    if (teacherListError) return `Teachers: ${teacherListError.message}`;
    if (parentListError) return `Parents: ${parentListError.message}`;
    return null;
  };

  return {
    classList,
    subjectList,
    teacherList,
    parentList,
    isLoading,
    loadingEntities: isLoading,
    errorEntities: getErrorMessage(),
  };
};
