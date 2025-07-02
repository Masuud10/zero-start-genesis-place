
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useSchoolData = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSchoolData = async () => {
    if (!user?.school_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🏫 Fetching school data for:', user.school_id);

      // Add timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.error('🏫 School data query timed out');
      }, 4000);

      // Use Promise.all for parallel queries with limits
      const [classesResult, studentsResult, feeStructuresResult] = await Promise.all([
        // Fetch classes with limit
        supabase
          .from('classes')
          .select('id, name, level, stream, teacher_id')
          .eq('school_id', user.school_id)
          .limit(100),

        // Fetch students with limit  
        supabase
          .from('students')
          .select('id, name, admission_number, class_id, is_active')
          .eq('school_id', user.school_id)
          .eq('is_active', true)
          .limit(500),

        // Fetch fee structures with limit
        supabase
          .from('fee_structures')
          .select('id, name, academic_year, term, is_active')
          .eq('school_id', user.school_id)
          .limit(50)
      ]);

      clearTimeout(timeoutId);

      // Check for errors
      if (classesResult.error) throw classesResult.error;
      if (studentsResult.error) throw studentsResult.error;
      if (feeStructuresResult.error) throw feeStructuresResult.error;

      setClasses(classesResult.data || []);
      setStudents(studentsResult.data || []);
      setFeeStructures(feeStructuresResult.data || []);
      setError(null);
      
      console.log('🏫 School data loaded:', {
        classes: classesResult.data?.length || 0,
        students: studentsResult.data?.length || 0,
        feeStructures: feeStructuresResult.data?.length || 0
      });
    } catch (err: any) {
      console.error('Error fetching school data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchoolData();
  }, [user?.school_id]);

  return {
    classes,
    students,
    feeStructures,
    loading,
    error,
    refetch: fetchSchoolData
  };
};
