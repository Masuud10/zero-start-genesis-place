
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
      
      // Transform database data to match our interface
      const transformedSubjects: IGCSESubject[] = (data || []).map(subject => ({
        id: subject.id,
        subject_name: subject.subject_name,
        subject_code: subject.subject_code,
        subject_type: subject.subject_type as 'core' | 'extended',
        components: Array.isArray(subject.components) ? subject.components as string[] : [],
        grade_boundaries: typeof subject.grade_boundaries === 'object' ? subject.grade_boundaries as Record<string, number> : {}
      }));
      
      setSubjects(transformedSubjects);
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
      
      // Transform database data to match our interface
      const transformedGrades: IGCSEGrade[] = (data || []).map(grade => ({
        id: grade.id,
        student_id: grade.student_id,
        subject_id: grade.subject_id || '',
        component: grade.component || 'overall',
        marks: grade.marks || undefined,
        letter_grade: grade.letter_grade,
        teacher_remarks: grade.teacher_remarks || undefined,
        status: grade.status as 'draft' | 'submitted' | 'approved' | 'rejected'
      }));
      
      setGrades(transformedGrades);
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
    if (!user?.school_id || !gradeData.letter_grade) return;

    try {
      const { data, error } = await supabase
        .from('igcse_grades')
        .upsert({
          student_id: gradeData.student_id,
          subject_id: gradeData.subject_id,
          component: gradeData.component || 'overall',
          marks: gradeData.marks || null,
          letter_grade: gradeData.letter_grade,
          teacher_remarks: gradeData.teacher_remarks || null,
          school_id: user.school_id,
          class_id: classId,
          term: term,
          teacher_id: user.id,
          academic_year: new Date().getFullYear().toString(),
          status: gradeData.status || 'draft'
        }, {
          onConflict: 'school_id,student_id,subject_id,component,term,academic_year'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Transform and update local state
      const transformedGrade: IGCSEGrade = {
        id: data.id,
        student_id: data.student_id,
        subject_id: data.subject_id || '',
        component: data.component || 'overall',
        marks: data.marks || undefined,
        letter_grade: data.letter_grade,
        teacher_remarks: data.teacher_remarks || undefined,
        status: data.status as 'draft' | 'submitted' | 'approved' | 'rejected'
      };
      
      setGrades(prev => {
        const index = prev.findIndex(g => 
          g.student_id === transformedGrade.student_id && 
          g.subject_id === transformedGrade.subject_id && 
          g.component === transformedGrade.component
        );
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = transformedGrade;
          return updated;
        } else {
          return [...prev, transformedGrade];
        }
      });

      return transformedGrade;
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
