import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

interface ClassAnalytics {
  class_id: string;
  class_name: string;
  student_count: number;
  average_grade: number;
  attendance_rate: number;
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

    // Fetch class analytics
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select(`
        id,
        name,
        students:students(count),
        grades:grades(score, max_score, percentage)
      `)
      .eq('school_id', schoolId);

    if (classesError) {
      console.error('Error fetching classes:', classesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch class data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Fetch attendance data
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('attendance')
      .select('class_id, status')
      .eq('school_id', schoolId);

    if (attendanceError) {
      console.error('Error fetching attendance:', attendanceError);
    }

    // Process analytics
    const analytics: ClassAnalytics[] = classes?.map(cls => {
      const studentCount = cls.students?.[0]?.count || 0;
      
      // Calculate average grade
      const grades = cls.grades || [];
      const validGrades = grades.filter(g => g.percentage !== null);
      const averageGrade = validGrades.length > 0 
        ? validGrades.reduce((sum, g) => sum + g.percentage, 0) / validGrades.length 
        : 0;

      // Calculate attendance rate
      const classAttendance = attendanceData?.filter(a => a.class_id === cls.id) || [];
      const presentCount = classAttendance.filter(a => a.status === 'present').length;
      const totalAttendance = classAttendance.length;
      const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

      return {
        class_id: cls.id,
        class_name: cls.name,
        student_count: studentCount,
        average_grade: Math.round(averageGrade * 100) / 100,
        attendance_rate: Math.round(attendanceRate * 100) / 100
      };
    }) || [];

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
    console.error('Error in school-class-analytics:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});