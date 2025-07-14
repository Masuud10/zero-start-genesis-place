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

    // Parse request body
    const { recipient_id } = await req.json();

    if (!recipient_id) {
      return new Response(
        JSON.stringify({ error: 'Recipient ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (recipient_id === user.id) {
      return new Response(
        JSON.stringify({ error: 'Cannot create conversation with yourself' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating conversation between:', user.id, 'and:', recipient_id);

    // Get current user's school_id
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile?.school_id) {
      console.error('Error getting user profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify recipient exists and is in the same school
    const { data: recipientProfile, error: recipientError } = await supabase
      .from('profiles')
      .select('id, school_id')
      .eq('id', recipient_id)
      .single();

    if (recipientError || !recipientProfile) {
      console.error('Error getting recipient profile:', recipientError);
      return new Response(
        JSON.stringify({ error: 'Recipient not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (recipientProfile.school_id !== userProfile.school_id) {
      return new Response(
        JSON.stringify({ error: 'Cannot create conversation with users from different schools' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create participant_ids array with both users
    const participantIds = [user.id, recipient_id];

    // Check if conversation already exists using the new schema
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('id')
      .contains('participant_ids', participantIds)
      .single();

    if (existingConversation) {
      console.log('Conversation already exists:', existingConversation.id);
      return new Response(
        JSON.stringify({ 
          conversation_id: existingConversation.id,
          existing: true 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create new conversation with the new schema
    const { data: newConversation, error: conversationError } = await supabase
      .from('conversations')
      .insert({
        participant_ids: participantIds
      })
      .select()
      .single();

    if (conversationError) {
      console.error('Error creating conversation:', conversationError);
      return new Response(
        JSON.stringify({ error: 'Failed to create conversation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Conversation created successfully:', newConversation.id);

    return new Response(
      JSON.stringify({ 
        conversation_id: newConversation.id,
        existing: false 
      }),
      { 
        status: 201, 
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