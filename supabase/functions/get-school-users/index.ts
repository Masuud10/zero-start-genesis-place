import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization')!;

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false }
    });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Getting school users for user:', user.id);

    // Get current user's school_id to enforce strict multi-tenant isolation
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('school_id, role')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile?.school_id) {
      console.error('Error getting user profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'User profile not found or no school assignment' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User school:', userProfile.school_id, 'role:', userProfile.role);

    // Parse query parameters for search
    const url = new URL(req.url);
    const searchTerm = url.searchParams.get('search') || '';
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // Get all users in the same school with strict isolation
    let query = supabase
      .from('profiles')
      .select('id, name, role, email')
      .eq('school_id', userProfile.school_id) // Strict school isolation
      .neq('id', user.id) // Exclude current user
      .limit(Math.min(limit, 50)); // Cap at 50 for performance

    // Apply search filter if provided
    if (searchTerm.trim()) {
      query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
    }

    const { data: schoolUsers, error: usersError } = await query;

    if (usersError) {
      console.error('Error fetching school users:', usersError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch school users' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found', schoolUsers?.length || 0, 'users in school');

    // Filter out sensitive information and format response
    const sanitizedUsers = (schoolUsers || []).map(user => ({
      id: user.id,
      name: user.name || 'Unknown User',
      role: user.role || 'unknown',
      email: user.email
    }));

    return new Response(
      JSON.stringify({ 
        users: sanitizedUsers,
        school_id: userProfile.school_id,
        total: sanitizedUsers.length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});