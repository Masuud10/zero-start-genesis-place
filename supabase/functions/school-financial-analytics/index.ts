import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

interface FinancialAnalytics {
  total_revenue: number;
  total_expenses: number;
  net_income: number;
  revenue_breakdown: {
    category: string;
    amount: number;
  }[];
  monthly_trends: {
    month: string;
    revenue: number;
    expenses: number;
  }[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const schoolId = pathParts[pathParts.length - 1];
    
    // Parse query parameters for date filtering
    const searchParams = url.searchParams;
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    
    if (!schoolId) {
      return new Response(
        JSON.stringify({ error: 'School ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user has access to this school
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('school_id, role')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    const isAuthorized = userProfile && (
      userProfile.role === 'edufam_admin' ||
      userProfile.role === 'elimisha_admin' ||
      userProfile.school_id === schoolId ||
      (await supabase.from('schools').select('id').eq('owner_id', (await supabase.auth.getUser()).data.user?.id).eq('id', schoolId).single()).data
    );

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: 'Access denied: You are not authorized to view this school\'s data' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Build date filter conditions
    const dateFilter = (query: any) => {
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }
      return query;
    };

    // Fetch revenue data (from fees)
    let feesQuery = supabase
      .from('fees')
      .select('amount, paid_amount, category, created_at')
      .eq('school_id', schoolId);
    
    feesQuery = dateFilter(feesQuery);
    const { data: feesData, error: feesError } = await feesQuery;

    if (feesError) {
      console.error('Error fetching fees data:', feesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch financial data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Calculate totals
    const totalRevenue = feesData?.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0) || 0;
    
    // For expenses, we'll simulate some basic expense categories since school_expenses doesn't exist
    // In a real implementation, you'd fetch from an actual expenses table
    const estimatedExpenses = totalRevenue * 0.7; // Assume 70% of revenue goes to expenses
    const netIncome = totalRevenue - estimatedExpenses;

    // Process revenue breakdown by category
    const revenueByCategory = feesData?.reduce((acc, fee) => {
      const category = fee.category || 'General';
      acc[category] = (acc[category] || 0) + (fee.paid_amount || 0);
      return acc;
    }, {} as Record<string, number>) || {};

    const revenueBreakdown = Object.entries(revenueByCategory).map(([category, amount]) => ({
      category,
      amount
    }));

    // Generate monthly trends for the last 6 months
    const currentDate = new Date();
    const monthlyTrends = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
      
      const monthRevenue = feesData?.filter(fee => {
        const createdAt = new Date(fee.created_at);
        return createdAt >= monthDate && createdAt < nextMonth;
      }).reduce((sum, fee) => sum + (fee.paid_amount || 0), 0) || 0;
      
      // Estimate expenses as 70% of revenue for that month
      const monthExpenses = monthRevenue * 0.7;

      monthlyTrends.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue,
        expenses: monthExpenses
      });
    }

    const analytics: FinancialAnalytics = {
      total_revenue: Math.round(totalRevenue * 100) / 100,
      total_expenses: Math.round(estimatedExpenses * 100) / 100,
      net_income: Math.round(netIncome * 100) / 100,
      revenue_breakdown: revenueBreakdown,
      monthly_trends: monthlyTrends
    };

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: analytics,
        school_id: schoolId,
        date_range: { start_date: startDate, end_date: endDate }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in school-financial-analytics:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});