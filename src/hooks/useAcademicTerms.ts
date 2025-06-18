
import { useState, useEffect, useCallback } from 'react';
import { useSchoolScopedData } from './useSchoolScopedData';
import { supabase } from '@/integrations/supabase/client';

interface AcademicTerm {
  id: string;
  school_id: string;
  term_name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
}

export const useAcademicTerms = () => {
  const [academicTerms, setAcademicTerms] = useState<AcademicTerm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isSystemAdmin, schoolId } = useSchoolScopedData();

  const fetchAcademicTerms = useCallback(async () => {
    if (!schoolId && !isSystemAdmin) {
      setAcademicTerms([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('academic_terms').select('*');

      if (!isSystemAdmin && schoolId) {
        query = query.eq('school_id', schoolId);
      }

      query = query.order('start_date', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setAcademicTerms(data || []);
      setError(null);
    } catch (err: any) {
      const message = err?.message || 'Failed to fetch academic terms';
      setError(message);
      setAcademicTerms([]);
    } finally {
      setLoading(false);
    }
  }, [isSystemAdmin, schoolId]);

  useEffect(() => {
    fetchAcademicTerms();
  }, [fetchAcademicTerms]);

  return {
    academicTerms,
    loading,
    error,
    refetch: fetchAcademicTerms
  };
};
