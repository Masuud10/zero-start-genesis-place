
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useAuth } from '@/contexts/AuthContext';

interface CBCStrandAssessment {
  id: string;
  student_id: string;
  subject_id: string;
  competency_id: string;
  strand_name: string;
  sub_strand_name?: string;
  assessment_type: string;
  performance_level: 'EM' | 'AP' | 'PR' | 'EX';
  teacher_remarks?: string;
  term: string;
  academic_year: string;
}

export const useCBCStrandAssessments = (
  classId: string,
  term: string,
  examType: string
) => {
  const [assessments, setAssessments] = useState<CBCStrandAssessment[]>([]);
  const [loading, setLoading] = useState(false);
  const { schoolId } = useSchoolScopedData();
  const { user } = useAuth();

  const loadAssessments = async () => {
    if (!schoolId || !classId || !term || !examType) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cbc_strand_assessments')
        .select('*')
        .eq('school_id', schoolId)
        .eq('class_id', classId)
        .eq('term', term)
        .eq('assessment_type', examType.toLowerCase());

      if (error) throw error;

      setAssessments(data || []);
    } catch (error) {
      console.error('Error loading CBC strand assessments:', error);
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const saveAssessment = async (assessment: Partial<CBCStrandAssessment>) => {
    if (!user?.id || !schoolId) return;

    try {
      const assessmentData = {
        ...assessment,
        school_id: schoolId,
        teacher_id: user.id,
        academic_year: new Date().getFullYear().toString(),
      };

      const { error } = await supabase
        .from('cbc_strand_assessments')
        .upsert(assessmentData, {
          onConflict: 'school_id,student_id,subject_id,competency_id,strand_name,sub_strand_name,assessment_type,term,academic_year'
        });

      if (error) throw error;

      // Reload assessments
      await loadAssessments();
    } catch (error) {
      console.error('Error saving CBC strand assessment:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadAssessments();
  }, [schoolId, classId, term, examType]);

  return {
    assessments,
    loading,
    saveAssessment,
    refetch: loadAssessments
  };
};
