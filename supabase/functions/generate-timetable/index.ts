
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
  console.log('🔄 Timetable generation request received');
  
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { school_id, term } = await req.json();
    const authHeader = req.headers.get('authorization');
    
    console.log('📊 Request parameters:', { school_id, term, hasAuth: !!authHeader });

    if (!school_id || !term) {
        console.error('❌ Missing required parameters');
        throw new Error("school_id and term are required.");
    }

    if (!authHeader) {
        console.error('❌ Missing authorization header');
        throw new Error("Authorization header is required.");
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Get the current user from the auth header
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        console.error('❌ Authentication failed:', authError);
        throw new Error('Authentication failed');
    }

    const principalId = user.id;
    console.log('👤 Principal ID:', principalId);

    // Verify user is a principal for this school
    const { data: principalData, error: principalError } = await supabase
        .from('profiles')
        .select('role, school_id')
        .eq('id', principalId)
        .single();

    if (principalError || !principalData) {
        console.error('❌ Principal verification failed:', principalError);
        throw new Error('Principal verification failed');
    }

    if (principalData.role !== 'principal' || principalData.school_id !== school_id) {
        console.error('❌ Access denied: User is not principal of this school');
        throw new Error('Access denied: You must be a principal of this school');
    }

    console.log('✅ Principal verification successful');

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
        subjects!teacher_classes_subject_id_fkey (id, name),
        profiles!teacher_classes_teacher_id_fkey (id, name)
      `).eq('school_id', school_id),
      supabase.from('teachers_availability').select('*').eq('school_id', school_id),
      supabase.from('school_preferences').select('*').eq('school_id', school_id).maybeSingle(),
    ]);

    console.log('📊 Data fetched:', {
      classes: classesData?.length || 0,
      assignments: assignmentsData?.length || 0,
      availability: availabilityData?.length || 0,
      hasPrefs: !!prefsData
    });

    if (classesError) {
        console.error('❌ Classes fetch error:', classesError);
        throw new Error('Failed to fetch classes: ' + classesError.message);
    }
    if (assignmentsError) {
        console.error('❌ Assignments fetch error:', assignmentsError);
        throw new Error('Failed to fetch teacher assignments: ' + assignmentsError.message);
    }
    if (availabilityError) {
        console.error('❌ Availability fetch error:', availabilityError);
        throw new Error('Failed to fetch teacher availability: ' + availabilityError.message);
    }
    if (prefsError) {
        console.error('❌ Preferences fetch error:', prefsError);
        throw new Error('Failed to fetch school preferences: ' + prefsError.message);
    }

    if (!classesData || classesData.length === 0) {
      console.error('❌ No classes found');
      throw new Error('No classes found. Please create classes first.');
    }

    if (!assignmentsData || assignmentsData.length === 0) {
      console.error('❌ No teacher assignments found');
      throw new Error('No teacher assignments found. Please assign teachers to classes and subjects first.');
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

    console.log('⚙️ Timetable settings:', { periodsPerDay, periodMins, minBreakMins, startHour });

    // Process teacher availability into a usable map
    const teacherAvailability: Record<string, Record<string, { start: Date, end: Date }[]>> = {};
    if (availabilityData) {
        for (const avail of availabilityData) {
            if (!avail.is_available) continue;
            const day = avail.day_of_week;
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

    console.log('🏗️ Starting timetable generation...');

    for (const klass of classesData) {
      const assignmentsForClass = assignmentsData.filter(a => a.class_id === klass.id);
      console.log(`📚 Processing class ${klass.name} with ${assignmentsForClass.length} assignments`);
      
      if (assignmentsForClass.length === 0) {
          console.log(`⚠️ No assignments for class ${klass.name}, skipping`);
          continue;
      }

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
              
              if (!assignment.subjects || !assignment.profiles) {
                  console.log(`⚠️ Assignment missing data:`, assignment);
                  continue;
              }

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
                  console.log(`✅ Scheduled: ${klass.name} - ${assignment.subjects.name} - ${day} ${startTimeStr}`);
                  break; // Move to the next period
              }
          }
          
          if (!assignmentFound) {
              console.log(`⚠️ No suitable assignment found for ${klass.name} on ${day} at ${startTimeStr}`);
          }
        }
      }
    }

    console.log(`📋 Generated ${timetableRows.length} timetable entries`);

    // Insert into timetables table (delete previous draft first)
    console.log('🗑️ Clearing previous draft...');
    const { error: deleteError } = await supabase
        .from('timetables')
        .delete()
        .eq('school_id', school_id)
        .eq('term', term)
        .eq('is_published', false);
    
    if (deleteError) {
        console.error('❌ Delete error:', deleteError);
        throw new Error('Failed to clear previous draft: ' + deleteError.message);
    }
    
    if (timetableRows.length > 0) {
        console.log('💾 Inserting new timetable entries...');
        const { error: insertError } = await supabase.from('timetables').insert(timetableRows);
        if (insertError) {
            console.error('❌ Insert error:', insertError);
            throw new Error('Failed to save timetable: ' + insertError.message);
        }
        console.log('✅ Timetable saved successfully');
    } else {
        console.log('⚠️ No timetable entries generated');
    }

    console.log('🎉 Timetable generation completed successfully');
    return new Response(JSON.stringify({ success: true, rowsCount: timetableRows.length }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
    });
  } catch (err: any) {
    console.error('💥 Timetable generation error:', err);
    return new Response(JSON.stringify({ 
        error: err.message || 'An unknown error occurred',
        details: err.stack || 'No stack trace available'
    }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
