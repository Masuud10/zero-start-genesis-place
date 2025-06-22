
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
      
      // First get all schools
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name, location')
        .order('name');

      if (schoolsError) {
        console.error('Error fetching schools:', schoolsError);
        throw schoolsError;
      }

      if (!schools || schools.length === 0) {
        return [];
      }

      // Process each school to get analytics
      const schoolAnalytics: SchoolAnalytics[] = [];

      for (const school of schools) {
        try {
          // Get grades summary
          const { data: grades, error: gradesError } = await supabase
            .from('grades')
            .select('score, student_id')
            .eq('school_id', school.id)
            .eq('status', 'released')
            .not('score', 'is', null);

          if (gradesError) {
            console.error(`Error fetching grades for school ${school.id}:`, gradesError);
          }

          // Get attendance summary
          const { data: attendance, error: attendanceError } = await supabase
            .from('attendance')
            .select('status, student_id')
            .eq('school_id', school.id);

          if (attendanceError) {
            console.error(`Error fetching attendance for school ${school.id}:`, attendanceError);
          }

          // Get financial summary
          const { data: fees, error: feesError } = await supabase
            .from('fees')
            .select('amount, paid_amount, student_id')
            .eq('school_id', school.id);

          if (feesError) {
            console.error(`Error fetching fees for school ${school.id}:`, feesError);
          }

          // Calculate grades summary
          const gradesData = grades || [];
          const totalGrades = gradesData.length;
          const averageGrade = totalGrades > 0 
            ? gradesData.reduce((sum, g) => sum + (g.score || 0), 0) / totalGrades 
            : 0;
          const studentsWithGrades = new Set(gradesData.map(g => g.student_id)).size;

          // Calculate attendance summary
          const attendanceData = attendance || [];
          const totalAttendanceRecords = attendanceData.length;
          const presentRecords = attendanceData.filter(a => a.status === 'present').length;
          const attendanceRate = totalAttendanceRecords > 0 
            ? (presentRecords / totalAttendanceRecords) * 100 
            : 0;
          const studentsTracked = new Set(attendanceData.map(a => a.student_id)).size;

          // Calculate financial summary
          const feesData = fees || [];
          const totalFeesAssigned = feesData.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
          const totalFeesCollected = feesData.reduce((sum, f) => sum + (Number(f.paid_amount) || 0), 0);
          const outstandingBalance = totalFeesAssigned - totalFeesCollected;
          const studentsWithFees = new Set(feesData.map(f => f.student_id)).size;

          schoolAnalytics.push({
            school_id: school.id,
            school_name: school.name,
            location: school.location || 'Not specified',
            grades_summary: {
              total_grades: totalGrades,
              average_grade: Math.round(averageGrade * 100) / 100,
              students_with_grades: studentsWithGrades,
            },
            attendance_summary: {
              total_records: totalAttendanceRecords,
              attendance_rate: Math.round(attendanceRate * 100) / 100,
              students_tracked: studentsTracked,
            },
            financial_summary: {
              total_fees_assigned: totalFeesAssigned,
              total_fees_collected: totalFeesCollected,
              outstanding_balance: outstandingBalance,
              students_with_fees: studentsWithFees,
            },
          });
        } catch (error) {
          console.error(`Error processing analytics for school ${school.id}:`, error);
          // Continue with other schools even if one fails
        }
      }

      console.log('🏫 School analytics data processed:', schoolAnalytics.length, 'schools');
      return schoolAnalytics;
    },
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
};
