import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Database {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string
          name: string
          status: string
          subscription_plan: string
          created_at: string
          email: string
          phone: string
          principal_name: string
          principal_contact: string
        }
      }
      profiles: {
        Row: {
          id: string
          role: string
        }
      }
    }
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check user role permissions
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if user has required role
    if (!['support_hr', 'super_admin', 'edufam_admin'].includes(profile.role)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Fetch client schools data
    const { data: schools, error: schoolsError } = await supabaseClient
      .from('schools')
      .select(`
        id,
        name,
        status,
        subscription_plan,
        created_at,
        email,
        phone,
        principal_name,
        principal_contact
      `)
      .order('created_at', { ascending: false })

    if (schoolsError) {
      console.error('Error fetching schools:', schoolsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch schools data' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Transform data for client relations view
    const clientSchools = schools?.map(school => ({
      id: school.id,
      name: school.name,
      status: school.status,
      subscription_plan: school.subscription_plan,
      onboarding_date: school.created_at,
      primary_contact: {
        email: school.email,
        phone: school.phone,
        principal_name: school.principal_name,
        principal_contact: school.principal_contact
      }
    })) || []

    return new Response(
      JSON.stringify({
        success: true,
        data: clientSchools,
        total: clientSchools.length
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})