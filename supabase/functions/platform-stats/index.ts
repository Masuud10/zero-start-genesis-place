import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get total active students count across all schools
    const { data: studentsData, error: studentsError } = await supabase
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')

    if (studentsError) {
      console.error('Error fetching students:', studentsError)
      throw studentsError
    }

    // Get total schools count
    const { data: schoolsData, error: schoolsError } = await supabase
      .from('schools')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')

    if (schoolsError) {
      console.error('Error fetching schools:', schoolsError)
      throw schoolsError
    }

    const totalStudents = studentsData || 0
    const totalSchools = schoolsData || 0

    const platformStats = {
      totalStudents,
      totalSchools,
      lastUpdated: new Date().toISOString()
    }

    console.log('Platform stats generated:', platformStats)

    return new Response(
      JSON.stringify(platformStats),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )

  } catch (error) {
    console.error('Error in platform-stats function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})