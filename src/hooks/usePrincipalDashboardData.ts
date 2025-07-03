import { useState, useEffect, useCallback } from 'react';
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
  recentGrades: Array<{
    id: string;
    status: string;
    created_at: string;
  }>;
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
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!schoolId || !user?.id) {
      console.log('🔍 usePrincipalDashboardData: Missing schoolId or user');
      setLoading(false);
      setError(null);
      setLoadingTimeout(false);
      return;
    }

    // Validate school ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(schoolId)) {
      console.error('🔍 usePrincipalDashboardData: Invalid school ID format:', schoolId);
      setError('Invalid school ID format');
      setLoading(false);
      setLoadingTimeout(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setLoadingTimeout(false);
      
      console.log('🔍 usePrincipalDashboardData: Fetching data for school:', schoolId);

      // Set timeout for loading state
      const timeoutId = setTimeout(() => {
        setLoadingTimeout(true);
      }, 5000); // 5 second timeout

      // Optimized parallel queries with proper error handling
      const controller = new AbortController();
      
      const queries = {
        students: supabase
          .from('students')
          .select('id', { count: 'exact', head: true })
          .eq('school_id', schoolId)
          .eq('is_active', true)
          .abortSignal(controller.signal),
        teachers: supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('school_id', schoolId)
          .eq('role', 'teacher')
          .abortSignal(controller.signal),
        parents: supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('school_id', schoolId)
          .eq('role', 'parent')
          .abortSignal(controller.signal),
        classes: supabase
          .from('classes')
          .select('id', { count: 'exact', head: true })
          .eq('school_id', schoolId)
          .abortSignal(controller.signal),
        subjects: supabase
          .from('subjects')
          .select('id', { count: 'exact', head: true })
          .eq('school_id', schoolId)
          .abortSignal(controller.signal),
        grades: supabase
          .from('grades')
          .select('id, status, created_at')
          .eq('school_id', schoolId)
          .order('created_at', { ascending: false })
          .limit(10)
          .abortSignal(controller.signal),
        certificates: supabase
          .from('certificates')
          .select('id', { count: 'exact', head: true })
          .eq('school_id', schoolId)
          .abortSignal(controller.signal),
        attendance: supabase
          .from('attendance')
          .select('status')
          .eq('school_id', schoolId)
          .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) // Last 30 days
          .limit(1000)
          .abortSignal(controller.signal),
        fees: supabase
          .from('fees')
          .select('amount, paid_amount, status')
          .eq('school_id', schoolId)
          .abortSignal(controller.signal)
      };

      const results = await Promise.allSettled([
        queries.students,
        queries.teachers, 
        queries.parents,
        queries.classes,
        queries.subjects,
        queries.grades,
        queries.certificates,
        queries.attendance,
        queries.fees
      ]);

      clearTimeout(timeoutId);

      // Process results safely with better error handling
      const [studentsResult, teachersResult, parentsResult, classesResult, subjectsResult, gradesResult, certificatesResult, attendanceResult, feesResult] = results;
      
      const totalStudents = studentsResult.status === 'fulfilled' ? (studentsResult.value.count || 0) : 0;
      const totalTeachers = teachersResult.status === 'fulfilled' ? (teachersResult.value.count || 0) : 0;
      const totalParents = parentsResult.status === 'fulfilled' ? (parentsResult.value.count || 0) : 0;
      const totalClasses = classesResult.status === 'fulfilled' ? (classesResult.value.count || 0) : 0;
      const totalSubjects = subjectsResult.status === 'fulfilled' ? (subjectsResult.value.count || 0) : 0;
      const totalCertificates = certificatesResult.status === 'fulfilled' ? (certificatesResult.value.count || 0) : 0;

      // Calculate pending approvals
      const pendingApprovals = gradesResult.status === 'fulfilled' && gradesResult.value.data 
        ? gradesResult.value.data.filter((grade: { status: string }) => grade.status === 'submitted').length 
        : 0;

      // Calculate attendance rate with better data handling
      const attendanceData = attendanceResult.status === 'fulfilled' && attendanceResult.value.data ? attendanceResult.value.data : [];
      const presentCount = attendanceData.filter((record: { status: string }) => record.status === 'present').length;
      const attendanceRate = attendanceData.length > 0 ? Math.round((presentCount / attendanceData.length) * 100) : 0;

      // Calculate financial data with better error handling
      const feesData = feesResult.status === 'fulfilled' && feesResult.value.data ? feesResult.value.data : [];
      const totalFees = feesData.reduce((sum: number, fee: { amount: number | null }) => sum + (parseFloat(String(fee.amount || 0))), 0);
      const totalPaid = feesData.reduce((sum: number, fee: { paid_amount: number | null }) => sum + (parseFloat(String(fee.paid_amount || 0))), 0);
      const outstandingFees = Math.max(0, totalFees - totalPaid);

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
        attendanceRate,
        revenueThisMonth: totalPaid,
        outstandingFees,
        recentGrades
      };

      console.log('✅ usePrincipalDashboardData: Fetched stats:', newStats);
      setStats(newStats);
      setLoadingTimeout(false);

    } catch (error: unknown) {
      console.error('❌ usePrincipalDashboardData: Error fetching data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard data';
      setError(errorMessage);
      setLoadingTimeout(false);
      
      // Only show toast for non-timeout errors
      if (error instanceof Error && error.name !== 'AbortError') {
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  }, [schoolId, user?.id, toast]);

  useEffect(() => {
    // Only fetch if we have both schoolId and user
    if (schoolId && user?.id) {
      fetchDashboardData();
    } else {
      // Reset state when dependencies are missing
      setLoading(false);
      setError(null);
      setLoadingTimeout(false);
      setStats({
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
    }
  }, [schoolId, user?.id, fetchDashboardData]);

  return { 
    stats, 
    loading: loading && !loadingTimeout, 
    error: error || null, 
    loadingTimeout,
    refetch: fetchDashboardData 
  };
};
