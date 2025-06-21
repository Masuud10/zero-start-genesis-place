
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

    const confirmationData = await req.json()
    
    console.log('MPESA Confirmation received:', JSON.stringify(confirmationData, null, 2))

    const {
      TransID,
      TransAmount,
      MSISDN,
      BillRefNumber,
      InvoiceNumber,
      TransTime,
      FirstName,
      MiddleName,
      LastName,
      ThirdPartyTransID,
      OrgAccountBalance
    } = confirmationData

    // Parse phone number (remove country code if present)
    let phoneNumber = MSISDN
    if (phoneNumber.startsWith('254')) {
      phoneNumber = '0' + phoneNumber.substring(3)
    }

    // Find matching fee or create transaction record
    let feeId = null
    let studentId = null
    let classId = null
    let schoolId = null

    // Try to match with existing fee using bill reference or amount
    if (BillRefNumber) {
      const { data: feeData } = await supabase
        .from('fees')
        .select('id, student_id, class_id, school_id')
        .eq('id', BillRefNumber)
        .single()

      if (feeData) {
        feeId = feeData.id
        studentId = feeData.student_id
        classId = feeData.class_id
        schoolId = feeData.school_id
      }
    }

    // If no fee found, try to match by amount and phone
    if (!feeId) {
      const { data: studentData } = await supabase
        .from('students')
        .select('id, class_id, school_id')
        .or(`phone.eq.${phoneNumber},parent_phone.eq.${phoneNumber}`)
        .limit(1)
        .single()

      if (studentData) {
        studentId = studentData.id
        classId = studentData.class_id
        schoolId = studentData.school_id

        // Find matching fee by amount
        const { data: matchingFee } = await supabase
          .from('fees')
          .select('id')
          .eq('student_id', studentId)
          .eq('amount', parseFloat(TransAmount))
          .eq('status', 'pending')
          .limit(1)
          .single()

        if (matchingFee) {
          feeId = matchingFee.id
        }
      }
    }

    // Create MPESA transaction record
    const transactionData = {
      transaction_id: TransID,
      mpesa_receipt_number: TransID,
      phone_number: phoneNumber,
      amount_paid: parseFloat(TransAmount),
      fee_id: feeId,
      student_id: studentId,
      class_id: classId,
      school_id: schoolId,
      transaction_status: 'Success',
      payment_type: 'Full', // You can adjust this logic
      paybill_number: BillRefNumber,
      transaction_date: new Date().toISOString()
    }

    const { error: transactionError } = await supabase
      .from('mpesa_transactions')
      .insert(transactionData)

    if (transactionError) {
      console.error('Error inserting transaction:', transactionError)
    }

    // Update fee if found
    if (feeId) {
      const { error: feeError } = await supabase.rpc('record_fee_payment', {
        p_student_fee_id: feeId,
        p_amount: parseFloat(TransAmount),
        p_payment_method: 'mpesa',
        p_mpesa_code: TransID
      })

      if (feeError) {
        console.error('Error updating fee:', feeError)
      }
    }

    // Create financial transaction record
    await supabase
      .from('financial_transactions')
      .insert({
        school_id: schoolId,
        student_id: studentId,
        fee_id: feeId,
        amount: parseFloat(TransAmount),
        transaction_type: 'payment',
        payment_method: 'mpesa',
        mpesa_code: TransID,
        description: `MPESA payment from ${FirstName} ${LastName}`,
        academic_year: new Date().getFullYear().toString(),
        term: 'Term 1' // You can adjust this logic
      })

    // Create audit log
    await supabase
      .from('financial_audit_logs')
      .insert({
        user_id: null,
        school_id: schoolId,
        table_name: 'mpesa_confirmation',
        action: 'payment_confirmed',
        metadata: {
          transaction_id: TransID,
          amount: TransAmount,
          phone: phoneNumber,
          fee_id: feeId,
          student_id: studentId
        }
      })

    console.log('MPESA transaction processed successfully')

    return new Response(JSON.stringify({
      ResultCode: "0",
      ResultDesc: "Accepted"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error in MPESA confirmation:', error)
    
    return new Response(JSON.stringify({
      ResultCode: "C2000016",
      ResultDesc: "Internal Server Error"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})
