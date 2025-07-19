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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'software_engineer' && profile?.role !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const url = new URL(req.url)
    const hours = parseInt(url.searchParams.get('hours') || '24')

    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

    // Get system health metrics
    const { data: healthMetrics, error: healthError } = await supabaseClient
      .from('system_health_metrics')
      .select('*')
      .gte('recorded_at', cutoffTime)
      .order('recorded_at', { ascending: false })

    // Get error logs
    const { data: errorLogs, error: errorError } = await supabaseClient
      .from('error_logs')
      .select('*')
      .gte('created_at', cutoffTime)
      .order('created_at', { ascending: false })
      .limit(50)

    // Get slow queries
    const { data: slowQueries, error: queryError } = await supabaseClient
      .from('query_performance')
      .select('*')
      .gte('executed_at', cutoffTime)
      .order('execution_time_ms', { ascending: false })
      .limit(10)

    if (healthError || errorError || queryError) {
      throw healthError || errorError || queryError
    }

    // Calculate system status
    const recentErrors = errorLogs?.filter(log => log.severity === 'high' || log.severity === 'critical') || []
    const systemStatus = recentErrors.length > 5 ? 'critical' : recentErrors.length > 2 ? 'warning' : 'healthy'

    const systemHealth = {
      status: systemStatus,
      metrics: healthMetrics || [],
      errors: errorLogs || [],
      slowQueries: slowQueries || [],
      summary: {
        totalErrors: errorLogs?.length || 0,
        criticalErrors: recentErrors.length,
        avgResponseTime: healthMetrics?.filter(m => m.metric_type === 'api_response_time')?.reduce((acc, m) => acc + parseFloat(m.metric_value), 0) / (healthMetrics?.filter(m => m.metric_type === 'api_response_time')?.length || 1) || 0
      }
    }

    return new Response(JSON.stringify({ data: systemHealth }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}) 