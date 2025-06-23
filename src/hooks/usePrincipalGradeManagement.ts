
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePrincipalGradeManagement = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const [processing, setProcessing] = useState<string | null>(null);

  // Simplified grade fetching with better error handling
  const { data: grades = [], isLoading, refetch, error } = useQuery({
    queryKey: ['principal-grades-approval', user?.id, schoolId],
    queryFn: async () => {
      if (!user?.id || !schoolId) {
        console.log('❌ Missing user ID or school ID for grade fetching');
        return [];
      }

      console.log('🔍 Fetching grades for principal approval:', { schoolId, userId: user.id });

      try {
        const { data: gradeData, error: gradeError } = await supabase
          .from('grades')
          .select(`
            id,
            student_id,
            subject_id,
            class_id,
            term,
            exam_type,
            score,
            max_score,
            percentage,
            letter_grade,
            status,
            submitted_by,
            submitted_at,
            approved_by,
            approved_at,
            created_at,
            approved_by_principal,
            released_to_parents,
            students!inner(id, name, admission_number),
            subjects!inner(id, name, code),
            classes!inner(id, name),
            profiles!grades_submitted_by_fkey(id, name)
          `)
          .eq('school_id', schoolId)
          .in('status', ['submitted', 'approved', 'rejected', 'released'])
          .order('submitted_at', { ascending: false })
          .limit(100);

        if (gradeError) {
          console.error('❌ Error fetching grade data:', gradeError);
          throw gradeError;
        }

        console.log('✅ Fetched grades for principal:', gradeData?.length || 0);
        return gradeData || [];
      } catch (err) {
        console.error('❌ Failed to fetch grades:', err);
        throw err;
      }
    },
    enabled: !!user?.id && !!schoolId && user.role === 'principal',
    staleTime: 30000,
    refetchInterval: 60000,
    retry: 2,
  });

  const handleApproveGrades = async (gradeIds: string[]) => {
    if (!user?.id) return;
    
    setProcessing('approve');
    try {
      console.log('🔄 Approving grades:', gradeIds);
      
      const { error } = await supabase
        .from('grades')
        .update({ 
          status: 'approved',
          approved_by_principal: true,
          approved_by: user.id,
          approved_at: new Date().toISOString()
        })
        .in('id', gradeIds);

      if (error) throw error;

      toast({
        title: "Grades Approved",
        description: `${gradeIds.length} grades have been approved successfully.`,
      });

      refetch();
    } catch (error: any) {
      console.error('❌ Grade approval failed:', error);
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve grades.",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectGrades = async (gradeIds: string[]) => {
    if (!user?.id) return;
    
    setProcessing('reject');
    try {
      console.log('🔄 Rejecting grades:', gradeIds);
      
      const { error } = await supabase
        .from('grades')
        .update({ 
          status: 'rejected',
          approved_by_principal: false,
          approved_by: user.id,
          approved_at: new Date().toISOString()
        })
        .in('id', gradeIds);

      if (error) throw error;

      toast({
        title: "Grades Rejected",
        description: `${gradeIds.length} grades have been rejected and sent back to teacher.`,
      });

      refetch();
    } catch (error: any) {
      console.error('❌ Grade rejection failed:', error);
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject grades.",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleReleaseGrades = async (gradeIds: string[]) => {
    if (!user?.id) return;
    
    setProcessing('release');
    try {
      console.log('🔄 Releasing grades:', gradeIds);
      
      const { error } = await supabase
        .from('grades')
        .update({ 
          status: 'released',
          released_to_parents: true,
          released_by: user.id,
          released_at: new Date().toISOString()
        })
        .in('id', gradeIds)
        .eq('approved_by_principal', true);

      if (error) throw error;

      toast({
        title: "Grades Released",
        description: `${gradeIds.length} grades have been released to students and parents.`,
      });

      refetch();
    } catch (error: any) {
      console.error('❌ Grade release failed:', error);
      toast({
        title: "Release Failed",
        description: error.message || "Failed to release grades.",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  return {
    grades,
    isLoading,
    error,
    processing,
    refetch,
    handleApproveGrades,
    handleRejectGrades,
    handleReleaseGrades
  };
};
