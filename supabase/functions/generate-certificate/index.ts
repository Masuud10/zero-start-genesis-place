import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get user profile to check role and school
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, school_id')
      .eq('id', user.id)
      .single()

    if (!profile || !['principal', 'teacher', 'edufam_admin', 'elimisha_admin'].includes(profile.role)) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const body = await req.json()
    const { student_id, template_id, dynamic_data } = body

    if (!student_id || !template_id) {
      return new Response(JSON.stringify({ error: 'Student ID and template ID are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Fetch student data
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select(`
        id,
        name,
        admission_number,
        roll_number,
        date_of_birth,
        gender,
        avatar,
        school_id,
        class_id,
        classes!left (
          id,
          name,
          level,
          stream
        )
      `)
      .eq('id', student_id)
      .eq('school_id', profile.school_id)
      .single()

    if (studentError || !student) {
      console.error('Error fetching student:', studentError)
      return new Response(JSON.stringify({ error: 'Student not found or access denied' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Fetch template data
    const { data: template, error: templateError } = await supabase
      .from('certificate_templates')
      .select('*')
      .eq('id', template_id)
      .eq('school_id', profile.school_id)
      .single()

    if (templateError || !template) {
      console.error('Error fetching template:', templateError)
      return new Response(JSON.stringify({ error: 'Template not found or access denied' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Fetch school data
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select('*')
      .eq('id', profile.school_id)
      .single()

    if (schoolError || !school) {
      console.error('Error fetching school:', schoolError)
      return new Response(JSON.stringify({ error: 'School not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Replace placeholders in template text
    const replacePlaceholders = (text: string) => {
      return text
        .replace(/\{\{student_name\}\}/g, student.name)
        .replace(/\{\{student_id\}\}/g, student.admission_number || student.roll_number || student.id)
        .replace(/\{\{class\}\}/g, student.classes?.name || 'N/A')
        .replace(/\{\{school_name\}\}/g, school.name)
        .replace(/\{\{reason\}\}/g, dynamic_data?.reason || 'outstanding performance')
        .replace(/\{\{date\}\}/g, new Date().toLocaleDateString())
        .replace(/\{\{academic_year\}\}/g, dynamic_data?.academic_year || new Date().getFullYear().toString())
    }

    // Process the certificate data
    const certificateData = {
      template: {
        ...template,
        title_text: replacePlaceholders(template.title_text),
        body_text: replacePlaceholders(template.body_text),
        signature_1_name: replacePlaceholders(template.signature_1_name),
        signature_2_name: replacePlaceholders(template.signature_2_name)
      },
      student: {
        ...student,
        class_name: student.classes?.name || 'N/A'
      },
      school,
      dynamic_data,
      generated_at: new Date().toISOString(),
      generated_by: user.id
    }

    // Save certificate generation record (optional - for audit trail)
    const { error: saveError } = await supabase
      .from('certificates')
      .insert({
        school_id: profile.school_id,
        student_id: student.id,
        class_id: student.class_id,
        academic_year: dynamic_data?.academic_year || new Date().getFullYear().toString(),
        performance: certificateData,
        generated_by: user.id
      })

    if (saveError) {
      console.error('Error saving certificate record:', saveError)
      // Don't fail the request if saving fails, just log it
    }

    return new Response(JSON.stringify({ 
      success: true, 
      certificate_data: certificateData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})