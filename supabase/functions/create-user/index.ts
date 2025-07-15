import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // IMPORTANT: Use the Service Role Key
    )

    const userData = await req.json()

    // --- START OF FORENSIC LOGGING ---
    console.log('--- FORENSIC LOG 1: INCOMING DATA ---');
    console.log('Received user data from frontend:', JSON.stringify(userData, null, 2));

    // Step A: Create the Authentication User
    console.log('--- FORENSIC LOG 2: ATTEMPTING AUTH USER CREATION ---');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password, // Ensure a password is provided
      email_confirm: true,
      user_metadata: {
        name: userData.name,
        role: userData.role,
        school_id: userData.school_id
      }
    });

    if (authError) {
      console.error('--- FORENSIC LOG 3: AUTH CREATION FAILED ---');
      console.error('Supabase Auth Error:', authError);
      throw new Error(`Auth user creation failed: ${authError.message}`);
    }

    console.log('--- FORENSIC LOG 3: AUTH CREATION SUCCESSFUL ---');
    console.log('Auth User Response:', JSON.stringify(authData.user, null, 2));
    const newUserId = authData.user.id;
    console.log('Extracted New User ID:', newUserId);

    // Step B: Create the Public Profile
    const profileToInsert = {
      id: newUserId, // Use the ID from the auth user
      name: userData.name,
      email: userData.email,
      role: userData.role,
      school_id: userData.school_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('--- FORENSIC LOG 4: ATTEMPTING PROFILE INSERTION ---');
    console.log('Data being inserted into public.profiles:', JSON.stringify(profileToInsert, null, 2));

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert(profileToInsert);

    if (profileError) {
      console.error('--- FORENSIC LOG 5: PROFILE INSERTION FAILED ---');
      console.error('Supabase Profile Insert Error:', profileError);
      throw new Error(`Profile creation failed: ${profileError.message}`);
    }

    console.log('--- FORENSIC LOG 5: PROFILE INSERTION SUCCESSFUL ---');
    // --- END OF FORENSIC LOGGING ---

    return new Response(JSON.stringify({ success: true, user: authData.user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})