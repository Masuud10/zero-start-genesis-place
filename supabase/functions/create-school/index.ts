// @ts-nocheck - Deno Edge Function
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
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the request body
    const { 
      school_name,
      school_motto,
      school_slogan,
      school_email,
      school_phone,
      school_address,
      school_logo_url,
      school_type,
      term_structure,
      director_name,
      director_contact,
      mpesa_paybill,
      mpesa_consumer_key,
      mpesa_consumer_secret,
      owner_full_name,
      owner_email,
      owner_phone
    } = await req.json()

    // Validate required fields
    if (!school_name || !school_email || !school_phone || !school_address || !owner_full_name || !owner_email) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: school_name, school_email, school_phone, school_address, owner_full_name, owner_email' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Call the database function
    const { data, error } = await supabaseClient.rpc('create_school_and_owner', {
      school_name,
      school_motto,
      school_slogan,
      school_email,
      school_phone,
      school_address,
      school_logo_url,
      school_type: school_type || 'Primary',
      term_structure: term_structure || 'Two Semesters',
      director_name,
      director_contact,
      mpesa_paybill,
      mpesa_consumer_key,
      mpesa_consumer_secret,
      owner_full_name,
      owner_email,
      owner_phone
    })

    if (error) {
      console.error('Error creating school:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify(data),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 