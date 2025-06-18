
import { useState, useEffect, useCallback } from 'react';
import { useSchoolScopedData } from './useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SubjectTeacherAssignment {
  id: string;
  school_id: string;
  teacher_id: string;
  subject_id: string;
  class_id: string;
  assigned_by?: string;
  assigned_at: string;
  is_active: boolean;
  workload_percentage?: number;
  created_at: string;
  updated_at: string;
  teacher?: {
    id: string;
    name: string;
    email: string;
  };
  subject?: {
    id: string;
    name: string;
    code: string;
  };
  class?: {
    id: string;
    name: string;
  };
}

export const useSubjectTeacherAssignments = () => {
  const [assignments, setAssignments] = useState<SubjectTeacherAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isSystemAdmin, schoolId } = useSchoolScopedData();
  const { toast } = useToast();

  const fetchAssignments = useCallback(async () => {
    if (!schoolId && !isSystemAdmin) {
      setAssignments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('subject_teacher_assignments')
        .select(`
          *,
          teacher:profiles!teacher_id(id, name, email),
          subject:subjects(id, name, code),
          class:classes(id, name)
        `);

      if (!isSystemAdmin && schoolId) {
        query = query.eq('school_id', schoolId);
      }

      query = query.eq('is_active', true).order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setAssignments(data || []);
      setError(null);
    } catch (err: any) {
      const message = err?.message || 'Failed to fetch subject assignments';
      setError(message);
      setAssignments([]);
      toast({
        title: "Assignments Fetch Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isSystemAdmin, schoolId, toast]);

  const createAssignment = async (assignmentData: {
    teacher_id: string;
    subject_id: string;
    class_id: string;
    workload_percentage?: number;
  }) => {
    try {
      const { data, error } = await supabase
        .from('subject_teacher_assignments')
        .insert({
          ...assignmentData,
          school_id: schoolId,
          is_active: true,
          workload_percentage: assignmentData.workload_percentage || 100,
        })
        .select(`
          *,
          teacher:profiles!teacher_id(id, name, email),
          subject:subjects(id, name, code),
          class:classes(id, name)
        `)
        .single();

      if (error) throw error;

      toast({
        title: "Assignment Created",
        description: "Teacher assignment has been created successfully.",
      });

      fetchAssignments();
      return { data, error: null };
    } catch (err: any) {
      const message = err?.message || 'Failed to create assignment';
      toast({
        title: "Create Error",
        description: message,
        variant: "destructive",
      });
      return { data: null, error: message };
    }
  };

  const updateAssignment = async (id: string, updates: Partial<SubjectTeacherAssignment>) => {
    try {
      const { data, error } = await supabase
        .from('subject_teacher_assignments')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`
          *,
          teacher:profiles!teacher_id(id, name, email),
          subject:subjects(id, name, code),
          class:classes(id, name)
        `)
        .single();

      if (error) throw error;

      toast({
        title: "Assignment Updated",
        description: "Teacher assignment has been updated successfully.",
      });

      fetchAssignments();
      return { data, error: null };
    } catch (err: any) {
      const message = err?.message || 'Failed to update assignment';
      toast({
        title: "Update Error",
        description: message,
        variant: "destructive",
      });
      return { data: null, error: message };
    }
  };

  const deactivateAssignment = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('subject_teacher_assignments')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Assignment Deactivated",
        description: "Teacher assignment has been deactivated successfully.",
      });

      fetchAssignments();
      return { data, error: null };
    } catch (err: any) {
      const message = err?.message || 'Failed to deactivate assignment';
      toast({
        title: "Deactivate Error",
        description: message,
        variant: "destructive",
      });
      return { data: null, error: message };
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return {
    assignments,
    loading,
    error,
    createAssignment,
    updateAssignment,
    deactivateAssignment,
    refetch: fetchAssignments
  };
};
