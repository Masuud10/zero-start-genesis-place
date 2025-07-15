
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

// New types for detailed analytics
interface ClassAnalytics {
  class_id: string;
  class_name: string;
  student_count: number;
  average_grade: number;
  attendance_rate: number;
}

interface StudentAnalytics {
  total_students: number;
  enrollment_trends: {
    month: string;
    count: number;
  }[];
  grade_distribution: {
    grade_range: string;
    count: number;
  }[];
}

interface FinancialAnalytics {
  total_revenue: number;
  total_expenses: number;
  net_income: number;
  revenue_breakdown: {
    category: string;
    amount: number;
  }[];
  monthly_trends: {
    month: string;
    revenue: number;
    expenses: number;
  }[];
}

interface AttendanceAnalytics {
  overall_attendance_rate: number;
  total_students: number;
  present_today: number;
  absent_today: number;
  students_with_most_absences: {
    student_id: string;
    student_name: string;
    absence_count: number;
    attendance_rate: number;
  }[];
  daily_trends: {
    date: string;
    attendance_rate: number;
  }[];
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
        // Validate school ID before processing
        if (!school.id || school.id === 'null' || school.id === 'undefined') {
          console.warn('Invalid school ID found, skipping:', school.id);
          continue;
        }

        // Additional UUID format validation
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(school.id)) {
          console.warn('Invalid UUID format for school ID, skipping:', school.id);
          continue;
        }

        try {
          console.log(`Processing analytics for school: ${school.name}`);

          // Get grades summary with direct query and proper error handling
          const { data: grades, error: gradesError } = await supabase
            .from('grades')
            .select('score, student_id')
            .eq('school_id', school.id)
            .eq('status', 'released')
            .not('score', 'is', null);

          if (gradesError) {
            console.warn(`Error fetching grades for school ${school.name}:`, gradesError);
          }

          let gradesSummary = {
            total_grades: 0,
            average_grade: 0,
            students_with_grades: 0
          };

          if (grades && grades.length > 0) {
            gradesSummary = {
              total_grades: grades.length,
              average_grade: grades.reduce((sum, g) => sum + (g.score || 0), 0) / grades.length,
              students_with_grades: new Set(grades.map(g => g.student_id).filter(id => id)).size
            };
          }

          // Get attendance summary with direct query and proper error handling
          const { data: attendance, error: attendanceError } = await supabase
            .from('attendance')
            .select('status, student_id')
            .eq('school_id', school.id);

          if (attendanceError) {
            console.warn(`Error fetching attendance for school ${school.name}:`, attendanceError);
          }

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
              students_tracked: new Set(attendance.map(a => a.student_id).filter(id => id)).size
            };
          }

          // Get financial summary with direct query and proper error handling
          const { data: fees, error: feesError } = await supabase
            .from('fees')
            .select('amount, paid_amount, student_id')
            .eq('school_id', school.id);

          if (feesError) {
            console.warn(`Error fetching fees for school ${school.name}:`, feesError);
          }

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
              students_with_fees: new Set(fees.map(f => f.student_id).filter(id => id)).size
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

// New detailed analytics hooks for school owners
export const useClassAnalytics = (schoolId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['class-analytics', schoolId],
    queryFn: async (): Promise<ClassAnalytics[]> => {
      const { data, error } = await supabase.functions.invoke('school-class-analytics', {
        body: { school_id: schoolId }
      });
      
      if (error) throw error;
      return data.data;
    },
    enabled: !!user && !!schoolId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useStudentAnalytics = (schoolId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['student-analytics', schoolId],
    queryFn: async (): Promise<StudentAnalytics> => {
      const { data, error } = await supabase.functions.invoke('school-student-analytics', {
        body: { school_id: schoolId }
      });
      
      if (error) throw error;
      return data.data;
    },
    enabled: !!user && !!schoolId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFinancialAnalytics = (schoolId: string, dateRange?: { start: string; end: string }) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['financial-analytics', schoolId, dateRange],
    queryFn: async (): Promise<FinancialAnalytics> => {
      const params = new URLSearchParams();
      if (dateRange?.start) params.append('start_date', dateRange.start);
      if (dateRange?.end) params.append('end_date', dateRange.end);
      
      const { data, error } = await supabase.functions.invoke('school-financial-analytics', {
        body: { 
          school_id: schoolId,
          ...(dateRange && { date_range: dateRange })
        }
      });
      
      if (error) throw error;
      return data.data;
    },
    enabled: !!user && !!schoolId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAttendanceAnalytics = (schoolId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['attendance-analytics', schoolId],
    queryFn: async (): Promise<AttendanceAnalytics> => {
      const { data, error } = await supabase.functions.invoke('school-attendance-analytics', {
        body: { school_id: schoolId }
      });
      
      if (error) throw error;
      return data.data;
    },
    enabled: !!user && !!schoolId,
    staleTime: 2 * 60 * 1000, // 2 minutes (fresher data for attendance)
  });
};
