
// Supabase Edge Function: generate-timetable
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { school_id, term } = await req.json();

    // Setup Supabase client using service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch required data from Supabase
    const [{ data: classes }, { data: teacher_assignments }, { data: availability }, { data: prefsData }] = await Promise.all([
      supabase.from('classes').select('id, name').eq('school_id', school_id),
      supabase.from('teacher_classes')
        .select(`
          class_id,
          subject_id,
          teacher_id,
          subjects (id, name),
          profiles (id, name)
        `)
        .eq('school_id', school_id),
      supabase.from('teachers_availability').select('*').eq('school_id', school_id),
      supabase.from('school_preferences').select('*').eq('school_id', school_id).maybeSingle(),
    ]);

    if (!classes || !teacher_assignments) {
      throw new Error('Missing core school data (classes or teacher assignments). Please assign teachers to classes and subjects first.');
    }
    
    const prefs = prefsData || {};
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
    const periodsPerDay = prefs.max_periods_per_day || 7;
    const minBreak = prefs.min_break_minutes || 5;
    const startHour = 8, periodMins = 45;

    let timetableRows: any[] = [];

    for (const klass of classes) {
      const assignmentsForClass = teacher_assignments.filter(a => a.class_id === klass.id);
      if (assignmentsForClass.length === 0) continue; // Skip class if no teachers/subjects are assigned

      for (const day of days) {
        for (let p = 0; p < periodsPerDay; p++) {
          // Simple round-robin scheduling for assigned subjects
          const assignment = assignmentsForClass[p % assignmentsForClass.length];
          
          if (!assignment.subjects || !assignment.profiles) {
            console.warn(`Skipping assignment due to missing subject/teacher data for class ${klass.id}`);
            continue;
          }

          // Note: Advanced availability checking is not yet implemented.
          
          const sH = startHour + Math.floor((p * (periodMins + minBreak)) / 60);
          const sM = (p * (periodMins + minBreak)) % 60;
          const eH = startHour + Math.floor((p * (periodMins + minBreak) + periodMins) / 60);
          const eM = (p * (periodMins + minBreak) + periodMins) % 60;
          
          const start_time = `${String(sH).padStart(2,'0')}:${String(sM).padStart(2,'0')}:00`;
          const end_time = `${String(eH).padStart(2,'0')}:${String(eM).padStart(2,'0')}:00`;

          timetableRows.push({
            school_id,
            class_id: klass.id,
            subject_id: assignment.subject_id,
            teacher_id: assignment.teacher_id,
            day_of_week: day,
            start_time,
            end_time,
            created_by_principal_id: req.headers.get('x-user-id'),
            is_published: false,
            term
          });
        }
      }
    }

    // Resolve conflicts to prevent a teacher or class being in two places at once.
    const uniqueTimetableRows = [];
    const classTimeSlots = new Set();
    const teacherTimeSlots = new Set();

    for (const row of timetableRows) {
        const classSlot = `${row.class_id}-${row.day_of_week}-${row.start_time}`;
        const teacherSlot = `${row.teacher_id}-${row.day_of_week}-${row.start_time}`;
        
        if (!classTimeSlots.has(classSlot) && !teacherTimeSlots.has(teacherSlot)) {
            uniqueTimetableRows.push(row);
            classTimeSlots.add(classSlot);
            teacherTimeSlots.add(teacherSlot);
        }
    }

    // Insert into timetables table (delete previous draft first)
    await supabase.from('timetables').delete().eq('school_id', school_id).eq('term', term).eq('is_published', false);
    
    if (uniqueTimetableRows.length > 0) {
        const { error } = await supabase.from('timetables').insert(uniqueTimetableRows);
        if (error) throw error;
    }

    return new Response(JSON.stringify({ success: true, rowsCount: uniqueTimetableRows.length }), { headers: corsHeaders });
  } catch (err) {
    console.error('Timetable generation error:', err);
    return new Response(JSON.stringify({ error: err.message || 'An unknown error occurred' }), { status: 500, headers: corsHeaders });
  }
});
