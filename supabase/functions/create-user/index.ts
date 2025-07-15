import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: string;
  school_id?: string;
}

interface CreateUserResponse {
  success: boolean;
  user_id?: string;
  school_id?: string;
  message?: string;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Parse request body
    const userData: CreateUserRequest = await req.json();
    
    console.log('--- CREATE USER EDGE FUNCTION: START ---');
    console.log('Request data:', JSON.stringify(userData, null, 2));

    // Validate required fields
    if (!userData.email || !userData.password || !userData.name || !userData.role) {
      throw new Error('Missing required fields: email, password, name, role');
    }

    // Validate role
    const validRoles = ['school_owner', 'principal', 'teacher', 'parent', 'finance_officer', 'hr', 'edufam_admin', 'elimisha_admin'];
    if (!validRoles.includes(userData.role)) {
      throw new Error(`Invalid role: ${userData.role}`);
    }

    // Validate school assignment for non-admin roles
    if (!['edufam_admin', 'elimisha_admin'].includes(userData.role) && !userData.school_id) {
      throw new Error('School assignment is required for this role');
    }

    // Verify school exists if school_id is provided
    if (userData.school_id) {
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select('id')
        .eq('id', userData.school_id)
        .single();

      if (schoolError || !school) {
        throw new Error('Invalid school ID specified');
      }
    }

    // **STEP 1: CREATE AUTHENTICATION USER FIRST**
    console.log('--- STEP 1: Creating auth user ---');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: userData.name,
        role: userData.role,
        school_id: userData.school_id,
        created_by_admin: true
      }
    });

    console.log('Auth creation result:', { 
      success: !!authData.user, 
      user_id: authData.user?.id,
      error: authError?.message 
    });

    if (authError) {
      throw new Error(`Auth user creation failed: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('Failed to create authentication user - no user returned');
    }

    const newUserId = authData.user.id;

    // **STEP 2: CREATE PUBLIC PROFILE SECOND**
    console.log('--- STEP 2: Creating profile with user ID:', newUserId);
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: newUserId, // Use the ID from the auth user
        email: userData.email,
        name: userData.name,
        role: userData.role,
        school_id: userData.school_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    console.log('Profile creation result:', { 
      success: !!profileData, 
      profile_id: profileData?.id,
      error: profileError?.message 
    });

    if (profileError) {
      // If profile creation fails, clean up the auth user
      console.log('--- CLEANUP: Removing auth user due to profile error ---');
      try {
        await supabase.auth.admin.deleteUser(newUserId);
      } catch (cleanupError) {
        console.error('Failed to cleanup auth user:', cleanupError);
      }
      
      throw new Error(`Profile creation failed: ${profileError.message}`);
    }

    // Success response
    const response: CreateUserResponse = {
      success: true,
      user_id: newUserId,
      school_id: userData.school_id,
      message: 'User created successfully with proper authentication and profile setup'
    };

    console.log('--- CREATE USER EDGE FUNCTION: SUCCESS ---');
    console.log('Response:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('--- CREATE USER EDGE FUNCTION: ERROR ---');
    console.error('Error details:', error);

    const errorResponse: CreateUserResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };

    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});