import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the request body
    const { email, password } = await req.json()

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Sign in the user
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return new Response(
        JSON.stringify({ error: authError.message }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fetch the user's role from the profiles table
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role, name, status')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      // Sign out the user if we can't verify their role
      await supabaseClient.auth.signOut()
      return new Response(
        JSON.stringify({ error: 'Failed to verify user permissions' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if the user has a valid internal role
    const validInternalRoles = ['super_admin', 'support_hr', 'software_engineer', 'sales_marketing', 'finance']
    
    if (!profile.role || !validInternalRoles.includes(profile.role)) {
      console.error('Invalid role for admin access:', profile.role)
      // Sign out the user immediately
      await supabaseClient.auth.signOut()
      return new Response(
        JSON.stringify({ error: 'Access Denied. You are not authorized to access the admin application.' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user is active
    if (profile.status === 'inactive') {
      console.error('Inactive user attempted login:', authData.user.email)
      await supabaseClient.auth.signOut()
      return new Response(
        JSON.stringify({ error: 'Your account has been deactivated. Please contact your administrator.' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log successful admin login
    console.log('Successful admin login:', {
      email: authData.user.email,
      role: profile.role,
      timestamp: new Date().toISOString()
    })

    // Return success with user data
    return new Response(
      JSON.stringify({
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role: profile.role,
          name: profile.name,
          session: authData.session
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Admin login error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 