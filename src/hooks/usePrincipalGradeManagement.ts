
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PrincipalGrade {
  id: string;
  student_id: string;
  subject_id: string;
  class_id: string;
  score: number;
  max_score: number;
  percentage: number;
  letter_grade: string;
  status: string;
  submitted_at: string;
  submitted_by: string;
  term: string;
  exam_type: string;
  students?: { id: string; name: string; admission_number: string };
  subjects?: { id: string; name: string; code: string };
  classes?: { id: string; name: string };
  profiles?: { id: string; name: string };
}

export const usePrincipalGradeManagement = () => {
  const [grades, setGrades] = useState<PrincipalGrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchGrades = useCallback(async () => {
    if (!user?.school_id || user.role !== 'principal') {
      console.log('🎓 usePrincipalGradeManagement: Invalid user or role');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('🎓 usePrincipalGradeManagement: Fetching grades for school:', user.school_id);

      const { data, error } = await supabase
        .from('grades')
        .select(`
          id,
          student_id,
          subject_id,
          class_id,
          score,
          max_score,
          percentage,
          letter_grade,
          status,
          submitted_at,
          submitted_by,
          term,
          exam_type,
          students!inner(id, name, admission_number),
          subjects!inner(id, name, code),
          classes!inner(id, name),
          profiles!grades_submitted_by_fkey(id, name)
        `)
        .eq('school_id', user.school_id)
        .in('status', ['submitted', 'approved', 'rejected'])
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('❌ usePrincipalGradeManagement: Error fetching grades:', error);
        throw error;
      }

      console.log('✅ usePrincipalGradeManagement: Fetched grades:', data?.length || 0);
      setGrades(data || []);
    } catch (error: any) {
      console.error('❌ usePrincipalGradeManagement: Fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to load grades for approval.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.school_id, user?.role, toast]);

  const handleApproveGrades = async (gradeIds: string[]) => {
    if (!user?.id || user.role !== 'principal') {
      throw new Error('Only principals can approve grades');
    }

    setProcessing('approve');
    try {
      console.log('🎓 usePrincipalGradeManagement: Approving grades:', gradeIds);

      const { data, error } = await supabase.rpc('update_grade_status', {
        grade_ids: gradeIds,
        new_status: 'approved',
        user_id: user.id
      });

      if (error) throw error;

      console.log('✅ usePrincipalGradeManagement: Grades approved successfully');
      toast({
        title: "Success",
        description: `${gradeIds.length} grade(s) approved successfully.`,
      });

      // Refresh grades
      await fetchGrades();
    } catch (error: any) {
      console.error('❌ usePrincipalGradeManagement: Approve error:', error);
      throw error;
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectGrades = async (gradeIds: string[]) => {
    if (!user?.id || user.role !== 'principal') {
      throw new Error('Only principals can reject grades');
    }

    setProcessing('reject');
    try {
      console.log('🎓 usePrincipalGradeManagement: Rejecting grades:', gradeIds);

      const { error } = await supabase
        .from('grades')
        .update({
          status: 'rejected',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .in('id', gradeIds);

      if (error) throw error;

      console.log('✅ usePrincipalGradeManagement: Grades rejected successfully');
      toast({
        title: "Success",
        description: `${gradeIds.length} grade(s) rejected successfully.`,
      });

      // Refresh grades
      await fetchGrades();
    } catch (error: any) {
      console.error('❌ usePrincipalGradeManagement: Reject error:', error);
      throw error;
    } finally {
      setProcessing(null);
    }
  };

  const handleReleaseGrades = async (gradeIds: string[]) => {
    if (!user?.id || user.role !== 'principal') {
      throw new Error('Only principals can release grades');
    }

    setProcessing('release');
    try {
      console.log('🎓 usePrincipalGradeManagement: Releasing grades:', gradeIds);

      const { data, error } = await supabase.rpc('update_grade_status', {
        grade_ids: gradeIds,
        new_status: 'released',
        user_id: user.id
      });

      if (error) throw error;

      console.log('✅ usePrincipalGradeManagement: Grades released successfully');
      toast({
        title: "Success",
        description: `${gradeIds.length} grade(s) released to students and parents.`,
      });

      // Refresh grades
      await fetchGrades();
    } catch (error: any) {
      console.error('❌ usePrincipalGradeManagement: Release error:', error);
      throw error;
    } finally {
      setProcessing(null);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  return {
    grades,
    isLoading,
    processing,
    handleApproveGrades,
    handleRejectGrades,
    handleReleaseGrades,
    refetch: fetchGrades
  };
};
