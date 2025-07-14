
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useEduFamSystemAnalytics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['edufam-system-analytics'],
    queryFn: async () => {
      console.log('🔄 Fetching EduFam system analytics using database functions...');
      
      try {
        // Use the database functions we created in the migration
        const [gradesResult, attendanceResult, financeResult, schoolsResult] = await Promise.all([
          // Get system-wide grades analytics - using SQL directly since functions need to be typed
          supabase
            .from('grades')
            .select('score, percentage, school_id')
            .not('score', 'is', null),
          
          // Get system-wide attendance analytics
          supabase
            .from('attendance')
            .select('status, school_id'),
          
          // Get system-wide finance analytics
          supabase
            .from('fees')
            .select('amount, paid_amount, school_id'),
          
          // Get schools count
          supabase
            .from('schools')
            .select('id')
        ]);

        if (gradesResult.error) {
          console.error('❌ Grades analytics error:', gradesResult.error);
          throw gradesResult.error;
        }
        if (attendanceResult.error) {
          console.error('❌ Attendance analytics error:', attendanceResult.error);
          throw attendanceResult.error;
        }
        if (financeResult.error) {
          console.error('❌ Finance analytics error:', financeResult.error);
          throw financeResult.error;
        }
        if (schoolsResult.error) {
          console.error('❌ Schools analytics error:', schoolsResult.error);
          throw schoolsResult.error;
        }

        const grades = gradesResult.data || [];
        const attendance = attendanceResult.data || [];
        const fees = financeResult.data || [];
        const schools = schoolsResult.data || [];

        // Calculate grades analytics using the same logic as database functions
        const schoolGradesMap = new Map<string, number[]>();
        grades.forEach(grade => {
          const schoolId = grade.school_id;
          if (!schoolGradesMap.has(schoolId)) {
            schoolGradesMap.set(schoolId, []);
          }
          const gradeValue = grade.percentage || grade.score || 0;
          schoolGradesMap.get(schoolId)!.push(gradeValue);
        });

        const totalGrades = grades.length;
        const schoolsWithGrades = schoolGradesMap.size;
        const averageGrade = totalGrades > 0 
          ? grades.reduce((sum, g) => sum + (g.percentage || g.score || 0), 0) / totalGrades 
          : 0;

        // Calculate attendance analytics
        const schoolAttendanceMap = new Map<string, { total: number; present: number }>();
        attendance.forEach(record => {
          const schoolId = record.school_id;
          if (!schoolAttendanceMap.has(schoolId)) {
            schoolAttendanceMap.set(schoolId, { total: 0, present: 0 });
          }
          const data = schoolAttendanceMap.get(schoolId)!;
          data.total++;
          if (record.status === 'present') {
            data.present++;
          }
        });

        const totalAttendanceRecords = attendance.length;
        const schoolsWithAttendance = schoolAttendanceMap.size;
        const averageAttendanceRate = schoolsWithAttendance > 0
          ? Array.from(schoolAttendanceMap.values()).reduce((sum, school) => 
              sum + (school.total > 0 ? (school.present / school.total) * 100 : 0), 0
            ) / schoolsWithAttendance
          : 0;

        // Calculate finance analytics
        const schoolFinanceMap = new Map<string, { total: number; collected: number }>();
        fees.forEach(fee => {
          const schoolId = fee.school_id;
          if (!schoolFinanceMap.has(schoolId)) {
            schoolFinanceMap.set(schoolId, { total: 0, collected: 0 });
          }
          const data = schoolFinanceMap.get(schoolId)!;
          data.total += fee.amount || 0;
          data.collected += fee.paid_amount || 0;
        });

        const schoolsWithFinance = schoolFinanceMap.size;
        const totalCollected = Array.from(schoolFinanceMap.values()).reduce((sum, school) => sum + school.collected, 0);
        const totalOutstanding = Array.from(schoolFinanceMap.values()).reduce((sum, school) => sum + (school.total - school.collected), 0);

        console.log('✅ Calculated analytics:', {
          grades: { totalGrades, schoolsWithGrades, averageGrade },
          attendance: { totalAttendanceRecords, schoolsWithAttendance, averageAttendanceRate },
          finance: { schoolsWithFinance, totalCollected, totalOutstanding },
          schools: { totalSchools: schools.length }
        });

        return {
          grades: {
            total_grades: totalGrades,
            schools_with_grades: schoolsWithGrades,
            average_grade: averageGrade
          },
          attendance: {
            total_records: totalAttendanceRecords,
            schools_with_attendance: schoolsWithAttendance,
            average_attendance_rate: averageAttendanceRate
          },
          finance: {
            schools_with_finance: schoolsWithFinance,
            total_collected: totalCollected,
            total_outstanding: totalOutstanding
          },
          schools: {
            total_schools: schools.length,
            active_schools: schools.length
          },
          last_updated: new Date().toISOString()
        };
        
      } catch (error) {
        console.error('❌ Error fetching EduFam system analytics:', error);
        throw error;
      }
    },
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
    meta: {
      errorMessage: 'Failed to load system analytics'
    }
  });
};
