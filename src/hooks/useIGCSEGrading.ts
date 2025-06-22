
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface IGCSESubject {
  id: string;
  subject_name: string;
  subject_code: string;
  subject_type: 'core' | 'extended';
  components: string[];
  grade_boundaries: Record<string, number>;
}

export interface IGCSEGrade {
  id: string;
  student_id: string;
  subject_id: string;
  component: string;
  marks?: number;
  letter_grade: string;
  teacher_remarks?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
}

export const useIGCSEGrading = (classId?: string, term?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [subjects, setSubjects] = useState<IGCSESubject[]>([]);
  const [grades, setGrades] = useState<IGCSEGrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSubjects = async () => {
    if (!user?.school_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('igcse_subjects')
        .select('*')
        .eq('school_id', user.school_id)
        .order('subject_name');

      if (error) throw error;
      setSubjects(data || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load IGCSE subjects",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadGrades = async () => {
    if (!user?.school_id || !classId || !term) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('igcse_grades')
        .select('*')
        .eq('school_id', user.school_id)
        .eq('class_id', classId)
        .eq('term', term)
        .eq('teacher_id', user.id);

      if (error) throw error;
      setGrades(data || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load IGCSE grades",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveGrade = async (gradeData: Partial<IGCSEGrade>) => {
    if (!user?.school_id) return;

    try {
      const { data, error } = await supabase
        .from('igcse_grades')
        .upsert({
          ...gradeData,
          school_id: user.school_id,
          class_id: classId,
          term: term,
          teacher_id: user.id,
          academic_year: new Date().getFullYear().toString()
        }, {
          onConflict: 'school_id,student_id,subject_id,component,term,academic_year'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setGrades(prev => {
        const index = prev.findIndex(g => 
          g.student_id === data.student_id && 
          g.subject_id === data.subject_id && 
          g.component === data.component
        );
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = data;
          return updated;
        } else {
          return [...prev, data];
        }
      });

      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const submitGrades = async (gradeIds: string[]) => {
    try {
      const { error } = await supabase
        .from('igcse_grades')
        .update({ 
          status: 'submitted', 
          submitted_at: new Date().toISOString() 
        })
        .in('id', gradeIds);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Grades submitted for approval"
      });

      // Reload grades to get updated status
      await loadGrades();
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to submit grades",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadSubjects();
  }, [user?.school_id]);

  useEffect(() => {
    if (classId && term) {
      loadGrades();
    }
  }, [classId, term, user?.school_id]);

  return {
    subjects,
    grades,
    loading,
    error,
    saveGrade,
    submitGrades,
    refetch: () => {
      loadSubjects();
      loadGrades();
    }
  };
};
