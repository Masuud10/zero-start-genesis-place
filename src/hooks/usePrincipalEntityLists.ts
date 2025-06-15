
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';

export const usePrincipalEntityLists = (reloadKey: number) => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  
  const [classList, setClassList] = useState<any[]>([]);
  const [subjectList, setSubjectList] = useState<any[]>([]);
  const [teacherList, setTeacherList] = useState<any[]>([]);
  const [parentList, setParentList] = useState<any[]>([]);
  const [loadingEntities, setLoadingEntities] = useState(true);
  const [errorEntities, setErrorEntities] = useState<string | null>(null);
  
  const effectiveSchoolId = schoolId || user?.school_id;

  useEffect(() => {
    if (!effectiveSchoolId) return;

    const fetchEntities = async () => {
        setLoadingEntities(true);
        setErrorEntities(null);

        try {
            const classesQuery = supabase.from('classes').select('id, name, created_at').eq('school_id', effectiveSchoolId).order('name');
            const subjectsQuery = supabase.from('subjects').select('id, name, code, created_at').eq('school_id', effectiveSchoolId).order('name');
            const teachersQuery = supabase.from('profiles').select('id, name, email').eq('school_id', effectiveSchoolId).eq('role', 'teacher').order('name');
            const parentsQuery = supabase.from('profiles').select('id, name, email').eq('school_id', effectiveSchoolId).eq('role', 'parent').order('name');

            const [
              classesRes,
              subjectsRes,
              teachersRes,
              parentsRes,
            ] = await Promise.all([classesQuery, subjectsQuery, teachersQuery, parentsQuery]);
            
            if (classesRes.error || subjectsRes.error || teachersRes.error || parentsRes.error) {
              console.error("Error fetching entities", {
                classes: classesRes.error,
                subjects: subjectsRes.error,
                teachers: teachersRes.error,
                parents: parentsRes.error,
              });
              setErrorEntities("Failed to load some entities.");
            }

            setClassList(classesRes.data || []);
            setSubjectList(subjectsRes.data || []);
            setTeacherList(teachersRes.data || []);
            setParentList(parentsRes.data || []);

        } catch (err: any) {
            console.error("Exception when fetching entities", err);
            setErrorEntities("Failed to load entities.");
        } finally {
            setLoadingEntities(false);
        }
    };
    
    fetchEntities();
  }, [effectiveSchoolId, reloadKey]);

  return { classList, subjectList, teacherList, parentList, loadingEntities, errorEntities };
};
