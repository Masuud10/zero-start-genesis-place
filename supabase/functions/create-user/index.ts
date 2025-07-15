import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password, name, role, school_id } = await req.json()

    if (!email || !password || !name || !role) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields: email, password, name, role' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role,
        school_id,
        created_by_admin: true
      }
    })

    if (authError) {
      console.error('Auth creation error:', authError)
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Failed to create user account: ${authError.message}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    if (!authData.user) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to create user - no user data returned' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    // Create profile in public.profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        name,
        role,
        school_id: role !== 'edufam_admin' && role !== 'elimisha_admin' ? school_id : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Cleanup auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Failed to create user profile: ${profileError.message}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    return new Response(JSON.stringify({ 
      success: true, 
      user_id: authData.user.id,
      message: 'User created successfully with proper school assignment'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Create user function error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})