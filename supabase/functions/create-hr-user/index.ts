import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // HR user data
    const userData = {
      email: 'sharon@gmail.com',
      password: 'elimisha123',
      name: 'Sharon',
      role: 'hr',
      school_id: 'e671de73-e76e-4405-adde-cd71493d58a5' // Sunshine Primary School
    }

    console.log('--- CREATING HR USER: START ---');
    console.log('User data:', JSON.stringify(userData, null, 2));

    // Step 1: Create the Authentication User
    console.log('--- STEP 1: Creating auth user ---');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        name: userData.name,
        role: userData.role,
        school_id: userData.school_id
      }
    });

    if (authError) {
      console.error('--- AUTH CREATION FAILED ---');
      console.error('Supabase Auth Error:', authError);
      throw new Error(`Auth user creation failed: ${authError.message}`);
    }

    console.log('--- AUTH CREATION SUCCESSFUL ---');
    console.log('Auth User ID:', authData.user.id);
    const newUserId = authData.user.id;

    // Step 2: Create the Public Profile
    const profileToInsert = {
      id: newUserId,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      school_id: userData.school_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('--- STEP 2: Creating profile ---');
    console.log('Profile data:', JSON.stringify(profileToInsert, null, 2));

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert(profileToInsert);

    if (profileError) {
      console.error('--- PROFILE INSERTION FAILED ---');
      console.error('Supabase Profile Insert Error:', profileError);
      
      // Cleanup auth user
      try {
        await supabaseAdmin.auth.admin.deleteUser(newUserId);
      } catch (cleanupError) {
        console.error('Failed to cleanup auth user:', cleanupError);
      }
      
      throw new Error(`Profile creation failed: ${profileError.message}`);
    }

    console.log('--- HR USER CREATED SUCCESSFULLY ---');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'HR user Sharon created successfully',
      user_id: newUserId,
      email: userData.email,
      role: userData.role
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('--- ERROR CREATING HR USER ---');
    console.error('Error:', error);

    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})