import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface CreateAssignmentRequest {
  student_id: string
  route_id: number
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const authHeader = req.headers.get('Authorization')

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's profile to get school_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('school_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (profile.role !== 'finance_officer' && profile.role !== 'principal' && profile.role !== 'school_owner') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const requestBody: CreateAssignmentRequest = await req.json()
    const { student_id, route_id } = requestBody

    if (!student_id || !route_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: student_id, route_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify that both student and route belong to the user's school
    const [studentCheck, routeCheck] = await Promise.all([
      supabase
        .from('students')
        .select('id')
        .eq('id', student_id)
        .eq('school_id', profile.school_id)
        .single(),
      supabase
        .from('transport_routes')
        .select('id')
        .eq('id', route_id)
        .eq('school_id', profile.school_id)
        .single()
    ])

    if (studentCheck.error || !studentCheck.data) {
      return new Response(
        JSON.stringify({ error: 'Student not found or does not belong to your school' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (routeCheck.error || !routeCheck.data) {
      return new Response(
        JSON.stringify({ error: 'Route not found or does not belong to your school' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if student is already assigned to an active route
    const { data: existingAssignment, error: checkError } = await supabase
      .from('student_transport_assignments')
      .select('id, route_id')
      .eq('student_id', student_id)
      .eq('is_active', true)
      .limit(1)

    if (checkError) {
      console.error('Database error checking existing assignment:', checkError)
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (existingAssignment && existingAssignment.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Student is already assigned to an active transport route' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create the assignment
    const { data: assignment, error: insertError } = await supabase
      .from('student_transport_assignments')
      .insert({
        student_id,
        route_id,
        is_active: true,
        assignment_date: new Date().toISOString()
      })
      .select(`
        *,
        students!student_id (
          name,
          admission_number
        ),
        transport_routes!route_id (
          route_name,
          monthly_fee
        )
      `)
      .single()

    if (insertError) {
      console.error('Database error creating assignment:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to create assignment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        assignment: {
          ...assignment,
          student_name: assignment.students?.name,
          student_admission_number: assignment.students?.admission_number,
          route_name: assignment.transport_routes?.route_name,
          monthly_fee: assignment.transport_routes?.monthly_fee
        }
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})