import { useState, useEffect, useCallback } from 'react';
import { useSchoolScopedData } from './useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Examination, CreateExaminationData, UpdateExaminationData } from '@/types/academic';

export const useExaminations = () => {
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isSystemAdmin, schoolId, isReady } = useSchoolScopedData();
  const { toast } = useToast();

  const fetchExaminations = useCallback(async () => {
    if (!isReady) {
      console.log('📚 School context not ready yet');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('📚 Fetching examinations for school:', schoolId);

      let query = supabase.from('examinations').select(`
        id,
        name,
        type,
        term,
        academic_year,
        classes,
        start_date,
        end_date,
        coordinator_id,
        remarks,
        school_id,
        created_by,
        created_at,
        updated_at
      `);

      // Apply school filter for non-admin users
      if (!isSystemAdmin && schoolId) {
        query = query.eq('school_id', schoolId);
      }

      // Order by created_at for consistent results
      query = query.order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('📚 Examinations fetch error:', fetchError);
        throw fetchError;
      }

      console.log('📚 Examinations fetched successfully:', data?.length || 0);
      setExaminations(data || []);
      setError(null);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch examinations data';
      console.error('📚 Examinations fetch failed:', err);
      setError(message);
      setExaminations([]);
      
      toast({
        title: "Examinations Fetch Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isSystemAdmin, schoolId, toast, isReady]);

  const createExamination = useCallback(async (examinationData: CreateExaminationData) => {
    if (!schoolId) {
      throw new Error('School ID is required');
    }

    try {
      const { data, error } = await supabase
        .from('examinations')
        .insert({
          ...examinationData,
          school_id: schoolId,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      setExaminations(prev => [data, ...prev]);
      
      toast({
        title: "Examination Created",
        description: "The examination has been created successfully.",
      });

      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create examination';
      toast({
        title: "Create Error",
        description: message,
        variant: "destructive",
      });
      throw err;
    }
  }, [schoolId, toast]);

  const updateExamination = useCallback(async (examinationData: UpdateExaminationData) => {
    try {
      const { data, error } = await supabase
        .from('examinations')
        .update({
          name: examinationData.name,
          type: examinationData.type,
          term: examinationData.term,
          academic_year: examinationData.academic_year,
          classes: examinationData.classes,
          start_date: examinationData.start_date,
          end_date: examinationData.end_date,
          coordinator_id: examinationData.coordinator_id,
          remarks: examinationData.remarks,
        })
        .eq('id', examinationData.id)
        .select()
        .single();

      if (error) throw error;

      setExaminations(prev => 
        prev.map(exam => exam.id === examinationData.id ? data : exam)
      );
      
      toast({
        title: "Examination Updated",
        description: "The examination has been updated successfully.",
      });

      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update examination';
      toast({
        title: "Update Error",
        description: message,
        variant: "destructive",
      });
      throw err;
    }
  }, [toast]);

  const deleteExamination = useCallback(async (examinationId: string) => {
    try {
      const { error } = await supabase
        .from('examinations')
        .delete()
        .eq('id', examinationId);

      if (error) throw error;

      setExaminations(prev => prev.filter(exam => exam.id !== examinationId));
      
      toast({
        title: "Examination Deleted",
        description: "The examination has been deleted successfully.",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete examination';
      toast({
        title: "Delete Error",
        description: message,
        variant: "destructive",
      });
      throw err;
    }
  }, [toast]);

  useEffect(() => {
    fetchExaminations();
  }, [fetchExaminations]);

  return {
    examinations,
    loading,
    error,
    retry: fetchExaminations,
    createExamination,
    updateExamination,
    deleteExamination
  };
}; 