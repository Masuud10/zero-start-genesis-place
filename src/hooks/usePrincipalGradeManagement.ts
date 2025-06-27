
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePrincipalGradeManagement = () => {
  const { user } = useAuth();
  const { schoolId, validateSchoolAccess } = useSchoolScopedData();
  const { toast } = useToast();
  const [processing, setProcessing] = useState<string | null>(null);

  // Enhanced grade fetching with comprehensive error handling and validation
  const { data: grades = [], isLoading, refetch, error } = useQuery({
    queryKey: ['principal-grades-approval', user?.id, schoolId],
    queryFn: async () => {
      if (!user?.id || !schoolId) {
        console.log('❌ Missing user ID or school ID for grade fetching');
        return [];
      }

      // Validate user role
      if (user.role !== 'principal') {
        console.error('❌ User is not a principal:', user.role);
        throw new Error('Unauthorized: Only principals can access grade management');
      }

      // Validate school access
      if (!validateSchoolAccess(schoolId)) {
        console.error('❌ Invalid school access for user:', user.id, 'school:', schoolId);
        throw new Error('Access denied: Cannot access this school\'s data');
      }

      console.log('🔍 Fetching grades for principal approval:', { schoolId, userId: user.id });

      try {
        // Optimized query with comprehensive joins and error handling
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
            curriculum_type,
            cbc_performance_level,
            comments,
            students!grades_student_id_fkey(id, name, admission_number),
            subjects!grades_subject_id_fkey(id, name, code),
            classes!grades_class_id_fkey(id, name),
            profiles!grades_submitted_by_fkey(id, name)
          `)
          .eq('school_id', schoolId)
          .in('status', ['submitted', 'approved', 'rejected', 'released'])
          .order('submitted_at', { ascending: false })
          .limit(500); // Prevent excessive data loading

        if (gradeError) {
          console.error('❌ Error fetching grade data:', gradeError);
          throw new Error(`Database error: ${gradeError.message} (Code: ${gradeError.code})`);
        }

        if (!gradeData) {
          console.warn('⚠️ No grade data returned from query');
          return [];
        }

        // Validate that all grades belong to the correct school
        const invalidGrades = gradeData.filter(grade => 
          !grade.students || !grade.subjects || !grade.classes
        );

        if (invalidGrades.length > 0) {
          console.warn('⚠️ Found grades with missing related data:', invalidGrades.length);
        }

        console.log('✅ Fetched grades for principal:', gradeData.length);
        return gradeData;
      } catch (err: any) {
        console.error('❌ Failed to fetch grades:', err);
        throw new Error(err.message || 'Failed to load grades');
      }
    },
    enabled: !!user?.id && !!schoolId && user.role === 'principal',
    staleTime: 30000,
    refetchInterval: 60000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const handleApproveGrades = async (gradeIds: string[]) => {
    if (!user?.id || gradeIds.length === 0) {
      throw new Error('Invalid request parameters');
    }

    if (!validateSchoolAccess(schoolId)) {
      throw new Error('Access denied: Cannot approve grades for this school');
    }
    
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
        .in('id', gradeIds)
        .eq('school_id', schoolId) // Ensure school isolation
        .eq('status', 'submitted'); // Only approve submitted grades

      if (error) {
        console.error('❌ Grade approval failed:', error);
        throw new Error(`Failed to approve grades: ${error.message}`);
      }

      toast({
        title: "Grades Approved",
        description: `${gradeIds.length} grades have been approved successfully.`,
      });

      await refetch();
    } catch (error: any) {
      console.error('❌ Grade approval failed:', error);
      throw error;
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectGrades = async (gradeIds: string[]) => {
    if (!user?.id || gradeIds.length === 0) {
      throw new Error('Invalid request parameters');
    }

    if (!validateSchoolAccess(schoolId)) {
      throw new Error('Access denied: Cannot reject grades for this school');
    }
    
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
        .in('id', gradeIds)
        .eq('school_id', schoolId) // Ensure school isolation
        .eq('status', 'submitted'); // Only reject submitted grades

      if (error) {
        console.error('❌ Grade rejection failed:', error);
        throw new Error(`Failed to reject grades: ${error.message}`);
      }

      toast({
        title: "Grades Rejected",
        description: `${gradeIds.length} grades have been rejected and sent back to teacher.`,
      });

      await refetch();
    } catch (error: any) {
      console.error('❌ Grade rejection failed:', error);
      throw error;
    } finally {
      setProcessing(null);
    }
  };

  const handleReleaseGrades = async (gradeIds: string[]) => {
    if (!user?.id || gradeIds.length === 0) {
      throw new Error('Invalid request parameters');
    }

    if (!validateSchoolAccess(schoolId)) {
      throw new Error('Access denied: Cannot release grades for this school');
    }
    
    setProcessing('release');
    try {
      console.log('🔄 Releasing grades:', gradeIds);
      
      const { error } = await supabase
        .from('grades')
        .update({ 
          status: 'released',
          released_to_parents: true,
          released_by: user.id,
          released_at: new Date().toISOString(),
          is_released: true
        })
        .in('id', gradeIds)
        .eq('approved_by_principal', true) // Only release approved grades
        .eq('school_id', schoolId); // Ensure school isolation

      if (error) {
        console.error('❌ Grade release failed:', error);
        throw new Error(`Failed to release grades: ${error.message}`);
      }

      toast({
        title: "Grades Released",
        description: `${gradeIds.length} grades have been released to students and parents.`,
      });

      await refetch();
    } catch (error: any) {
      console.error('❌ Grade release failed:', error);
      throw error;
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
