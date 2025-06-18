
import { useState, useEffect, useCallback } from 'react';
import { useSchoolScopedData } from './useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AcademicTerm {
  id: string;
  school_id: string;
  academic_year_id: string;
  term_name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  status: string;
  description?: string;
  assessment_period_start?: string;
  assessment_period_end?: string;
  holiday_start?: string;
  holiday_end?: string;
  created_at: string;
  updated_at: string;
}

export const useAcademicTerms = (academicYearId?: string) => {
  const [academicTerms, setAcademicTerms] = useState<AcademicTerm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isSystemAdmin, schoolId } = useSchoolScopedData();
  const { toast } = useToast();

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

      if (academicYearId) {
        query = query.eq('academic_year_id', academicYearId);
      }

      query = query.order('start_date', { ascending: true });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setAcademicTerms(data || []);
      setError(null);
    } catch (err: any) {
      const message = err?.message || 'Failed to fetch academic terms';
      setError(message);
      setAcademicTerms([]);
      toast({
        title: "Academic Terms Fetch Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isSystemAdmin, schoolId, academicYearId, toast]);

  const createAcademicTerm = async (termData: Partial<AcademicTerm>) => {
    try {
      const { data, error } = await supabase
        .from('academic_terms')
        .insert([{
          ...termData,
          school_id: schoolId,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Academic Term Created",
        description: `Term ${termData.term_name} has been created successfully.`,
      });

      fetchAcademicTerms();
      return { data, error: null };
    } catch (err: any) {
      const message = err?.message || 'Failed to create academic term';
      toast({
        title: "Create Error",
        description: message,
        variant: "destructive",
      });
      return { data: null, error: message };
    }
  };

  const updateAcademicTerm = async (id: string, updates: Partial<AcademicTerm>) => {
    try {
      const { data, error } = await supabase
        .from('academic_terms')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Academic Term Updated",
        description: "Academic term has been updated successfully.",
      });

      fetchAcademicTerms();
      return { data, error: null };
    } catch (err: any) {
      const message = err?.message || 'Failed to update academic term';
      toast({
        title: "Update Error",
        description: message,
        variant: "destructive",
      });
      return { data: null, error: message };
    }
  };

  const setCurrentAcademicTerm = async (id: string) => {
    try {
      // First, unset all current academic terms for this school
      await supabase
        .from('academic_terms')
        .update({ is_current: false })
        .eq('school_id', schoolId);

      // Then set the selected one as current
      const { data, error } = await supabase
        .from('academic_terms')
        .update({ is_current: true, status: 'active' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Current Academic Term Set",
        description: "Academic term has been set as current.",
      });

      fetchAcademicTerms();
      return { data, error: null };
    } catch (err: any) {
      const message = err?.message || 'Failed to set current academic term';
      toast({
        title: "Update Error",
        description: message,
        variant: "destructive",
      });
      return { data: null, error: message };
    }
  };

  useEffect(() => {
    fetchAcademicTerms();
  }, [fetchAcademicTerms]);

  return {
    academicTerms,
    loading,
    error,
    createAcademicTerm,
    updateAcademicTerm,
    setCurrentAcademicTerm,
    refetch: fetchAcademicTerms
  };
};
