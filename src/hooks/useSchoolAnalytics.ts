
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SchoolAnalytics {
  school_id: string;
  school_name: string;
  location: string;
  grades_summary: {
    total_grades: number;
    average_grade: number;
    students_with_grades: number;
  };
  attendance_summary: {
    total_records: number;
    attendance_rate: number;
    students_tracked: number;
  };
  financial_summary: {
    total_fees_assigned: number;
    total_fees_collected: number;
    outstanding_balance: number;
    students_with_fees: number;
  };
}

export const useSchoolAnalytics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['school-analytics'],
    queryFn: async (): Promise<SchoolAnalytics[]> => {
      console.log('🏫 Fetching school analytics data');
      
      // First get all schools with better error handling
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name, location, address')
        .order('name');

      if (schoolsError) {
        console.error('Error fetching schools:', schoolsError);
        throw new Error(`Failed to fetch schools: ${schoolsError.message}`);
      }

      if (!schools || schools.length === 0) {
        console.log('No schools found in database');
        return [];
      }

      console.log(`Found ${schools.length} schools, processing analytics...`);

      // Process each school to get analytics with improved queries
      const schoolAnalytics: SchoolAnalytics[] = [];

      for (const school of schools) {
        try {
          console.log(`Processing analytics for school: ${school.name}`);

          // Get grades summary with better aggregation
          const { data: gradesData, error: gradesError } = await supabase
            .rpc('get_school_grades_summary', { school_id: school.id })
            .single();

          let gradesSummary = {
            total_grades: 0,
            average_grade: 0,
            students_with_grades: 0
          };

          if (!gradesError && gradesData) {
            gradesSummary = {
              total_grades: gradesData.total_grades || 0,
              average_grade: gradesData.average_grade || 0,
              students_with_grades: gradesData.students_with_grades || 0
            };
          } else {
            // Fallback to direct query if RPC doesn't exist
            const { data: grades } = await supabase
              .from('grades')
              .select('score, student_id')
              .eq('school_id', school.id)
              .eq('status', 'released')
              .not('score', 'is', null);

            if (grades && grades.length > 0) {
              gradesSummary = {
                total_grades: grades.length,
                average_grade: grades.reduce((sum, g) => sum + (g.score || 0), 0) / grades.length,
                students_with_grades: new Set(grades.map(g => g.student_id)).size
              };
            }
          }

          // Get attendance summary with better aggregation
          const { data: attendanceData, error: attendanceError } = await supabase
            .rpc('get_school_attendance_summary', { school_id: school.id })
            .single();

          let attendanceSummary = {
            total_records: 0,
            attendance_rate: 0,
            students_tracked: 0
          };

          if (!attendanceError && attendanceData) {
            attendanceSummary = {
              total_records: attendanceData.total_records || 0,
              attendance_rate: attendanceData.attendance_rate || 0,
              students_tracked: attendanceData.students_tracked || 0
            };
          } else {
            // Fallback to direct query
            const { data: attendance } = await supabase
              .from('attendance')
              .select('status, student_id')
              .eq('school_id', school.id);

            if (attendance && attendance.length > 0) {
              const presentCount = attendance.filter(a => a.status === 'present').length;
              attendanceSummary = {
                total_records: attendance.length,
                attendance_rate: (presentCount / attendance.length) * 100,
                students_tracked: new Set(attendance.map(a => a.student_id)).size
              };
            }
          }

          // Get financial summary with better aggregation
          const { data: financialData, error: financialError } = await supabase
            .rpc('get_school_financial_summary', { school_id: school.id })
            .single();

          let financialSummary = {
            total_fees_assigned: 0,
            total_fees_collected: 0,
            outstanding_balance: 0,
            students_with_fees: 0
          };

          if (!financialError && financialData) {
            financialSummary = {
              total_fees_assigned: financialData.total_fees_assigned || 0,
              total_fees_collected: financialData.total_fees_collected || 0,
              outstanding_balance: financialData.outstanding_balance || 0,
              students_with_fees: financialData.students_with_fees || 0
            };
          } else {
            // Fallback to direct query
            const { data: fees } = await supabase
              .from('fees')
              .select('amount, paid_amount, student_id')
              .eq('school_id', school.id);

            if (fees && fees.length > 0) {
              const totalAssigned = fees.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
              const totalCollected = fees.reduce((sum, f) => sum + (Number(f.paid_amount) || 0), 0);
              financialSummary = {
                total_fees_assigned: totalAssigned,
                total_fees_collected: totalCollected,
                outstanding_balance: totalAssigned - totalCollected,
                students_with_fees: new Set(fees.map(f => f.student_id)).size
              };
            }
          }

          schoolAnalytics.push({
            school_id: school.id,
            school_name: school.name,
            location: school.location || school.address || 'Not specified',
            grades_summary: gradesSummary,
            attendance_summary: attendanceSummary,
            financial_summary: financialSummary,
          });

          console.log(`✅ Processed analytics for ${school.name}`);
        } catch (error) {
          console.error(`❌ Error processing analytics for school ${school.name}:`, error);
          // Continue processing other schools even if one fails
          schoolAnalytics.push({
            school_id: school.id,
            school_name: school.name,
            location: school.location || school.address || 'Not specified',
            grades_summary: { total_grades: 0, average_grade: 0, students_with_grades: 0 },
            attendance_summary: { total_records: 0, attendance_rate: 0, students_tracked: 0 },
            financial_summary: { total_fees_assigned: 0, total_fees_collected: 0, outstanding_balance: 0, students_with_fees: 0 },
          });
        }
      }

      console.log(`🏫 School analytics data processed: ${schoolAnalytics.length} schools`);
      return schoolAnalytics;
    },
    enabled: user?.role === 'edufam_admin',
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: true,
  });
};
