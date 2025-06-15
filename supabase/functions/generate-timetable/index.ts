
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
    const { school_id, term, preferences } = await req.json();

    // Setup Supabase client using service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch required data from Supabase (classes, teachers, subjects, preferences, etc.)
    const [{ data: classes }, { data: subjects }, { data: teachers }, { data: availability }, { data: subPriorities }, { data: prefs }] = await Promise.all([
      supabase.from('classes').select('id, name').eq('school_id', school_id),
      supabase.from('subjects').select('id, name').eq('school_id', school_id),
      supabase.from('profiles').select('id, name').eq('school_id', school_id).eq('role', 'teacher'),
      supabase.from('teachers_availability').select('*').eq('school_id', school_id),
      supabase.from('subjects_priority').select('*').eq('school_id', school_id),
      supabase.from('school_preferences').select('*').eq('school_id', school_id),
    ]);
    if (!classes || !teachers || !subjects) throw new Error('Missing core school data');

    // [VERY BASIC HEURISTIC LOGIC: actual sophisticated AI can later replace this!]
    // Distribute subjects into days/times by round-robin and weighted by priority (core first), avoiding overlaps.
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
    const periodsPerDay = prefs?.[0]?.max_periods_per_day || preferences?.max_periods_per_day || 7;
    const minBreak = prefs?.[0]?.min_break_minutes || preferences?.min_break_minutes || 5;

    // 8am - periodsPerDay * 45min, insert break after 2
    const startHour = 8, periodMins = 45;
    let timetableRows: any[] = [];
    for (const klass of classes) {
      let periodIdx = 0;
      for (const day of days) {
        periodIdx = 0;
        for (let p = 0; p < periodsPerDay; p++) {
          // Simple scheduling: assign a subject => teacher (just round robin pseudo random), skip if off/blocked
          const subj = subjects[(p + klass.id.length) % subjects.length]; // rough distribution per class, deterministic
          const teacher = teachers[(p + klass.id.length) % teachers.length];
          // Find available slot for teacher
          const av = availability.find(a => a.teacher_id === teacher.id && a.day_of_week === day && a.is_available);
          if (!av) continue; // skip if teacher not available
          // Default times
          const sH = startHour + Math.floor((p * periodMins + minBreak * p) / 60);
          const sM = (p * periodMins + minBreak * p) % 60;
          const eH = startHour + Math.floor(((p+1) * periodMins + minBreak * (p+1)) / 60);
          const eM = ((p+1) * periodMins + minBreak * (p+1)) % 60;
          const start_time = `${String(sH).padStart(2,'0')}:${String(sM).padStart(2,'0')}:00`;
          const end_time = `${String(eH).padStart(2,'0')}:${String(eM).padStart(2,'0')}:00`;

          timetableRows.push({
            school_id,
            class_id: klass.id,
            subject_id: subj.id,
            teacher_id: teacher.id,
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

    // Remove overlapping / duplicates based on simple keys (subject/teacher/time overlap)
    timetableRows = timetableRows.filter(
      (row, idx, arr) =>
        arr.findIndex(r =>
          r.class_id === row.class_id &&
          r.day_of_week === row.day_of_week &&
          r.start_time === row.start_time
        ) === idx
    );
    // TODO: embrace more sophisticated conflict checking for teachers/rooms

    // Insert into timetables table (delete previous draft first)
    await supabase.from('timetables').delete().eq('school_id', school_id).eq('term', term).eq('is_published', false);
    const { error } = await supabase.from('timetables').insert(timetableRows);
    if (error) throw error;

    return new Response(JSON.stringify({ success: true, rowsCount: timetableRows.length }), { headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 400, headers: corsHeaders });
  }
});
