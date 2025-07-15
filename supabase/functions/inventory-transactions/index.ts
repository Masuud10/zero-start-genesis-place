import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface CreateTransactionRequest {
  item_id: number
  quantity_change: number
  transaction_type: 'stock_in' | 'stock_out'
  supplier_id?: number
  notes?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const authHeader = req.headers.get('Authorization')

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's profile to get school_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('school_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (profile.role !== 'finance_officer' && profile.role !== 'principal' && profile.role !== 'school_owner') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const requestBody: CreateTransactionRequest = await req.json()
    let { item_id, quantity_change, transaction_type, supplier_id, notes } = requestBody

    if (!item_id || !quantity_change || !transaction_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: item_id, quantity_change, transaction_type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!['stock_in', 'stock_out'].includes(transaction_type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid transaction_type. Must be "stock_in" or "stock_out"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (quantity_change <= 0) {
      return new Response(
        JSON.stringify({ error: 'quantity_change must be a positive number' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the inventory item and verify it belongs to the user's school
    const { data: inventoryItem, error: itemError } = await supabase
      .from('inventory_items')
      .select('id, name, current_quantity, school_id')
      .eq('id', item_id)
      .eq('school_id', profile.school_id)
      .single()

    if (itemError || !inventoryItem) {
      return new Response(
        JSON.stringify({ error: 'Inventory item not found or does not belong to your school' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For stock_out transactions, ensure sufficient quantity
    if (transaction_type === 'stock_out') {
      if (inventoryItem.current_quantity < quantity_change) {
        return new Response(
          JSON.stringify({ 
            error: 'Insufficient stock',
            available: inventoryItem.current_quantity,
            requested: quantity_change
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      // For stock_out, store quantity as negative
      quantity_change = -quantity_change
    }

    // Execute database transaction to ensure data integrity
    const { data: transactionResult, error: transactionError } = await supabase.rpc(
      'handle_inventory_transaction',
      {
        p_item_id: item_id,
        p_quantity_change: quantity_change,
        p_transaction_type: transaction_type,
        p_user_id: user.id,
        p_supplier_id: supplier_id || null,
        p_notes: notes || null
      }
    )

    if (transactionError) {
      console.error('Database transaction error:', transactionError)
      
      // Check if it's an insufficient stock error
      if (transactionError.message?.includes('Insufficient stock')) {
        return new Response(
          JSON.stringify({ error: transactionError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ error: 'Transaction failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the created transaction with item details
    const { data: transaction, error: selectError } = await supabase
      .from('stock_transactions')
      .select(`
        *,
        inventory_items:item_id (
          id,
          name,
          sku,
          current_quantity
        )
      `)
      .eq('id', transactionResult.transaction_id)
      .single()

    if (selectError) {
      console.error('Error fetching created transaction:', selectError)
      return new Response(
        JSON.stringify({ error: 'Transaction created but could not fetch details' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        transaction,
        message: `Stock ${transaction_type === 'stock_in' ? 'in' : 'out'} recorded successfully`
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})