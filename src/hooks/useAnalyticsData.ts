
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
      if (!effectiveSchoolId) {
        throw new Error('School ID is required');
      }

      // Fetch basic counts
      const [studentsRes, teachersRes, classesRes, subjectsRes] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact' }).eq('school_id', effectiveSchoolId).eq('is_active', true),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('school_id', effectiveSchoolId).eq('role', 'teacher'),
        supabase.from('classes').select('id', { count: 'exact' }).eq('school_id', effectiveSchoolId),
        supabase.from('subjects').select('id', { count: 'exact' }).eq('school_id', effectiveSchoolId)
      ]);

      // Fetch grades data for academic performance
      const { data: gradesData } = await supabase
        .from('grades')
        .select(`
          score,
          max_score,
          percentage,
          letter_grade,
          subjects!inner(name),
          created_at
        `)
        .eq('school_id', effectiveSchoolId)
        .eq('status', 'released')
        .not('score', 'is', null);

      // Fetch attendance data
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('status, date')
        .eq('school_id', effectiveSchoolId)
        .gte('date', new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);

      // Fetch fees data
      const { data: feesData } = await supabase
        .from('fees')
        .select('amount, paid_amount, status')
        .eq('school_id', effectiveSchoolId)
        .eq('academic_year', new Date().getFullYear().toString());

      // Calculate averages and trends
      const totalStudents = studentsRes.count || 0;
      const totalTeachers = teachersRes.count || 0;
      const totalClasses = classesRes.count || 0;
      const totalSubjects = subjectsRes.count || 0;

      const averageGrade = gradesData?.length ? 
        gradesData.reduce((sum, grade) => sum + (grade.percentage || 0), 0) / gradesData.length : 0;

      const attendanceRate = attendanceData?.length ?
        (attendanceData.filter(a => a.status === 'present').length / attendanceData.length) * 100 : 0;

      // Subject performance
      const subjectPerformance = new Map<string, number[]>();
      gradesData?.forEach(grade => {
        const subjectName = grade.subjects.name;
        if (!subjectPerformance.has(subjectName)) {
          subjectPerformance.set(subjectName, []);
        }
        subjectPerformance.get(subjectName)!.push(grade.percentage || 0);
      });

      const academicPerformance = Array.from(subjectPerformance.entries()).map(([subject, scores]) => ({
        subject,
        average: scores.reduce((sum, score) => sum + score, 0) / scores.length,
        trend: 'stable' as const // Simplified for now
      }));

      // Grade distribution
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

      // Monthly attendance (last 6 months)
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

      // Fee collection
      const totalExpected = feesData?.reduce((sum, fee) => sum + fee.amount, 0) || 0;
      const totalCollected = feesData?.reduce((sum, fee) => sum + fee.paid_amount, 0) || 0;
      const feeCollectionRate = totalExpected ? (totalCollected / totalExpected) * 100 : 0;

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
    },
    enabled: !!effectiveSchoolId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
};
