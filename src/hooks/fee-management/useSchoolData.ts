
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
    if (!user?.school_id) return;

    try {
      // Fetch classes
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .eq('school_id', user.school_id);

      if (classesError) throw classesError;

      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('school_id', user.school_id);

      if (studentsError) throw studentsError;

      // Fetch fee structures
      const { data: feeStructuresData, error: feeStructuresError } = await supabase
        .from('fee_structures')
        .select('*')
        .eq('school_id', user.school_id);

      if (feeStructuresError) throw feeStructuresError;

      setClasses(classesData || []);
      setStudents(studentsData || []);
      setFeeStructures(feeStructuresData || []);
      setError(null);
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
