
import { useState, useEffect, useCallback } from 'react';
import { useSchoolScopedData } from './useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedSubject {
  id: string;
  name: string;
  code: string;
  school_id: string;
  class_id?: string;
  teacher_id?: string;
  curriculum?: string;
  category?: string;
  credit_hours?: number;
  assessment_weight?: number;
  prerequisites?: string[];
  description?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export const useEnhancedSubjects = (classId?: string) => {
  const [subjects, setSubjects] = useState<EnhancedSubject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isSystemAdmin, schoolId } = useSchoolScopedData();
  const { toast } = useToast();

  const fetchSubjects = useCallback(async () => {
    if (!schoolId && !isSystemAdmin) {
      setSubjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('subjects').select('*');

      if (!isSystemAdmin && schoolId) {
        query = query.eq('school_id', schoolId);
      }

      if (classId && classId !== 'all') {
        query = query.eq('class_id', classId);
      }

      query = query.eq('is_active', true).order('name');

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setSubjects(data || []);
      setError(null);
    } catch (err: any) {
      const message = err?.message || 'Failed to fetch subjects';
      setError(message);
      setSubjects([]);
      toast({
        title: "Subjects Fetch Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isSystemAdmin, schoolId, classId, toast]);

  const createSubject = async (subjectData: Partial<EnhancedSubject>) => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert([{
          ...subjectData,
          school_id: schoolId,
          is_active: true,
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Subject Created",
        description: `Subject ${subjectData.name} has been created successfully.`,
      });

      fetchSubjects();
      return { data, error: null };
    } catch (err: any) {
      const message = err?.message || 'Failed to create subject';
      toast({
        title: "Create Error",
        description: message,
        variant: "destructive",
      });
      return { data: null, error: message };
    }
  };

  const updateSubject = async (id: string, updates: Partial<EnhancedSubject>) => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Subject Updated",
        description: "Subject has been updated successfully.",
      });

      fetchSubjects();
      return { data, error: null };
    } catch (err: any) {
      const message = err?.message || 'Failed to update subject';
      toast({
        title: "Update Error",
        description: message,
        variant: "destructive",
      });
      return { data: null, error: message };
    }
  };

  const deactivateSubject = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Subject Deactivated",
        description: "Subject has been deactivated successfully.",
      });

      fetchSubjects();
      return { data, error: null };
    } catch (err: any) {
      const message = err?.message || 'Failed to deactivate subject';
      toast({
        title: "Deactivate Error",
        description: message,
        variant: "destructive",
      });
      return { data: null, error: message };
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  return {
    subjects,
    loading,
    error,
    createSubject,
    updateSubject,
    deactivateSubject,
    refetch: fetchSubjects
  };
};
