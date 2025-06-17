
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';

export const usePrincipalEntityLists = (reloadKey: number) => {
  const { schoolId, isReady } = useSchoolScopedData();
  
  const [classList, setClassList] = useState<any[]>([]);
  const [subjectList, setSubjectList] = useState<any[]>([]);
  const [teacherList, setTeacherList] = useState<any[]>([]);
  const [parentList, setParentList] = useState<any[]>([]);
  const [loadingEntities, setLoadingEntities] = useState(true);
  const [errorEntities, setErrorEntities] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady || !schoolId) {
      setLoadingEntities(false);
      return;
    }

    fetchEntityLists();
  }, [schoolId, reloadKey, isReady]);

  const fetchEntityLists = async () => {
    if (!schoolId) return;

    try {
      setLoadingEntities(true);
      setErrorEntities(null);

      const [classesRes, subjectsRes, teachersRes, parentsRes] = await Promise.all([
        supabase
          .from('classes')
          .select('*')
          .eq('school_id', schoolId)
          .order('name'),
        supabase
          .from('subjects')
          .select('*')
          .eq('school_id', schoolId)
          .order('name'),
        supabase
          .from('profiles')
          .select('*')
          .eq('school_id', schoolId)
          .eq('role', 'teacher')
          .order('name'),
        supabase
          .from('profiles')
          .select('*')
          .eq('school_id', schoolId)
          .eq('role', 'parent')
          .order('name')
      ]);

      if (classesRes.error) throw classesRes.error;
      if (subjectsRes.error) throw subjectsRes.error;
      if (teachersRes.error) throw teachersRes.error;
      if (parentsRes.error) throw parentsRes.error;

      setClassList(classesRes.data || []);
      setSubjectList(subjectsRes.data || []);
      setTeacherList(teachersRes.data || []);
      setParentList(parentsRes.data || []);

    } catch (error: any) {
      console.error('Error fetching entity lists:', error);
      setErrorEntities(error.message || 'Failed to load entity lists');
    } finally {
      setLoadingEntities(false);
    }
  };

  return {
    classList,
    subjectList,
    teacherList,
    parentList,
    loadingEntities,
    errorEntities,
    refetchEntities: fetchEntityLists
  };
};
