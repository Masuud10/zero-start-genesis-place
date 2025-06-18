
import { useState, useEffect, useCallback } from 'react';
import { useSchoolScopedData } from './useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AcademicYear {
  id: string;
  school_id: string;
  year_name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  term_structure: string;
  status: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useAcademicYears = () => {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isSystemAdmin, schoolId } = useSchoolScopedData();
  const { toast } = useToast();

  const fetchAcademicYears = useCallback(async () => {
    if (!schoolId && !isSystemAdmin) {
      setAcademicYears([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('academic_years').select('*');

      if (!isSystemAdmin && schoolId) {
        query = query.eq('school_id', schoolId);
      }

      query = query.order('start_date', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setAcademicYears(data || []);
      setError(null);
    } catch (err: any) {
      const message = err?.message || 'Failed to fetch academic years';
      setError(message);
      setAcademicYears([]);
      toast({
        title: "Academic Years Fetch Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isSystemAdmin, schoolId, toast]);

  const createAcademicYear = async (yearData: {
    year_name: string;
    start_date: string;
    end_date: string;
    is_current?: boolean;
    term_structure?: string;
    status?: string;
    description?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('academic_years')
        .insert({
          ...yearData,
          school_id: schoolId,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Academic Year Created",
        description: `Academic year ${yearData.year_name} has been created successfully.`,
      });

      fetchAcademicYears();
      return { data, error: null };
    } catch (err: any) {
      const message = err?.message || 'Failed to create academic year';
      toast({
        title: "Create Error",
        description: message,
        variant: "destructive",
      });
      return { data: null, error: message };
    }
  };

  const updateAcademicYear = async (id: string, updates: Partial<AcademicYear>) => {
    try {
      const { data, error } = await supabase
        .from('academic_years')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Academic Year Updated",
        description: "Academic year has been updated successfully.",
      });

      fetchAcademicYears();
      return { data, error: null };
    } catch (err: any) {
      const message = err?.message || 'Failed to update academic year';
      toast({
        title: "Update Error",
        description: message,
        variant: "destructive",
      });
      return { data: null, error: message };
    }
  };

  const setCurrentAcademicYear = async (id: string) => {
    try {
      // First, unset all current academic years for this school
      await supabase
        .from('academic_years')
        .update({ is_current: false })
        .eq('school_id', schoolId);

      // Then set the selected one as current
      const { data, error } = await supabase
        .from('academic_years')
        .update({ is_current: true, status: 'active' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Current Academic Year Set",
        description: "Academic year has been set as current.",
      });

      fetchAcademicYears();
      return { data, error: null };
    } catch (err: any) {
      const message = err?.message || 'Failed to set current academic year';
      toast({
        title: "Update Error",
        description: message,
        variant: "destructive",
      });
      return { data: null, error: message };
    }
  };

  useEffect(() => {
    fetchAcademicYears();
  }, [fetchAcademicYears]);

  return {
    academicYears,
    loading,
    error,
    createAcademicYear,
    updateAcademicYear,
    setCurrentAcademicYear,
    refetch: fetchAcademicYears
  };
};
