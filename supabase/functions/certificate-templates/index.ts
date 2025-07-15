import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get user profile to check role and school
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, school_id')
      .eq('id', user.id)
      .single()

    if (!profile || !['principal', 'edufam_admin', 'elimisha_admin'].includes(profile.role)) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const templateId = pathParts[pathParts.length - 1]

    switch (req.method) {
      case 'GET': {
        // Get all templates for the school
        const { data: templates, error } = await supabase
          .from('certificate_templates')
          .select('*')
          .eq('school_id', profile.school_id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching templates:', error)
          return new Response(JSON.stringify({ error: 'Failed to fetch templates' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ templates }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'POST': {
        // Create new template
        const body = await req.json()
        const {
          template_name,
          template_type,
          title_text,
          body_text,
          signature_1_name,
          signature_2_name,
          layout_config
        } = body

        if (!template_name || !template_type) {
          return new Response(JSON.stringify({ error: 'Template name and type are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { data: template, error } = await supabase
          .from('certificate_templates')
          .insert({
            school_id: profile.school_id,
            template_name,
            template_type,
            title_text: title_text || 'Certificate of Achievement',
            body_text: body_text || 'This certificate is proudly presented to {{student_name}} for {{reason}}.',
            signature_1_name: signature_1_name || "Principal's Name",
            signature_2_name: signature_2_name || "Teacher's Name",
            layout_config: layout_config || {
              font_family: 'serif',
              border_style: 'classic',
              background_color: '#FFFFFF',
              seal_image_url: null
            }
          })
          .select()
          .single()

        if (error) {
          console.error('Error creating template:', error)
          return new Response(JSON.stringify({ error: 'Failed to create template' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ template }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'PATCH': {
        // Update template
        const body = await req.json()
        
        // Verify template belongs to user's school
        const { data: existingTemplate } = await supabase
          .from('certificate_templates')
          .select('school_id')
          .eq('id', templateId)
          .single()

        if (!existingTemplate || existingTemplate.school_id !== profile.school_id) {
          return new Response(JSON.stringify({ error: 'Template not found or access denied' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { data: template, error } = await supabase
          .from('certificate_templates')
          .update(body)
          .eq('id', templateId)
          .select()
          .single()

        if (error) {
          console.error('Error updating template:', error)
          return new Response(JSON.stringify({ error: 'Failed to update template' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ template }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'DELETE': {
        // Delete template
        // Verify template belongs to user's school
        const { data: existingTemplate } = await supabase
          .from('certificate_templates')
          .select('school_id')
          .eq('id', templateId)
          .single()

        if (!existingTemplate || existingTemplate.school_id !== profile.school_id) {
          return new Response(JSON.stringify({ error: 'Template not found or access denied' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { error } = await supabase
          .from('certificate_templates')
          .delete()
          .eq('id', templateId)

        if (error) {
          console.error('Error deleting template:', error)
          return new Response(JSON.stringify({ error: 'Failed to delete template' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})