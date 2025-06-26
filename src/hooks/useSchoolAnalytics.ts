
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

      // Process each school to get analytics
      const schoolAnalytics: SchoolAnalytics[] = [];

      for (const school of schools) {
        try {
          console.log(`Processing analytics for school: ${school.name}`);

          // Get grades summary with direct query
          const { data: grades } = await supabase
            .from('grades')
            .select('score, student_id')
            .eq('school_id', school.id)
            .eq('status', 'released')
            .not('score', 'is', null);

          let gradesSummary = {
            total_grades: 0,
            average_grade: 0,
            students_with_grades: 0
          };

          if (grades && grades.length > 0) {
            gradesSummary = {
              total_grades: grades.length,
              average_grade: grades.reduce((sum, g) => sum + (g.score || 0), 0) / grades.length,
              students_with_grades: new Set(grades.map(g => g.student_id)).size
            };
          }

          // Get attendance summary with direct query
          const { data: attendance } = await supabase
            .from('attendance')
            .select('status, student_id')
            .eq('school_id', school.id);

          let attendanceSummary = {
            total_records: 0,
            attendance_rate: 0,
            students_tracked: 0
          };

          if (attendance && attendance.length > 0) {
            const presentCount = attendance.filter(a => a.status === 'present').length;
            attendanceSummary = {
              total_records: attendance.length,
              attendance_rate: (presentCount / attendance.length) * 100,
              students_tracked: new Set(attendance.map(a => a.student_id)).size
            };
          }

          // Get financial summary with direct query
          const { data: fees } = await supabase
            .from('fees')
            .select('amount, paid_amount, student_id')
            .eq('school_id', school.id);

          let financialSummary = {
            total_fees_assigned: 0,
            total_fees_collected: 0,
            outstanding_balance: 0,
            students_with_fees: 0
          };

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
