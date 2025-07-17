import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          role: string
          created_at: string
          updated_at: string
        }
      }
      admin_users: {
        Row: {
          id: string
          name: string
          email: string
          role: string
          is_active: boolean
          created_at: string
          updated_at: string
          last_login_at: string
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

    // Define internal Edufam roles
    const internalRoles = ['super_admin', 'support_hr', 'edufam_admin', 'elimisha_admin']

    // Fetch internal staff from profiles table
    const { data: profilesStaff, error: profilesError } = await supabaseClient
      .from('profiles')
      .select(`
        id,
        name,
        email,
        role,
        created_at,
        updated_at
      `)
      .in('role', internalRoles)
      .order('created_at', { ascending: false })

    // Fetch internal staff from admin_users table
    const { data: adminStaff, error: adminError } = await supabaseClient
      .from('admin_users')
      .select(`
        id,
        name,
        email,
        role,
        is_active,
        created_at,
        updated_at,
        last_login_at
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (profilesError && adminError) {
      console.error('Error fetching staff:', { profilesError, adminError })
      return new Response(
        JSON.stringify({ error: 'Failed to fetch internal staff data' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Combine and transform data for internal staff view
    const allStaff = []

    // Add profiles data
    if (profilesStaff) {
      allStaff.push(...profilesStaff.map(staff => ({
        id: staff.id,
        name: staff.name || 'N/A',
        email: staff.email,
        role: staff.role,
        is_active: true, // profiles don't have is_active field, assume active
        created_at: staff.created_at,
        updated_at: staff.updated_at,
        last_login_at: null,
        source: 'profiles'
      })))
    }

    // Add admin_users data
    if (adminStaff) {
      allStaff.push(...adminStaff.map(staff => ({
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        is_active: staff.is_active,
        created_at: staff.created_at,
        updated_at: staff.updated_at,
        last_login_at: staff.last_login_at,
        source: 'admin_users'
      })))
    }

    // Remove duplicates based on email
    const uniqueStaff = allStaff.filter((staff, index, self) => 
      index === self.findIndex(s => s.email === staff.email)
    )

    return new Response(
      JSON.stringify({
        success: true,
        data: uniqueStaff,
        total: uniqueStaff.length
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