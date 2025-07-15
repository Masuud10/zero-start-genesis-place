import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

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

    // Fetch total students
    const { count: totalStudents, error: studentsError } = await supabase
      .from('students')
      .select('*', { count: 'exact' })
      .eq('school_id', schoolId);

    if (studentsError) {
      console.error('Error fetching students count:', studentsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch student data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Fetch enrollment trends (last 12 months)
    const currentDate = new Date();
    const twelveMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 11, 1);
    
    const { data: enrollmentData, error: enrollmentError } = await supabase
      .from('students')
      .select('created_at')
      .eq('school_id', schoolId)
      .gte('created_at', twelveMonthsAgo.toISOString());

    if (enrollmentError) {
      console.error('Error fetching enrollment data:', enrollmentError);
    }

    // Process enrollment trends
    const enrollmentTrends = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
      
      const monthStudents = enrollmentData?.filter(student => {
        const createdAt = new Date(student.created_at);
        return createdAt >= monthDate && createdAt < nextMonth;
      }).length || 0;

      enrollmentTrends.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count: monthStudents
      });
    }

    // Fetch grade distribution
    const { data: gradesData, error: gradesError } = await supabase
      .from('grades')
      .select('percentage')
      .in('student_id', (await supabase.from('students').select('id').eq('school_id', schoolId)).data?.map(s => s.id) || [])
      .not('percentage', 'is', null);

    if (gradesError) {
      console.error('Error fetching grades data:', gradesError);
    }

    // Process grade distribution
    const gradeRanges = [
      { range: 'A (90-100%)', min: 90, max: 100 },
      { range: 'B (80-89%)', min: 80, max: 89 },
      { range: 'C (70-79%)', min: 70, max: 79 },
      { range: 'D (60-69%)', min: 60, max: 69 },
      { range: 'F (0-59%)', min: 0, max: 59 }
    ];

    const gradeDistribution = gradeRanges.map(range => ({
      grade_range: range.range,
      count: gradesData?.filter(grade => 
        grade.percentage >= range.min && grade.percentage <= range.max
      ).length || 0
    }));

    const analytics: StudentAnalytics = {
      total_students: totalStudents || 0,
      enrollment_trends: enrollmentTrends,
      grade_distribution: gradeDistribution
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
    console.error('Error in school-student-analytics:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});