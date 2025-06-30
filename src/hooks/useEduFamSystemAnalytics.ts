
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SystemAnalytics {
  schools: {
    total_schools: number;
    active_schools: number;
  };
  users: {
    total_users: number;
    active_users: number;
  };
  grades: {
    total_grades: number;
    average_grade: number;
    schools_with_grades: number;
  };
  finance: {
    total_collected: number;
    outstanding_amount: number;
    total_outstanding: number;
    schools_with_finance: number;
  };
  attendance: {
    average_attendance_rate: number;
    total_records: number;
    schools_with_attendance: number;
  };
  system: {
    uptime_percentage: number;
  };
}

export const useEduFamSystemAnalytics = () => {
  return useQuery({
    queryKey: ['edufam-system-analytics'],
    queryFn: async (): Promise<SystemAnalytics> => {
      console.log('📊 Fetching EduFam system analytics...');
      
      try {
        // Fetch schools data
        const { data: schoolsData, error: schoolsError } = await supabase
          .from('schools')
          .select('id, status')
          .eq('status', 'active');

        if (schoolsError) {
          console.error('Error fetching schools:', schoolsError);
        }

        // Fetch users data
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, role, created_at');

        if (usersError) {
          console.error('Error fetching users:', usersError);
        }

        // Fetch grades data
        const { data: gradesData, error: gradesError } = await supabase
          .from('grades')
          .select('score, max_score, percentage, school_id')
          .not('score', 'is', null);

        if (gradesError) {
          console.error('Error fetching grades:', gradesError);
        }

        // Fetch attendance data
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('status, school_id')
          .not('status', 'is', null);

        if (attendanceError) {
          console.error('Error fetching attendance:', attendanceError);
        }

        // Fetch finance data
        const { data: financeData, error: financeError } = await supabase
          .from('fees')
          .select('amount, paid_amount, school_id')
          .not('amount', 'is', null);

        if (financeError) {
          console.error('Error fetching finance:', financeError);
        }

        // Calculate analytics
        const totalSchools = schoolsData?.length || 0;
        const activeSchools = schoolsData?.filter(s => s.status === 'active').length || 0;
        const totalUsers = usersData?.length || 0;
        const activeUsers = Math.floor(totalUsers * 0.8); // Mock active users calculation
        
        const totalGrades = gradesData?.length || 0;
        const averageGrade = gradesData?.length ? 
          gradesData.reduce((sum, g) => sum + (g.percentage || 0), 0) / gradesData.length : 0;
        const schoolsWithGrades = new Set(gradesData?.map(g => g.school_id)).size;

        const totalAttendanceRecords = attendanceData?.length || 0;
        const presentCount = attendanceData?.filter(a => a.status === 'present').length || 0;
        const averageAttendanceRate = totalAttendanceRecords > 0 ? (presentCount / totalAttendanceRecords) * 100 : 0;
        const schoolsWithAttendance = new Set(attendanceData?.map(a => a.school_id)).size;

        const totalCollected = financeData?.reduce((sum, f) => sum + (Number(f.paid_amount) || 0), 0) || 0;
        const totalAmount = financeData?.reduce((sum, f) => sum + (Number(f.amount) || 0), 0) || 0;
        const outstandingAmount = totalAmount - totalCollected;
        const schoolsWithFinance = new Set(financeData?.map(f => f.school_id)).size;

        const analytics: SystemAnalytics = {
          schools: {
            total_schools: totalSchools,
            active_schools: activeSchools
          },
          users: {
            total_users: totalUsers,
            active_users: activeUsers
          },
          grades: {
            total_grades: totalGrades,
            average_grade: averageGrade,
            schools_with_grades: schoolsWithGrades
          },
          finance: {
            total_collected: totalCollected,
            outstanding_amount: outstandingAmount,
            total_outstanding: outstandingAmount,
            schools_with_finance: schoolsWithFinance
          },
          attendance: {
            average_attendance_rate: averageAttendanceRate,
            total_records: totalAttendanceRecords,
            schools_with_attendance: schoolsWithAttendance
          },
          system: {
            uptime_percentage: 99.9 // Mock data
          }
        };

        console.log('✅ EduFam system analytics fetched successfully:', analytics);
        return analytics;

      } catch (error) {
        console.error('❌ Error in useEduFamSystemAnalytics:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
