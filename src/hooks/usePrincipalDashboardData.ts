
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

  const fetchDashboardData = async () => {
    if (!schoolId || !user?.id) {
      console.log('🔍 usePrincipalDashboardData: Missing schoolId or user');
      setLoading(false);
      setError(null); // Clear any existing errors when no data is available
      return;
    }

    // Validate school ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(schoolId)) {
      console.error('🔍 usePrincipalDashboardData: Invalid school ID format:', schoolId);
      setError('Invalid school ID format');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 usePrincipalDashboardData: Fetching data for school:', schoolId);

      // Fetch all dashboard data in parallel with simplified queries
      const queries = {
        students: supabase.from('students').select('id').eq('school_id', schoolId).eq('is_active', true),
        teachers: supabase.from('profiles').select('id').eq('school_id', schoolId).eq('role', 'teacher'),
        parents: supabase.from('profiles').select('id').eq('school_id', schoolId).eq('role', 'parent'),
        classes: supabase.from('classes').select('id').eq('school_id', schoolId),
        subjects: supabase.from('subjects').select('id').eq('school_id', schoolId),
        grades: supabase.from('grades').select('id, status, created_at, score, student_id, subject_id').eq('school_id', schoolId).order('created_at', { ascending: false }).limit(10),
        certificates: supabase.from('certificates').select('id').eq('school_id', schoolId),
        attendance: supabase.from('attendance').select('status').eq('school_id', schoolId),
        fees: supabase.from('fees').select('amount, paid_amount, status').eq('school_id', schoolId)
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

      // Process results safely
      const [studentsResult, teachersResult, parentsResult, classesResult, subjectsResult, gradesResult, certificatesResult, attendanceResult, feesResult] = results;
      
      const totalStudents = studentsResult.status === 'fulfilled' && studentsResult.value.data ? studentsResult.value.data.length : 0;
      const totalTeachers = teachersResult.status === 'fulfilled' && teachersResult.value.data ? teachersResult.value.data.length : 0;
      const totalParents = parentsResult.status === 'fulfilled' && parentsResult.value.data ? parentsResult.value.data.length : 0;
      const totalClasses = classesResult.status === 'fulfilled' && classesResult.value.data ? classesResult.value.data.length : 0;
      const totalSubjects = subjectsResult.status === 'fulfilled' && subjectsResult.value.data ? subjectsResult.value.data.length : 0;
      const totalCertificates = certificatesResult.status === 'fulfilled' && certificatesResult.value.data ? certificatesResult.value.data.length : 0;

      // Calculate pending approvals
      const pendingApprovals = gradesResult.status === 'fulfilled' && gradesResult.value.data 
        ? gradesResult.value.data.filter((grade: any) => grade.status === 'submitted').length 
        : 0;

      // Calculate attendance rate
      const attendanceData = attendanceResult.status === 'fulfilled' && attendanceResult.value.data ? attendanceResult.value.data : [];
      const presentCount = attendanceData.filter((record: any) => record.status === 'present').length;
      const attendanceRate = attendanceData.length > 0 ? (presentCount / attendanceData.length) * 100 : 0;

      // Calculate financial data
      const feesData = feesResult.status === 'fulfilled' && feesResult.value.data ? feesResult.value.data : [];
      const totalFees = feesData.reduce((sum: number, fee: any) => sum + (fee.amount || 0), 0);
      const totalPaid = feesData.reduce((sum: number, fee: any) => sum + (fee.paid_amount || 0), 0);
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

  useEffect(() => {
    // Only fetch if we have both schoolId and user
    if (schoolId && user?.id) {
      fetchDashboardData();
    } else {
      // Reset state when dependencies are missing
      setLoading(false);
      setError(null);
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
  }, [schoolId, user?.id]);

  return { 
    stats, 
    loading, 
    error: error || null, 
    refetch: fetchDashboardData 
  };
};
