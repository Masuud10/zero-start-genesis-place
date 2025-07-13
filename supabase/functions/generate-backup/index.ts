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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { tables } = await req.json()
    
    // Get the user from the auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Check if user is EduFam admin
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'edufam_admin') {
      throw new Error('Access denied. Only EduFam admins can generate backups.')
    }

    // Generate backup data
    const backupData: any = {}
    const backupTables = tables || ['schools', 'students', 'classes', 'grades', 'attendance', 'fees', 'profiles']

    for (const table of backupTables) {
      try {
        const { data, error } = await supabaseClient
          .from(table)
          .select('*')

        if (error) {
          console.error(`Error backing up ${table}:`, error)
          continue
        }

        backupData[table] = data
      } catch (err) {
        console.error(`Failed to backup table ${table}:`, err)
      }
    }

    // Add metadata
    backupData._metadata = {
      generated_at: new Date().toISOString(),
      generated_by: user.id,
      version: '1.0',
      tables: Object.keys(backupData).filter(key => key !== '_metadata')
    }

    // Convert to JSON string
    const backupJson = JSON.stringify(backupData, null, 2)
    
    // Create response with backup data
    const blob = new Blob([backupJson], { type: 'application/json' })
    
    return new Response(blob, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="edufam-backup-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })

  } catch (error) {
    console.error('Backup generation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})