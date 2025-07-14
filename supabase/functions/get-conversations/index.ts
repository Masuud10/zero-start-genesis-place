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

    console.log('Getting conversations for user:', user.id);

    // Get conversations where user is a participant using the new schema
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('*')
      .contains('participant_ids', [user.id])
      .order('created_at', { ascending: false });

    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch conversations' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Raw conversations:', conversations);

    // Transform conversations to include other participant info and last message
    const transformedConversations = [];
    
    for (const conv of conversations || []) {
      // Find the other participant (not the current user)
      const otherParticipantId = conv.participant_ids.find(id => id !== user.id);
      
      if (otherParticipantId) {
        // Get other participant's profile
        const { data: participantProfile } = await supabase
          .from('profiles')
          .select('id, name, role')
          .eq('id', otherParticipantId)
          .single();

        // Get the last message in this conversation
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        transformedConversations.push({
          id: conv.id,
          created_at: conv.created_at,
          other_participant: participantProfile ? {
            id: participantProfile.id,
            name: participantProfile.name || 'Unknown',
            role: participantProfile.role || 'unknown'
          } : {
            id: otherParticipantId,
            name: 'Unknown',
            role: 'unknown'
          },
          last_message_preview: lastMessage?.content || null,
          last_message_at: lastMessage?.created_at || null
        });
      }
    }

    console.log('Transformed conversations:', transformedConversations);

    return new Response(
      JSON.stringify({ conversations: transformedConversations }),
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