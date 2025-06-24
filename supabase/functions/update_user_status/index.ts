
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = "https://lmqyizrnuahkmwauonqr.supabase.co";
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!SUPABASE_SERVICE_KEY) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is missing");
      return new Response(
        JSON.stringify({ error: "Service configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { target_user_id, new_status } = await req.json();

    if (!target_user_id || !new_status) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate status
    if (!['active', 'inactive'].includes(new_status)) {
      return new Response(
        JSON.stringify({ error: "Invalid status value" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get current user to check permissions
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header missing" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user token for permission checking
    const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') || '', {
      global: {
        headers: { Authorization: authHeader }
      }
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check current user role
    const { data: currentUserProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !currentUserProfile) {
      return new Response(
        JSON.stringify({ error: "Failed to get user profile" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only admins can update user status
    if (!['edufam_admin', 'elimisha_admin'].includes(currentUserProfile.role)) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get target user role to prevent deactivating admins
    const { data: targetUserProfile, error: targetProfileError } = await supabase
      .from('profiles')
      .select('role, email, name')
      .eq('id', target_user_id)
      .single();

    if (targetProfileError || !targetUserProfile) {
      return new Response(
        JSON.stringify({ error: "Target user not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prevent deactivating system admins
    if (new_status === 'inactive' && ['edufam_admin', 'elimisha_admin'].includes(targetUserProfile.role)) {
      return new Response(
        JSON.stringify({ error: "Cannot deactivate system administrator accounts" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update user status in profiles table
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        status: new_status,
        updated_at: new Date().toISOString()
      })
      .eq('id', target_user_id);

    if (updateError) {
      console.error('Error updating user status:', updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update user status" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Also update auth.users table to prevent login if inactive
    if (new_status === 'inactive') {
      const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
        target_user_id,
        { 
          user_metadata: { 
            status: 'inactive',
            deactivated_at: new Date().toISOString(),
            deactivated_by: user.id
          }
        }
      );

      if (authUpdateError) {
        console.error('Error updating auth user:', authUpdateError);
        // Continue anyway as profile update succeeded
      }
    } else {
      // Reactivate user
      const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
        target_user_id,
        { 
          user_metadata: { 
            status: 'active',
            reactivated_at: new Date().toISOString(),
            reactivated_by: user.id
          }
        }
      );

      if (authUpdateError) {
        console.error('Error updating auth user:', authUpdateError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `User ${targetUserProfile.name} has been ${new_status === 'active' ? 'activated' : 'deactivated'} successfully`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
