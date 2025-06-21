
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StkPushRequest {
  phone_number: string;
  amount: number;
  student_fee_id: string;
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

    const { phone_number, amount, student_fee_id }: StkPushRequest = await req.json()

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Authentication failed')
    }

    // Get user's school ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.school_id) {
      throw new Error('School not found for user')
    }

    // Get MPESA credentials for the school
    const { data: credentials, error: credError } = await supabase
      .from('mpesa_api_credentials')
      .select('*')
      .eq('school_id', profile.school_id)
      .single()

    if (credError || !credentials) {
      throw new Error('MPESA credentials not configured for your school')
    }

    // Get student fee details
    const { data: studentFee, error: feeError } = await supabase
      .from('student_fees')
      .select(`
        *,
        student:students(name, admission_number),
        class:classes(name)
      `)
      .eq('id', student_fee_id)
      .single()

    if (feeError || !studentFee) {
      throw new Error('Student fee not found')
    }

    // Generate access token for MPESA API
    const auth = btoa(`${credentials.consumer_key}:${credentials.consumer_secret}`)
    
    const tokenResponse = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`
      }
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to get MPESA access token')
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Format phone number (remove + and ensure it starts with 254)
    let formattedPhone = phone_number.replace(/\D/g, '')
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1)
    } else if (formattedPhone.startsWith('+254')) {
      formattedPhone = formattedPhone.substring(1)
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone
    }

    // Generate timestamp
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
    
    // Generate password
    const password = btoa(credentials.paybill_number + credentials.passkey + timestamp)

    // Initiate STK Push with database transaction
    const { data: transactionData, error: transactionError } = await supabase.rpc('initiate_mpesa_payment', {
      p_phone_number: formattedPhone,
      p_amount: amount,
      p_student_fee_id: student_fee_id
    })

    if (transactionError || transactionData.error) {
      throw new Error(transactionData.error || 'Failed to create transaction record')
    }

    const transactionId = transactionData.transaction_id

    // Prepare STK Push request
    const stkPushPayload = {
      BusinessShortCode: credentials.paybill_number,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.floor(amount),
      PartyA: formattedPhone,
      PartyB: credentials.paybill_number,
      PhoneNumber: formattedPhone,
      CallBackURL: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mpesa-callback`,
      AccountReference: `FEE-${studentFee.student?.admission_number || transactionId}`,
      TransactionDesc: `Fee payment for ${studentFee.student?.name || 'Student'}`
    }

    console.log('Initiating STK Push:', {
      transactionId,
      phone: formattedPhone,
      amount,
      paybill: credentials.paybill_number
    })

    const stkResponse = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stkPushPayload)
    })

    const stkData = await stkResponse.json()
    
    if (stkData.ResponseCode !== "0") {
      // Update transaction as failed
      await supabase.rpc('update_mpesa_transaction', {
        p_transaction_id: transactionId,
        p_mpesa_receipt_number: '',
        p_status: 'Failed'
      })
      
      throw new Error(stkData.ResponseDescription || 'STK Push failed')
    }

    console.log('STK Push successful:', stkData)

    return new Response(
      JSON.stringify({
        success: true,
        transaction_id: transactionId,
        checkout_request_id: stkData.CheckoutRequestID,
        message: 'STK push sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in STK Push:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
