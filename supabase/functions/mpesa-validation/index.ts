
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

    const validationData = await req.json()
    
    console.log('MPESA Validation received:', JSON.stringify(validationData, null, 2))

    // Extract validation data
    const {
      TransID,
      TransAmount,
      MSISDN,
      BillRefNumber,
      InvoiceNumber,
      TransTime,
      FirstName,
      MiddleName,
      LastName
    } = validationData

    // Log validation attempt
    await supabase
      .from('financial_audit_logs')
      .insert({
        user_id: null,
        school_id: null,
        table_name: 'mpesa_validation',
        action: 'validation_request',
        metadata: {
          transaction_id: TransID,
          amount: TransAmount,
          phone: MSISDN,
          bill_ref: BillRefNumber,
          invoice: InvoiceNumber,
          time: TransTime
        }
      })

    // Validate transaction
    let validationResult = {
      ResultCode: "0",
      ResultDesc: "Accepted"
    }

    // Check if transaction amount is valid (basic validation)
    if (!TransAmount || parseFloat(TransAmount) <= 0) {
      validationResult = {
        ResultCode: "C2000003",
        ResultDesc: "Invalid Amount"
      }
    }

    // Check if phone number is valid
    if (!MSISDN || MSISDN.length < 10) {
      validationResult = {
        ResultCode: "C2000004",
        ResultDesc: "Invalid Phone Number"
      }
    }

    console.log('Validation result:', validationResult)

    return new Response(JSON.stringify(validationResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error in MPESA validation:', error)
    
    return new Response(JSON.stringify({
      ResultCode: "C2000016",
      ResultDesc: "Internal Server Error"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})
