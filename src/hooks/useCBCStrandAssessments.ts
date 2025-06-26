
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useAuth } from '@/contexts/AuthContext';
import { CBCStrandAssessment } from '@/types/grading';

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

      // Type assertion to ensure proper typing
      const typedData = (data || []).map(item => ({
        ...item,
        performance_level: item.performance_level as 'EM' | 'AP' | 'PR' | 'EX'
      })) as CBCStrandAssessment[];

      setAssessments(typedData);
    } catch (error) {
      console.error('Error loading CBC strand assessments:', error);
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const saveAssessment = async (assessment: Partial<CBCStrandAssessment>) => {
    if (!user?.id || !schoolId || !classId) return;

    try {
      const assessmentData = {
        ...assessment,
        school_id: schoolId,
        class_id: classId,
        teacher_id: user.id,
        academic_year: new Date().getFullYear().toString(),
        performance_level: assessment.performance_level as 'EM' | 'AP' | 'PR' | 'EX',
        assessment_type: assessment.assessment_type || 'observation'
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
