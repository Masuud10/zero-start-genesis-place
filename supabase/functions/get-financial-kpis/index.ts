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

    if (profile?.role !== 'finance' && profile?.role !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const url = new URL(req.url)
    const period = url.searchParams.get('period') || 'current_month'

    // Calculate date range based on period
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case 'current_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        break
      case 'current_quarter':
        const quarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), quarter * 3, 1)
        break
      case 'current_year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
    }

    // Get financial metrics
    const { data: financialMetrics, error: metricsError } = await supabaseClient
      .from('financial_metrics')
      .select('*')
      .gte('metric_date', startDate.toISOString().split('T')[0])
      .order('metric_date', { ascending: false })

    // Get company expenses
    const { data: expenses, error: expensesError } = await supabaseClient
      .from('company_expenses')
      .select('*')
      .gte('expense_date', startDate.toISOString().split('T')[0])
      .order('expense_date', { ascending: false })

    // Get budget allocations
    const { data: budgets, error: budgetsError } = await supabaseClient
      .from('budget_allocations')
      .select('*')
      .eq('budget_year', now.getFullYear())

    if (metricsError || expensesError || budgetsError) {
      throw metricsError || expensesError || budgetsError
    }

    // Calculate KPIs
    const latestMetrics = financialMetrics?.[0]
    const totalExpenses = expenses?.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) || 0
    const totalBudget = budgets?.reduce((sum, budget) => sum + parseFloat(budget.budget_amount), 0) || 0
    const budgetUtilization = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0

    // Calculate revenue growth
    const previousMetrics = financialMetrics?.[1]
    const revenueGrowth = previousMetrics?.mrr 
      ? ((latestMetrics?.mrr - previousMetrics.mrr) / previousMetrics.mrr) * 100 
      : 0

    const financialKpis = {
      current: {
        mrr: latestMetrics?.mrr || 0,
        arr: latestMetrics?.arr || 0,
        customerCount: latestMetrics?.customer_count || 0,
        churnRate: latestMetrics?.churn_rate || 0
      },
      expenses: {
        total: totalExpenses,
        byCategory: expenses?.reduce((acc, exp) => {
          acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount)
          return acc
        }, {} as Record<string, number>) || {}
      },
      budget: {
        total: totalBudget,
        utilization: budgetUtilization,
        allocations: budgets || []
      },
      growth: {
        revenue: revenueGrowth,
        customers: previousMetrics?.customer_count 
          ? ((latestMetrics?.customer_count - previousMetrics.customer_count) / previousMetrics.customer_count) * 100 
          : 0
      },
      period: period,
      metrics: financialMetrics || [],
      expenses: expenses || []
    }

    return new Response(JSON.stringify({ data: financialKpis }), {
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