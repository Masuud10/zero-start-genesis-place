
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from './useSchoolScopedData';
import { supabase } from '@/integrations/supabase/client';

export interface Subject {
  id: string;
  name: string;
  code: string;
  school_id: string;
  class_id?: string;
  teacher_id?: string;
  curriculum?: string;
  created_at: string;
}

export interface SubjectAssignment {
  id: string;
  school_id: string;
  subject_id: string;
  teacher_id: string;
  class_id: string;
  assigned_by?: string;
  assigned_at: string;
  is_active: boolean;
  subject: { name: string; code: string };
  teacher: { name: string; email: string };
  class: { name: string };
}

export const useSubjectManagement = () => {
  const { toast } = useToast();
  const { schoolId } = useSchoolScopedData();
  const [loading, setLoading] = useState(false);

  const assignTeacherToSubject = useCallback(async (assignmentData: {
    subject_id: string;
    teacher_id: string;
    class_id: string;
  }) => {
    if (!schoolId) {
      toast({
        title: "Error",
        description: "No school context found",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    try {
      // Check if assignment already exists
      const { data: existing } = await supabase
        .from('subject_teacher_assignments')
        .select('id')
        .eq('school_id', schoolId)
        .eq('subject_id', assignmentData.subject_id)
        .eq('teacher_id', assignmentData.teacher_id)
        .eq('class_id', assignmentData.class_id)
        .eq('is_active', true)
        .maybeSingle();

      if (existing) {
        toast({
          title: "Error",
          description: "This teacher is already assigned to this subject for this class",
          variant: "destructive"
        });
        return null;
      }

      const { data, error } = await supabase
        .from('subject_teacher_assignments')
        .insert({
          ...assignmentData,
          school_id: schoolId,
          is_active: true
        })
        .select(`
          *,
          subject:subjects(name, code),
          teacher:profiles!teacher_id(name, email),
          class:classes(name)
        `)
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Teacher assigned to subject successfully"
      });

      return data;
    } catch (error: any) {
      console.error('Error assigning teacher:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign teacher",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [schoolId, toast]);

  const getSubjectAssignments = useCallback(async (classId?: string) => {
    if (!schoolId) return [];

    try {
      let query = supabase
        .from('subject_teacher_assignments')
        .select(`
          *,
          subject:subjects(name, code),
          teacher:profiles!teacher_id(name, email),
          class:classes(name)
        `)
        .eq('school_id', schoolId)
        .eq('is_active', true);

      if (classId) {
        query = query.eq('class_id', classId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
      return [];
    }
  }, [schoolId]);

  const removeAssignment = useCallback(async (assignmentId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('subject_teacher_assignments')
        .update({ is_active: false })
        .eq('id', assignmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Assignment removed successfully"
      });

      return true;
    } catch (error: any) {
      console.error('Error removing assignment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove assignment",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    assignTeacherToSubject,
    getSubjectAssignments,
    removeAssignment,
    loading
  };
};
