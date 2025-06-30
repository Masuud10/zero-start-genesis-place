
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
  };
  finance: {
    total_collected: number;
    outstanding_amount: number;
  };
  attendance: {
    average_attendance_rate: number;
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
          .select('score, max_score, percentage')
          .not('score', 'is', null);

        if (gradesError) {
          console.error('Error fetching grades:', gradesError);
        }

        // Calculate analytics
        const totalSchools = schoolsData?.length || 0;
        const activeSchools = schoolsData?.filter(s => s.status === 'active').length || 0;
        const totalUsers = usersData?.length || 0;
        const activeUsers = Math.floor(totalUsers * 0.8); // Mock active users calculation
        const totalGrades = gradesData?.length || 0;
        const averageGrade = gradesData?.length ? 
          gradesData.reduce((sum, g) => sum + (g.percentage || 0), 0) / gradesData.length : 0;

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
            average_grade: averageGrade
          },
          finance: {
            total_collected: 5000000, // Mock data
            outstanding_amount: 1200000 // Mock data
          },
          attendance: {
            average_attendance_rate: 87.5 // Mock data
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
