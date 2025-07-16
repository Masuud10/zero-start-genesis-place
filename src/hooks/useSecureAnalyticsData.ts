
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { validateUuid, validateSchoolAccess, createUuidError } from '@/utils/uuidValidation';
import type { AnalyticsData } from './useAnalyticsData';

export const useSecureAnalyticsData = (schoolId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['secure-analytics-data', schoolId || user?.school_id],
    queryFn: async (): Promise<AnalyticsData> => {
      console.log('🔒 Starting secure analytics data fetch');

      // GUARD CLAUSE 1: Validate user authentication
      if (!user) {
        throw new Error('Authentication required to access analytics data');
      }

      // GUARD CLAUSE 2: Validate user school access
      const effectiveSchoolId = schoolId || user.school_id;
      const schoolValidation = validateSchoolAccess(user.school_id, effectiveSchoolId);
      
      if (!schoolValidation.isValid) {
        throw createUuidError('Analytics Access Validation', schoolValidation);
      }

      const validSchoolId = schoolValidation.sanitizedValue!;
      console.log('✅ School access validated:', validSchoolId);

      // GUARD CLAUSE 3: Verify school exists in database
      const { data: schoolCheck, error: schoolError } = await supabase
        .from('schools')
        .select('id, name')
        .eq('id', validSchoolId)
        .maybeSingle();

      if (schoolError || !schoolCheck) {
        console.error('School verification failed:', schoolError);
        throw new Error('School not found or access denied');
      }

      console.log('✅ School exists:', schoolCheck.name);

      try {
        // Secure data fetching with validated UUIDs
        const [studentsRes, teachersRes, classesRes, subjectsRes] = await Promise.allSettled([
          supabase
            .from('students')
            .select('id', { count: 'exact' })
            .eq('school_id', validSchoolId)
            .eq('is_active', true),
          supabase
            .from('profiles')
            .select('id', { count: 'exact' })
            .eq('school_id', validSchoolId)
            .eq('role', 'teacher'),
          supabase
            .from('classes')
            .select('id', { count: 'exact' })
            .eq('school_id', validSchoolId),
          supabase
            .from('subjects')
            .select('id', { count: 'exact' })
            .eq('school_id', validSchoolId)
            .eq('is_active', true)
        ]);

        // Process results with error handling
        const totalStudents = studentsRes.status === 'fulfilled' && !studentsRes.value.error 
          ? studentsRes.value.count || 0 : 0;
        const totalTeachers = teachersRes.status === 'fulfilled' && !teachersRes.value.error 
          ? teachersRes.value.count || 0 : 0;
        const totalClasses = classesRes.status === 'fulfilled' && !classesRes.value.error 
          ? classesRes.value.count || 0 : 0;
        const totalSubjects = subjectsRes.status === 'fulfilled' && !subjectsRes.value.error 
          ? subjectsRes.value.count || 0 : 0;

        // Secure grades data fetch
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
          .eq('school_id', validSchoolId)
          .eq('status', 'released')
          .not('score', 'is', null);

        if (gradesError) {
          console.warn('Grades data fetch warning:', gradesError);
        }

        // Secure attendance data fetch
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('status, date')
          .eq('school_id', validSchoolId)
          .gte('date', new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);

        if (attendanceError) {
          console.warn('Attendance data fetch warning:', attendanceError);
        }

        // Secure fees data fetch
        const { data: feesData, error: feesError } = await supabase
          .from('fees')
          .select('amount, paid_amount, status')
          .eq('school_id', validSchoolId)
          .eq('academic_year', new Date().getFullYear().toString());

        if (feesError) {
          console.warn('Fees data fetch warning:', feesError);
        }

        // Calculate metrics with safe defaults
        const averageGrade = gradesData?.length ? 
          gradesData.reduce((sum, grade) => sum + (grade.percentage || 0), 0) / gradesData.length : 0;

        const attendanceRate = attendanceData?.length ?
          (attendanceData.filter(a => a.status === 'present').length / attendanceData.length) * 100 : 0;

        // Process subject performance safely
        const subjectPerformance = new Map<string, number[]>();
        gradesData?.forEach(grade => {
          const subjectName = (grade.subjects as any)?.name || 'Unknown';
          if (!subjectPerformance.has(subjectName)) {
            subjectPerformance.set(subjectName, []);
          }
          subjectPerformance.get(subjectName)!.push(grade.percentage || 0);
        });

        const academicPerformance = Array.from(subjectPerformance.entries()).map(([subject, scores]) => ({
          subject,
          average: scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0,
          trend: 'stable' as const
        }));

        // Process grade distribution safely
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

        // Calculate monthly attendance trends
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

        // Calculate fee metrics safely
        const totalExpected = feesData?.reduce((sum, fee) => sum + (fee.amount || 0), 0) || 0;
        const totalCollected = feesData?.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0) || 0;
        const feeCollectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

        console.log('✅ Secure analytics data processed successfully');

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
        console.error('Secure analytics data fetch error:', error);
        throw new Error('Failed to fetch analytics data: Please contact support if this persists');
      }
    },
    enabled: !!user && (!!schoolId || !!user.school_id),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 2,
    retryDelay: 1000,
  });
};
