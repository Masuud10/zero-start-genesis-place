
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SchoolData } from './types';

export const useSchoolData = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchClasses = async () => {
    if (!user?.school_id) return;

    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('school_id', user.school_id);

      if (error) throw error;
      setClasses(data || []);
    } catch (err: any) {
      console.error('Error fetching classes:', err);
      setError(err.message);
    }
  };

  const fetchStudents = async () => {
    if (!user?.school_id) return;

    try {
      const { data, error } = await supabase
        .from('students')
        .select('*, class:classes(name)')
        .eq('school_id', user.school_id)
        .eq('is_active', true);

      if (error) throw error;
      setStudents(data || []);
    } catch (err: any) {
      console.error('Error fetching students:', err);
      setError(err.message);
    }
  };

  const fetchFeeStructures = async () => {
    if (!user?.school_id) return;

    try {
      const { data, error } = await supabase
        .from('fee_structures')
        .select(`
          *,
          items:fee_structure_items(*)
        `)
        .eq('school_id', user.school_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeeStructures(data || []);
    } catch (err: any) {
      console.error('Error fetching fee structures:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      if (user?.school_id) {
        setLoading(true);
        await Promise.all([
          fetchClasses(),
          fetchStudents(),
          fetchFeeStructures()
        ]);
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user?.school_id]);

  return {
    classes,
    students,
    feeStructures,
    loading,
    error,
    refetch: () => {
      fetchClasses();
      fetchStudents();
      fetchFeeStructures();
    }
  };
};
