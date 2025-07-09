
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AnalyticsData {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
  averageGrade: number;
  attendanceRate: number;
  feeCollectionRate: number;
  academicPerformance: {
    subject: string;
    average: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  gradeDistribution: {
    grade: string;
    count: number;
    percentage: number;
  }[];
  monthlyAttendance: {
    month: string;
    rate: number;
  }[];
  feeCollection: {
    collected: number;
    expected: number;
    outstanding: number;
  };
}

export const useAnalyticsData = (schoolId?: string) => {
  const { user } = useAuth();
  const effectiveSchoolId = schoolId || user?.school_id;

  return useQuery({
    queryKey: ['analytics-data', effectiveSchoolId],
    queryFn: async (): Promise<AnalyticsData> => {
      // Validate school ID before making any queries
      if (!effectiveSchoolId || effectiveSchoolId === 'null' || effectiveSchoolId === 'undefined') {
        console.warn('Invalid or missing school ID for analytics:', effectiveSchoolId);
        // Return default/empty analytics data instead of throwing
        return {
          totalStudents: 0,
          totalTeachers: 0,
          totalClasses: 0,
          totalSubjects: 0,
          averageGrade: 0,
          attendanceRate: 0,
          feeCollectionRate: 0,
          academicPerformance: [],
          gradeDistribution: [],
          monthlyAttendance: [],
          feeCollection: { collected: 0, expected: 0, outstanding: 0 }
        };
      }

      // Additional UUID format validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(effectiveSchoolId)) {
        console.error('Invalid UUID format for school ID:', effectiveSchoolId);
        // Return default data instead of throwing
        return {
          totalStudents: 0,
          totalTeachers: 0,
          totalClasses: 0,
          totalSubjects: 0,
          averageGrade: 0,
          attendanceRate: 0,
          feeCollectionRate: 0,
          academicPerformance: [],
          gradeDistribution: [],
          monthlyAttendance: [],
          feeCollection: { collected: 0, expected: 0, outstanding: 0 }
        };
      }

      console.log('🔍 Fetching analytics data for school:', effectiveSchoolId);

      try {
        // Verify school exists first
        const { data: schoolCheck, error: schoolError } = await supabase
          .from('schools')
          .select('id')
          .eq('id', effectiveSchoolId)
          .single();

        if (schoolError || !schoolCheck) {
          console.warn('School not found or access denied:', schoolError);
          // Return default data instead of throwing
          return {
            totalStudents: 0,
            totalTeachers: 0,
            totalClasses: 0,
            totalSubjects: 0,
            averageGrade: 0,
            attendanceRate: 0,
            feeCollectionRate: 0,
            academicPerformance: [],
            gradeDistribution: [],
            monthlyAttendance: [],
            feeCollection: { collected: 0, expected: 0, outstanding: 0 }
          };
        }

        // Fetch basic counts with proper school isolation and error handling
        const [studentsRes, teachersRes, classesRes, subjectsRes] = await Promise.allSettled([
          supabase
            .from('students')
            .select('id', { count: 'exact' })
            .eq('school_id', effectiveSchoolId)
            .eq('is_active', true),
          supabase
            .from('profiles')
            .select('id', { count: 'exact' })
            .eq('school_id', effectiveSchoolId)
            .eq('role', 'teacher'),
          supabase
            .from('classes')
            .select('id', { count: 'exact' })
            .eq('school_id', effectiveSchoolId),
          supabase
            .from('subjects')
            .select('id', { count: 'exact' })
            .eq('school_id', effectiveSchoolId)
            .eq('is_active', true)
        ]);

        // Handle results with proper error checking
        const totalStudents = studentsRes.status === 'fulfilled' && !studentsRes.value.error 
          ? studentsRes.value.count || 0 : 0;
        const totalTeachers = teachersRes.status === 'fulfilled' && !teachersRes.value.error 
          ? teachersRes.value.count || 0 : 0;
        const totalClasses = classesRes.status === 'fulfilled' && !classesRes.value.error 
          ? classesRes.value.count || 0 : 0;
        const totalSubjects = subjectsRes.status === 'fulfilled' && !subjectsRes.value.error 
          ? subjectsRes.value.count || 0 : 0;

        // Log any errors from the basic counts
        if (studentsRes.status === 'rejected' || (studentsRes.status === 'fulfilled' && studentsRes.value.error)) {
          console.warn('Error fetching students count:', studentsRes.status === 'fulfilled' ? studentsRes.value.error : studentsRes.reason);
        }
        if (teachersRes.status === 'rejected' || (teachersRes.status === 'fulfilled' && teachersRes.value.error)) {
          console.warn('Error fetching teachers count:', teachersRes.status === 'fulfilled' ? teachersRes.value.error : teachersRes.reason);
        }

        // Fetch grades data with proper school isolation and subject join
        const { data: gradesData, error: gradesError } = await supabase
          .from('grades')
          .select(`
            score,
            max_score,
            percentage,
            letter_grade,
            created_at,
            subjects!grades_subject_id_fkey(name)
          `)
          .eq('school_id', effectiveSchoolId)
          .eq('status', 'released')
          .not('score', 'is', null);

        if (gradesError) {
          console.warn('Error fetching grades:', gradesError);
        }

        // Fetch attendance data with proper school isolation
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('status, date')
          .eq('school_id', effectiveSchoolId)
          .gte('date', new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);

        if (attendanceError) {
          console.warn('Error fetching attendance:', attendanceError);
        }

        // Fetch fees data with proper school isolation
        const { data: feesData, error: feesError } = await supabase
          .from('fees')
          .select('amount, paid_amount, status')
          .eq('school_id', effectiveSchoolId)
          .eq('academic_year', new Date().getFullYear().toString());

        if (feesError) {
          console.warn('Error fetching fees:', feesError);
        }

        // Calculate metrics with safe defaults
        const averageGrade = gradesData?.length ? 
          gradesData.reduce((sum, grade) => sum + (grade.percentage || 0), 0) / gradesData.length : 0;

        const attendanceRate = attendanceData?.length ?
          (attendanceData.filter(a => a.status === 'present').length / attendanceData.length) * 100 : 0;

        // Subject performance with null safety
        const subjectPerformance = new Map<string, number[]>();
        gradesData?.forEach(grade => {
          const subjectName = (grade.subjects as { name?: string })?.name || 'Unknown';
          if (!subjectPerformance.has(subjectName)) {
            subjectPerformance.set(subjectName, []);
          }
          subjectPerformance.get(subjectName)!.push(grade.percentage || 0);
        });

        const academicPerformance = Array.from(subjectPerformance.entries()).map(([subject, scores]) => ({
          subject,
          average: scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0,
          trend: 'stable' as const // Simplified for now - could be enhanced with historical data
        }));

        // Grade distribution with null safety
        const gradeDistribution = new Map<string, number>();
        gradesData?.forEach(grade => {
          const letter = grade.letter_grade || 'N/A';
          gradeDistribution.set(letter, (gradeDistribution.get(letter) || 0) + 1);
        });

        const gradeDistributionArray = Array.from(gradeDistribution.entries()).map(([grade, count]) => ({
          grade,
          count,
          percentage: gradesData?.length ? (count / gradesData.length) * 100 : 0
        }));

        // Monthly attendance (last 6 months) with proper date handling
        const monthlyAttendance = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          
          const monthData = attendanceData?.filter(a => {
            const attendanceDate = new Date(a.date);
            return attendanceDate >= monthStart && attendanceDate <= monthEnd;
          }) || [];

          const rate = monthData.length ? 
            (monthData.filter(a => a.status === 'present').length / monthData.length) * 100 : 0;

          monthlyAttendance.push({
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            rate
          });
        }

        // Fee collection with null safety
        const totalExpected = feesData?.reduce((sum, fee) => sum + (fee.amount || 0), 0) || 0;
        const totalCollected = feesData?.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0) || 0;
        const feeCollectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

        console.log('📊 Analytics data processed successfully:', {
          totalStudents,
          totalTeachers,
          averageGrade: averageGrade.toFixed(1),
          attendanceRate: attendanceRate.toFixed(1),
          feeCollectionRate: feeCollectionRate.toFixed(1),
          academicPerformanceCount: academicPerformance.length
        });

        return {
          totalStudents,
          totalTeachers,
          totalClasses,
          totalSubjects,
          averageGrade,
          attendanceRate,
          feeCollectionRate,
          academicPerformance,
          gradeDistribution: gradeDistributionArray,
          monthlyAttendance,
          feeCollection: {
            collected: totalCollected,
            expected: totalExpected,
            outstanding: totalExpected - totalCollected
          }
        };
      } catch (error) {
        console.error('❌ Analytics data fetch error:', error);
        // Return default data on error
        return {
          totalStudents: 0,
          totalTeachers: 0,
          totalClasses: 0,
          totalSubjects: 0,
          averageGrade: 0,
          attendanceRate: 0,
          feeCollectionRate: 0,
          academicPerformance: [],
          gradeDistribution: [],
          monthlyAttendance: [],
          feeCollection: { collected: 0, expected: 0, outstanding: 0 }
        };
      }
    },
    enabled: !!effectiveSchoolId && !!user && effectiveSchoolId !== 'null' && effectiveSchoolId !== 'undefined',
    staleTime: 2 * 60 * 1000, // 2 minutes - reduced for more real-time updates
    refetchInterval: 5 * 60 * 1000, // 5 minutes - auto refresh
    refetchOnWindowFocus: true,
    retry: 2,
    retryDelay: 1000,
  });
};
