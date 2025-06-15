
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { feeStructureId, classId, dueDate } = await req.json()

    if (!feeStructureId || !classId || !dueDate) {
      return new Response(JSON.stringify({ error: 'Missing required fields: feeStructureId, classId, dueDate' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
    
    const authHeader = req.headers.get('Authorization')!
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
        return new Response(JSON.stringify({ error: 'User not authenticated.' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }})
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role, school_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
        return new Response(JSON.stringify({ error: 'Could not fetch user profile.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }})
    }

    const allowedRoles = ['finance_officer', 'principal', 'school_owner', 'edufam_admin'];
    if (!allowedRoles.includes(profile.role)) {
      return new Response(JSON.stringify({ error: 'You are not authorized to perform this action.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: studentClasses, error: studentClassesError } = await supabaseAdmin
      .from('student_classes')
      .select('student_id')
      .eq('class_id', classId)
      .eq('is_active', true);

    if (studentClassesError) throw studentClassesError;
    
    if (!studentClasses || studentClasses.length === 0) {
      return new Response(JSON.stringify({ message: 'No active students found in this class. No fees were generated.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const studentIds = studentClasses.map(sc => sc.student_id);

    const { data: feeStructure, error: feeStructureError } = await supabaseAdmin
      .from('fee_structures')
      .select('school_id, academic_year, term')
      .eq('id', feeStructureId)
      .single();

    if (feeStructureError) throw feeStructureError;

    const { data: feeItems, error: feeItemsError } = await supabaseAdmin
      .from('fee_structure_items')
      .select('name, amount, category')
      .eq('fee_structure_id', feeStructureId);

    if (feeItemsError) throw feeItemsError;

    if (!feeItems || feeItems.length === 0) {
      return new Response(JSON.stringify({ error: 'This fee structure has no items.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const newFees = studentIds.flatMap(studentId => 
      feeItems.map(item => ({
        student_id: studentId,
        school_id: feeStructure.school_id,
        amount: item.amount,
        due_date: dueDate,
        term: feeStructure.term,
        academic_year: feeStructure.academic_year,
        category: item.name,
        status: 'pending',
      }))
    );

    const { error: insertError } = await supabaseAdmin.from('fees').insert(newFees);

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true, message: `Fees generated for ${studentIds.length} students.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
