
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const callbackData = await req.json()
    
    console.log('MPESA Callback received:', JSON.stringify(callbackData, null, 2))

    const stkCallback = callbackData.Body?.stkCallback
    
    if (!stkCallback) {
      console.error('Invalid callback structure')
      return new Response('OK', { status: 200 })
    }

    const resultCode = stkCallback.ResultCode
    const resultDesc = stkCallback.ResultDesc
    const checkoutRequestID = stkCallback.CheckoutRequestID

    let mpesaReceiptNumber = ''
    let transactionDate = ''
    let phoneNumber = ''
    let amount = 0

    // Extract callback metadata if payment was successful
    if (resultCode === 0 && stkCallback.CallbackMetadata?.Item) {
      const items = stkCallback.Callback_Metadata?.Item || []
      
      for (const item of items) {
        switch (item.Name) {
          case 'MpesaReceiptNumber':
            mpesaReceiptNumber = item.Value
            break
          case 'TransactionDate':
            transactionDate = item.Value
            break
          case 'PhoneNumber':
            phoneNumber = item.Value
            break
          case 'Amount':
            amount = parseFloat(item.Value)
            break
        }
      }
    }

    // Find the transaction by phone number and amount (since we don't store CheckoutRequestID)
    const { data: transactions, error: fetchError } = await supabase
      .from('mpesa_transactions')
      .select('*')
      .eq('transaction_status', 'Pending')
      .eq('amount_paid', amount)
      .limit(1)

    if (fetchError) {
      console.error('Error fetching transaction:', fetchError)
      return new Response('OK', { status: 200 })
    }

    if (!transactions || transactions.length === 0) {
      console.error('No matching pending transaction found')
      return new Response('OK', { status: 200 })
    }

    const transaction = transactions[0]
    const status = resultCode === 0 ? 'Success' : 'Failed'

    console.log(`Updating transaction ${transaction.transaction_id} to ${status}`)

    // Update transaction status
    const { error: updateError } = await supabase.rpc('update_mpesa_transaction', {
      p_transaction_id: transaction.transaction_id,
      p_mpesa_receipt_number: mpesaReceiptNumber,
      p_status: status
    })

    if (updateError) {
      console.error('Error updating transaction:', updateError)
    } else {
      console.log('Transaction updated successfully')
    }

    return new Response('OK', { 
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      status: 200 
    })

  } catch (error) {
    console.error('Error in MPESA callback:', error)
    
    return new Response('OK', { 
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      status: 200 
    })
  }
})
