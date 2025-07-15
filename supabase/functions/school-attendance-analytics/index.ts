import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

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

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const schoolId = url.pathname.split('/').pop();
    
    if (!schoolId) {
      return new Response(
        JSON.stringify({ error: 'School ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user has access to this school
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('school_id, role')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    const isAuthorized = userProfile && (
      userProfile.role === 'edufam_admin' ||
      userProfile.role === 'elimisha_admin' ||
      userProfile.school_id === schoolId ||
      (await supabase.from('schools').select('id').eq('owner_id', (await supabase.auth.getUser()).data.user?.id).eq('id', schoolId).single()).data
    );

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: 'Access denied: You are not authorized to view this school\'s data' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get current date for today's attendance
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Fetch all attendance data for the school
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('attendance')
      .select(`
        student_id,
        status,
        date,
        students:students(id, name)
      `)
      .eq('school_id', schoolId)
      .gte('date', thirtyDaysAgo);

    if (attendanceError) {
      console.error('Error fetching attendance data:', attendanceError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch attendance data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get total student count
    const { count: totalStudents, error: studentsError } = await supabase
      .from('students')
      .select('*', { count: 'exact' })
      .eq('school_id', schoolId);

    if (studentsError) {
      console.error('Error fetching students count:', studentsError);
    }

    // Calculate overall attendance rate
    const totalAttendanceRecords = attendanceData?.length || 0;
    const presentRecords = attendanceData?.filter(record => record.status === 'present').length || 0;
    const overallAttendanceRate = totalAttendanceRecords > 0 ? (presentRecords / totalAttendanceRecords) * 100 : 0;

    // Calculate today's attendance
    const todayAttendance = attendanceData?.filter(record => record.date === today) || [];
    const presentToday = todayAttendance.filter(record => record.status === 'present').length;
    const absentToday = todayAttendance.filter(record => record.status === 'absent').length;

    // Find students with most absences
    const studentAbsences = attendanceData?.reduce((acc, record) => {
      if (!acc[record.student_id]) {
        acc[record.student_id] = {
          student_name: record.students?.name || 'Unknown',
          total_records: 0,
          absent_count: 0
        };
      }
      acc[record.student_id].total_records++;
      if (record.status === 'absent') {
        acc[record.student_id].absent_count++;
      }
      return acc;
    }, {} as Record<string, any>) || {};

    const studentsWithMostAbsences = Object.entries(studentAbsences)
      .map(([studentId, data]) => ({
        student_id: studentId,
        student_name: data.student_name,
        absence_count: data.absent_count,
        attendance_rate: data.total_records > 0 ? 
          Math.round(((data.total_records - data.absent_count) / data.total_records) * 10000) / 100 : 0
      }))
      .sort((a, b) => b.absence_count - a.absence_count)
      .slice(0, 10);

    // Calculate daily trends for the last 14 days
    const dailyTrends = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateString = date.toISOString().split('T')[0];
      
      const dayAttendance = attendanceData?.filter(record => record.date === dateString) || [];
      const dayPresent = dayAttendance.filter(record => record.status === 'present').length;
      const dayTotal = dayAttendance.length;
      const dayRate = dayTotal > 0 ? (dayPresent / dayTotal) * 100 : 0;

      dailyTrends.push({
        date: dateString,
        attendance_rate: Math.round(dayRate * 100) / 100
      });
    }

    const analytics: AttendanceAnalytics = {
      overall_attendance_rate: Math.round(overallAttendanceRate * 100) / 100,
      total_students: totalStudents || 0,
      present_today: presentToday,
      absent_today: absentToday,
      students_with_most_absences: studentsWithMostAbsences,
      daily_trends: dailyTrends
    };

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: analytics,
        school_id: schoolId 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in school-attendance-analytics:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});