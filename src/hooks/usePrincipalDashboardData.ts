
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PrincipalStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
  totalParents: number;
  pendingApprovals: number;
  totalCertificates: number;
  attendanceRate: number;
  revenueThisMonth: number;
  outstandingFees: number;
  recentGrades: any[];
}

// Export alias for backward compatibility
export type StatsType = PrincipalStats;

export const usePrincipalDashboardData = (schoolId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<PrincipalStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalSubjects: 0,
    totalParents: 0,
    pendingApprovals: 0,
    totalCertificates: 0,
    attendanceRate: 0,
    revenueThisMonth: 0,
    outstandingFees: 0,
    recentGrades: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!schoolId || !user?.id) {
      console.log('🔍 usePrincipalDashboardData: Missing schoolId or user');
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 usePrincipalDashboardData: Fetching data for school:', schoolId);

        // Fetch all dashboard data in parallel
        const [
          studentsResult,
          teachersResult,
          parentsResult,
          classesResult,
          subjectsResult,
          gradesResult,
          certificatesResult,
          attendanceResult,
          feesResult
        ] = await Promise.allSettled([
          supabase.from('students').select('id').eq('school_id', schoolId),
          supabase.from('profiles').select('id').eq('school_id', schoolId).eq('role', 'teacher'),
          supabase.from('profiles').select('id').eq('school_id', schoolId).eq('role', 'parent'),
          supabase.from('classes').select('id').eq('school_id', schoolId),
          supabase.from('subjects').select('id').eq('school_id', schoolId),
          supabase.from('grades').select('id, status, created_at, score, student_id, subject_id').eq('school_id', schoolId).order('created_at', { ascending: false }).limit(10),
          supabase.from('certificates').select('id').eq('school_id', schoolId),
          supabase.from('attendance').select('status').eq('school_id', schoolId),
          supabase.from('fees').select('amount, paid_amount, status').eq('school_id', schoolId)
        ]);

        // Process results safely
        const totalStudents = studentsResult.status === 'fulfilled' && studentsResult.value.data ? studentsResult.value.data.length : 0;
        const totalTeachers = teachersResult.status === 'fulfilled' && teachersResult.value.data ? teachersResult.value.data.length : 0;
        const totalParents = parentsResult.status === 'fulfilled' && parentsResult.value.data ? parentsResult.value.data.length : 0;
        const totalClasses = classesResult.status === 'fulfilled' && classesResult.value.data ? classesResult.value.data.length : 0;
        const totalSubjects = subjectsResult.status === 'fulfilled' && subjectsResult.value.data ? subjectsResult.value.data.length : 0;
        const totalCertificates = certificatesResult.status === 'fulfilled' && certificatesResult.value.data ? certificatesResult.value.data.length : 0;

        // Calculate pending approvals
        const pendingApprovals = gradesResult.status === 'fulfilled' && gradesResult.value.data 
          ? gradesResult.value.data.filter(grade => grade.status === 'submitted').length 
          : 0;

        // Calculate attendance rate
        const attendanceData = attendanceResult.status === 'fulfilled' && attendanceResult.value.data ? attendanceResult.value.data : [];
        const presentCount = attendanceData.filter(record => record.status === 'present').length;
        const attendanceRate = attendanceData.length > 0 ? (presentCount / attendanceData.length) * 100 : 0;

        // Calculate financial data
        const feesData = feesResult.status === 'fulfilled' && feesResult.value.data ? feesResult.value.data : [];
        const totalFees = feesData.reduce((sum, fee) => sum + (fee.amount || 0), 0);
        const totalPaid = feesData.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0);
        const outstandingFees = totalFees - totalPaid;

        // Get recent grades
        const recentGrades = gradesResult.status === 'fulfilled' && gradesResult.value.data ? gradesResult.value.data : [];

        const newStats: PrincipalStats = {
          totalStudents,
          totalTeachers,
          totalParents,
          totalClasses,
          totalSubjects,
          pendingApprovals,
          totalCertificates,
          attendanceRate: Math.round(attendanceRate),
          revenueThisMonth: totalPaid,
          outstandingFees,
          recentGrades
        };

        console.log('✅ usePrincipalDashboardData: Fetched stats:', newStats);
        setStats(newStats);

      } catch (error: any) {
        console.error('❌ usePrincipalDashboardData: Error fetching data:', error);
        setError(error.message || 'Failed to fetch dashboard data');
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [schoolId, user?.id, toast]);

  return { stats, loading, error };
};
