
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

  // Fetch grades specifically for principal approval with fixed query
  const { data: grades, isLoading, refetch, error } = useQuery({
    queryKey: ['principal-grades-approval', user?.id, schoolId],
    queryFn: async () => {
      if (!user?.id || !schoolId) {
        console.log('❌ Missing user ID or school ID for grade fetching');
        return [];
      }

      console.log('🔍 Fetching grades for principal approval:', { schoolId, userId: user.id });

      try {
        // First, get the basic grade data
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
            released_to_parents
          `)
          .eq('school_id', schoolId)
          .in('status', ['submitted', 'approved', 'rejected', 'released'])
          .order('submitted_at', { ascending: false });

        if (gradeError) {
          console.error('❌ Error fetching grade data:', gradeError);
          throw gradeError;
        }

        if (!gradeData || gradeData.length === 0) {
          console.log('✅ No grades found for principal review');
          return [];
        }

        // Get unique IDs for batch queries
        const studentIds = [...new Set(gradeData.map(g => g.student_id).filter(Boolean))];
        const subjectIds = [...new Set(gradeData.map(g => g.subject_id).filter(Boolean))];
        const classIds = [...new Set(gradeData.map(g => g.class_id).filter(Boolean))];
        const teacherIds = [...new Set(gradeData.map(g => g.submitted_by).filter(Boolean))];

        // Fetch related data separately
        const [studentsData, subjectsData, classesData, teachersData] = await Promise.all([
          // Students
          studentIds.length > 0 
            ? supabase.from('students').select('id, name, admission_number').in('id', studentIds)
            : { data: [], error: null },
          
          // Subjects  
          subjectIds.length > 0
            ? supabase.from('subjects').select('id, name').in('id', subjectIds)
            : { data: [], error: null },
          
          // Classes
          classIds.length > 0
            ? supabase.from('classes').select('id, name').in('id', classIds)
            : { data: [], error: null },
          
          // Teachers
          teacherIds.length > 0
            ? supabase.from('profiles').select('id, name').in('id', teacherIds)
            : { data: [], error: null }
        ]);

        // Check for errors in related data fetching
        if (studentsData.error) throw studentsData.error;
        if (subjectsData.error) throw subjectsData.error;
        if (classesData.error) throw classesData.error;
        if (teachersData.error) throw teachersData.error;

        // Create lookup maps for efficient data joining with proper null checks
        const studentsMap = new Map(
          (studentsData.data || [])
            .filter(s => s && s.id)
            .map(s => [s.id, s] as [string, any])
        );
        const subjectsMap = new Map(
          (subjectsData.data || [])
            .filter(s => s && s.id)
            .map(s => [s.id, s] as [string, any])
        );
        const classesMap = new Map(
          (classesData.data || [])
            .filter(c => c && c.id)
            .map(c => [c.id, c] as [string, any])
        );
        const teachersMap = new Map(
          (teachersData.data || [])
            .filter(t => t && t.id)
            .map(t => [t.id, t] as [string, any])
        );

        // Combine the data
        const enrichedGrades = gradeData.map(grade => ({
          ...grade,
          students: studentsMap.get(grade.student_id) || null,
          subjects: subjectsMap.get(grade.subject_id) || null,
          classes: classesMap.get(grade.class_id) || null,
          profiles: teachersMap.get(grade.submitted_by) || null
        }));

        console.log('✅ Fetched grades for principal:', enrichedGrades.length);
        console.log('📊 Grade statuses:', enrichedGrades.reduce((acc: any, grade: any) => {
          acc[grade.status] = (acc[grade.status] || 0) + 1;
          return acc;
        }, {}));
        
        return enrichedGrades;
      } catch (err) {
        console.error('❌ Failed to fetch grades:', err);
        throw err;
      }
    },
    enabled: !!user?.id && !!schoolId && user.role === 'principal',
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
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
