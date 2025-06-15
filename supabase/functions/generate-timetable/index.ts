
// Supabase Edge Function: generate-timetable
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to check if a time slot is within an availability range
const isTimeSlotAvailable = (slotStart: Date, slotEnd: Date, availabilities: { start: Date, end: Date }[]): boolean => {
  if (!availabilities || availabilities.length === 0) return true; // Assume available if no constraints specified
  return availabilities.some(avail => slotStart >= avail.start && slotEnd <= avail.end);
};

// Helper to parse HH:MM:SS into a Date object for today
const parseTime = (timeStr: string): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};


serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { school_id, term } = await req.json();
    const principalId = req.headers.get('x-user-id');

    if (!school_id || !term || !principalId) {
        throw new Error("school_id, term, and a valid user token are required.");
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch all necessary data in parallel
    const [
      { data: classesData, error: classesError },
      { data: assignmentsData, error: assignmentsError },
      { data: availabilityData, error: availabilityError },
      { data: prefsData, error: prefsError },
    ] = await Promise.all([
      supabase.from('classes').select('id, name').eq('school_id', school_id),
      supabase.from('teacher_classes').select(`
        class_id,
        subject_id,
        teacher_id,
        subjects (id, name),
        profiles (id, name)
      `).eq('school_id', school_id),
      supabase.from('teachers_availability').select('*').eq('school_id', school_id),
      supabase.from('school_preferences').select('*').eq('school_id', school_id).maybeSingle(),
    ]);

    if (classesError) throw classesError;
    if (assignmentsError) throw assignmentsError;
    if (availabilityError) throw availabilityError;
    if (prefsError) throw prefsError;

    if (!classesData || !assignmentsData) {
      throw new Error('Missing core school data (classes or teacher assignments). Please assign teachers to classes and subjects first.');
    }
    
    // Process preferences
    const prefs = prefsData || {};
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periodsPerDay = prefs.max_periods_per_day || 8;
    const periodMins = 45; // Hardcoded for now, can be moved to prefs
    const minBreakMins = prefs.min_break_minutes || 10;
    const startHour = 8; // Hardcoded for now
    const periodDurationMs = (periodMins + minBreakMins) * 60 * 1000;
    const lessonDurationMs = periodMins * 60 * 1000;

    // Process teacher availability into a usable map
    const teacherAvailability: Record<string, Record<string, { start: Date, end: Date }[]>> = {};
    if (availabilityData) {
        for (const avail of availabilityData) {
            if (!avail.is_available) continue;
            const day = avail.day_of_week; // Monday, Tuesday, etc.
            if (!teacherAvailability[avail.teacher_id]) {
                teacherAvailability[avail.teacher_id] = {};
            }
            if (!teacherAvailability[avail.teacher_id][day]) {
                teacherAvailability[avail.teacher_id][day] = [];
            }
            teacherAvailability[avail.teacher_id][day].push({
                start: parseTime(avail.start_time),
                end: parseTime(avail.end_time),
            });
        }
    }
    
    const timetableRows: any[] = [];
    const occupiedSlots = new Set<string>(); // "day-startTime-teacher_id" or "day-startTime-class_id"

    for (const klass of classesData) {
      const assignmentsForClass = assignmentsData.filter(a => a.class_id === klass.id);
      if (assignmentsForClass.length === 0) continue;

      let assignmentIndex = 0;

      for (const day of days) {
        for (let p = 0; p < periodsPerDay; p++) {
          const slotStartMs = new Date(new Date().setHours(startHour, 0, 0, 0)).getTime() + (p * periodDurationMs);
          const slotStart = new Date(slotStartMs);
          const slotEnd = new Date(slotStartMs + lessonDurationMs);
          
          const startTimeStr = `${String(slotStart.getHours()).padStart(2, '0')}:${String(slotStart.getMinutes()).padStart(2, '0')}:00`;
          
          // Try to find a suitable assignment for this slot
          let assignmentFound = false;
          for (let i = 0; i < assignmentsForClass.length; i++) {
              const currentAssignmentIndex = (assignmentIndex + i) % assignmentsForClass.length;
              const assignment = assignmentsForClass[currentAssignmentIndex];
              
              if (!assignment.subjects || !assignment.profiles) continue;

              const teacherId = assignment.teacher_id;
              const classId = klass.id;

              const teacherSlotKey = `${day}-${startTimeStr}-${teacherId}`;
              const classSlotKey = `${day}-${startTimeStr}-${classId}`;

              const isTeacherAvailable = isTimeSlotAvailable(slotStart, slotEnd, teacherAvailability[teacherId]?.[day]);

              if (!occupiedSlots.has(teacherSlotKey) && !occupiedSlots.has(classSlotKey) && isTeacherAvailable) {
                  const endTimeStr = `${String(slotEnd.getHours()).padStart(2, '0')}:${String(slotEnd.getMinutes()).padStart(2, '0')}:00`;

                  timetableRows.push({
                      school_id,
                      class_id: classId,
                      subject_id: assignment.subject_id,
                      teacher_id: teacherId,
                      day_of_week: day,
                      start_time: startTimeStr,
                      end_time: endTimeStr,
                      room: null, // Room can be added later via manual editing
                      created_by_principal_id: principalId,
                      is_published: false,
                      term
                  });

                  occupiedSlots.add(teacherSlotKey);
                  occupiedSlots.add(classSlotKey);
                  
                  assignmentIndex = (currentAssignmentIndex + 1) % assignmentsForClass.length;
                  assignmentFound = true;
                  break; // Move to the next period
              }
          }
        }
      }
    }

    // Insert into timetables table (delete previous draft first)
    await supabase.from('timetables').delete().eq('school_id', school_id).eq('term', term).eq('is_published', false);
    
    if (timetableRows.length > 0) {
        const { error } = await supabase.from('timetables').insert(timetableRows);
        if (error) throw error;
    }

    return new Response(JSON.stringify({ success: true, rowsCount: timetableRows.length }), { headers: corsHeaders });
  } catch (err) {
    console.error('Timetable generation error:', err);
    return new Response(JSON.stringify({ error: err.message || 'An unknown error occurred' }), { status: 500, headers: corsHeaders });
  }
});
