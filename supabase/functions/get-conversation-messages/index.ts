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

    // Extract conversation ID from URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const conversationId = pathParts[pathParts.length - 1];

    if (!conversationId) {
      return new Response(
        JSON.stringify({ error: 'Conversation ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Getting messages for conversation:', conversationId, 'user:', user.id);

    // First verify user is a participant in this conversation using new schema
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id, participant_ids')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      console.error('Conversation error:', convError);
      return new Response(
        JSON.stringify({ error: 'Conversation not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is a participant using the new participant_ids array
    const isParticipant = conversation.participant_ids.includes(user.id);

    if (!isParticipant) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get messages for this conversation with sender details
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        sender_id,
        conversation_id,
        created_at
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch messages' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found', messages?.length || 0, 'messages');

    // Transform messages to include sender details
    const transformedMessages = [];
    
    for (const message of messages || []) {
      // Get sender profile
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('id, name, role')
        .eq('id', message.sender_id)
        .single();

      transformedMessages.push({
        id: message.id,
        content: message.content,
        sender_id: message.sender_id,
        conversation_id: message.conversation_id,
        created_at: message.created_at,
        sender: senderProfile ? {
          id: senderProfile.id,
          name: senderProfile.name || 'Unknown',
          role: senderProfile.role || 'unknown'
        } : {
          id: message.sender_id,
          name: 'Unknown',
          role: 'unknown'
        }
      });
    }

    return new Response(
      JSON.stringify({ messages: transformedMessages }),
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