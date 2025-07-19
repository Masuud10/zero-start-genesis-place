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
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify user authentication and role
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if user is super admin
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get platform-wide KPIs
    const [
      { count: totalSchools },
      { count: activeSchools },
      { count: totalStudents },
      { count: totalUsers },
      { data: financialMetrics },
      { data: recentActivity }
    ] = await Promise.all([
      // Total schools
      supabaseClient.from('schools').select('*', { count: 'exact', head: true }),
      
      // Active schools (with students)
      supabaseClient.from('schools').select('*', { count: 'exact', head: true })
        .in('id', supabaseClient.from('students').select('school_id')),
      
      // Total students
      supabaseClient.from('students').select('*', { count: 'exact', head: true }),
      
      // Total users
      supabaseClient.from('profiles').select('*', { count: 'exact', head: true }),
      
      // Latest financial metrics
      supabaseClient.from('financial_metrics')
        .select('*')
        .order('metric_date', { ascending: false })
        .limit(1),
      
      // Recent activity (last 7 days)
      supabaseClient.from('audit_logs')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10)
    ])

    // Calculate additional metrics
    const mrr = financialMetrics?.[0]?.mrr || 0
    const arr = financialMetrics?.[0]?.arr || 0
    const churnRate = financialMetrics?.[0]?.churn_rate || 0
    const customerCount = financialMetrics?.[0]?.customer_count || 0

    // Calculate growth metrics
    const { data: previousMonthMetrics } = await supabaseClient
      .from('financial_metrics')
      .select('mrr, customer_count')
      .order('metric_date', { ascending: false })
      .limit(2)

    const mrrGrowth = previousMonthMetrics?.[1]?.mrr 
      ? ((mrr - previousMonthMetrics[1].mrr) / previousMonthMetrics[1].mrr) * 100 
      : 0

    const customerGrowth = previousMonthMetrics?.[1]?.customer_count
      ? ((customerCount - previousMonthMetrics[1].customer_count) / previousMonthMetrics[1].customer_count) * 100
      : 0

    const kpis = {
      schools: {
        total: totalSchools || 0,
        active: activeSchools || 0,
        growth: 0 // Placeholder for growth calculation
      },
      users: {
        total: totalUsers || 0,
        students: totalStudents || 0,
        growth: 0 // Placeholder for growth calculation
      },
      revenue: {
        mrr: mrr,
        arr: arr,
        mrrGrowth: mrrGrowth,
        customerCount: customerCount,
        customerGrowth: customerGrowth,
        churnRate: churnRate
      },
      activity: {
        recentLogs: recentActivity || [],
        totalActions: recentActivity?.length || 0
      }
    }

    return new Response(JSON.stringify({ data: kpis }), {
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