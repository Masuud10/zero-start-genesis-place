import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // Get user profile to verify parent role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, school_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'parent') {
      return new Response(JSON.stringify({ error: 'Access denied: Only parents can access this endpoint' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    // Get children's IDs linked to this parent
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, name')
      .eq('parent_id', user.id)
      .eq('school_id', profile.school_id)

    if (studentsError) {
      console.error('Error fetching parent children:', studentsError)
      return new Response(JSON.stringify({ error: 'Failed to fetch children data' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    if (!students || students.length === 0) {
      return new Response(JSON.stringify({ 
        data: [],
        message: 'No children found for this parent account'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const studentIds = students.map(s => s.id)

    // Fetch ONLY released grades for the parent's children
    const { data: grades, error: gradesError } = await supabase
      .from('grades')
      .select(`
        id,
        score,
        max_score,
        percentage,
        letter_grade,
        position,
        term,
        academic_year,
        exam_type,
        status,
        created_at,
        student_id,
        subject:subjects(name, code),
        class:classes(name, level)
      `)
      .in('student_id', studentIds)
      .eq('status', 'released')  // CRITICAL: Only show released grades
      .order('created_at', { ascending: false })

    if (gradesError) {
      console.error('Error fetching grades:', gradesError)
      return new Response(JSON.stringify({ error: 'Failed to fetch grades' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    // Combine student data with their grades
    const childrenWithGrades = students.map(student => ({
      ...student,
      grades: grades?.filter(grade => grade.student_id === student.id) || []
    }))

    return new Response(JSON.stringify({ 
      data: childrenWithGrades,
      total_children: students.length,
      total_grades: grades?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Parent grades function error:', error)
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})