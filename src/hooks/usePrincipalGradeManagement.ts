
import { useState, useEffect, useCallback, useRef } from 'react';
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
  students?: { id: string; name: string; admission_number: string } | null;
  subjects?: { id: string; name: string; code: string } | null;
  classes?: { id: string; name: string } | null;
  profiles?: { id: string; name: string } | null;
}

export const usePrincipalGradeManagement = () => {
  const [grades, setGrades] = useState<PrincipalGrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Refs for cleanup and mounted state
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchGrades = useCallback(async () => {
    if (!user?.school_id || user.role !== 'principal') {
      console.log('🎓 usePrincipalGradeManagement: Invalid user or role');
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      return;
    }

    // Clean up previous requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    try {
      if (isMountedRef.current) {
        setIsLoading(true);
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
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
        .order('submitted_at', { ascending: false })
        .abortSignal(abortControllerRef.current.signal);

      if (error) {
        console.error('❌ usePrincipalGradeManagement: Error fetching grades:', error);
        throw error;
      }

      console.log('✅ usePrincipalGradeManagement: Fetched grades:', data?.length || 0);
      
      if (!isMountedRef.current) return;
      
      // Transform the data to match our interface with better type safety
      const transformedGrades: PrincipalGrade[] = (data || []).map(grade => ({
        id: grade.id,
        student_id: grade.student_id,
        subject_id: grade.subject_id,
        class_id: grade.class_id,
        score: grade.score,
        max_score: grade.max_score,
        percentage: grade.percentage,
        letter_grade: grade.letter_grade,
        status: grade.status,
        submitted_at: grade.submitted_at,
        submitted_by: grade.submitted_by,
        term: grade.term,
        exam_type: grade.exam_type,
        students: Array.isArray(grade.students) ? grade.students[0] || null : grade.students,
        subjects: Array.isArray(grade.subjects) ? grade.subjects[0] || null : grade.subjects,
        classes: Array.isArray(grade.classes) ? grade.classes[0] || null : grade.classes,
        profiles: Array.isArray(grade.profiles) ? grade.profiles[0] || null : grade.profiles,
      }));

      if (isMountedRef.current) {
        setGrades(transformedGrades);
        if (transformedGrades.length === 0) {
          console.warn('⚠️ No grades found for approval.');
          toast({
            title: 'No Grades',
            description: 'No grades found for approval, review, or release.',
            variant: 'default',
          });
        }
      }
    } catch (error: unknown) {
      console.error('❌ usePrincipalGradeManagement: Fetch error:', error);
      
      if (isMountedRef.current) {
        toast({
          title: "Error",
          description: "Failed to load grades for approval.",
          variant: "destructive"
        });
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [user?.school_id, user?.role, toast]);

  const handleApproveGrades = async (gradeIds: string[]) => {
    if (!user?.id || user.role !== 'principal') {
      throw new Error('Only principals can approve grades');
    }

    if (!isMountedRef.current) return;

    // Filter out grades that are already approved
    const toApprove = grades.filter(g => gradeIds.includes(g.id) && g.status !== 'approved').map(g => g.id);
    if (toApprove.length === 0) {
      toast({ title: 'No Action', description: 'All selected grades are already approved.', variant: 'default' });
      return;
    }
    setProcessing('approve');
    try {
      console.log('🎓 usePrincipalGradeManagement: Approving grades:', toApprove);

      const { data, error } = await supabase.rpc('update_grade_status', {
        grade_ids: toApprove,
        new_status: 'approved',
        user_id: user.id
      });

      if (error) throw error;

      console.log('✅ usePrincipalGradeManagement: Grades approved successfully');
      
      if (isMountedRef.current) {
        toast({
          title: "Success",
          description: `${toApprove.length} grade(s) approved successfully.`,
        });

        // Refresh grades
        await fetchGrades();
      }
    } catch (error: unknown) {
      console.error('❌ usePrincipalGradeManagement: Approve error:', error);
      throw error;
    } finally {
      if (isMountedRef.current) {
        setProcessing(null);
      }
    }
  };

  const handleRejectGrades = async (gradeIds: string[]) => {
    if (!user?.id || user.role !== 'principal') {
      throw new Error('Only principals can reject grades');
    }

    if (!isMountedRef.current) return;

    // Filter out grades that are already rejected
    const toReject = grades.filter(g => gradeIds.includes(g.id) && g.status !== 'rejected').map(g => g.id);
    if (toReject.length === 0) {
      toast({ title: 'No Action', description: 'All selected grades are already rejected.', variant: 'default' });
      return;
    }
    setProcessing('reject');
    try {
      console.log('🎓 usePrincipalGradeManagement: Rejecting grades:', toReject);

      const { error } = await supabase
        .from('grades')
        .update({
          status: 'rejected',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .in('id', toReject);

      if (error) throw error;

      console.log('✅ usePrincipalGradeManagement: Grades rejected successfully');
      
      if (isMountedRef.current) {
        toast({
          title: "Success",
          description: `${toReject.length} grade(s) rejected successfully.`,
        });

        // Refresh grades
        await fetchGrades();
      }
    } catch (error: unknown) {
      console.error('❌ usePrincipalGradeManagement: Reject error:', error);
      throw error;
    } finally {
      if (isMountedRef.current) {
        setProcessing(null);
      }
    }
  };

  const handleReleaseGrades = async (gradeIds: string[]) => {
    if (!user?.id || user.role !== 'principal') {
      throw new Error('Only principals can release grades');
    }

    if (!isMountedRef.current) return;

    // Filter out grades that are already released
    const toRelease = grades.filter(g => gradeIds.includes(g.id) && g.status !== 'released').map(g => g.id);
    if (toRelease.length === 0) {
      toast({ title: 'No Action', description: 'All selected grades are already released.', variant: 'default' });
      return;
    }
    setProcessing('release');
    try {
      console.log('🎓 usePrincipalGradeManagement: Releasing grades:', toRelease);

      const { data, error } = await supabase.rpc('update_grade_status', {
        grade_ids: toRelease,
        new_status: 'released',
        user_id: user.id
      });

      if (error) throw error;

      console.log('✅ usePrincipalGradeManagement: Grades released successfully');
      
      if (isMountedRef.current) {
        toast({
          title: "Success",
          description: `${toRelease.length} grade(s) released to students and parents.`,
        });

        // Refresh grades
        await fetchGrades();
      }
    } catch (error: unknown) {
      console.error('❌ usePrincipalGradeManagement: Release error:', error);
      throw error;
    } finally {
      if (isMountedRef.current) {
        setProcessing(null);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchGrades();

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
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
