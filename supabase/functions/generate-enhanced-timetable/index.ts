
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubjectTeacherAssignment {
  subject_id: string;
  subject_name: string;
  teacher_id: string;
  teacher_name: string;
}

interface TimeSlot {
  start: string;
  end: string;
}

interface TimetableEntry {
  subject_id: string;
  teacher_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room?: string;
}

serve(async (req) => {
  console.log('🔄 Enhanced timetable generation request received');
  
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { 
      school_id, 
      class_id, 
      term, 
      subject_teacher_assignments, 
      time_slots 
    } = await req.json();
    
    const authHeader = req.headers.get('authorization');
    
    console.log('📊 Request parameters:', { 
      school_id, 
      class_id, 
      term, 
      assignmentsCount: subject_teacher_assignments?.length || 0,
      timeSlotsCount: time_slots?.length || 0,
      hasAuth: !!authHeader 
    });

    if (!school_id || !class_id || !term || !subject_teacher_assignments || !time_slots) {
      console.error('❌ Missing required parameters');
      throw new Error("Missing required parameters for timetable generation.");
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

    // Verify class belongs to the school
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('id, name')
      .eq('id', class_id)
      .eq('school_id', school_id)
      .single();

    if (classError || !classData) {
      console.error('❌ Class verification failed:', classError);
      throw new Error('Class not found or does not belong to this school');
    }

    console.log('✅ Class verification successful:', classData.name);

    // Generate timetable entries using intelligent algorithm
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timetableEntries: TimetableEntry[] = [];
    const occupiedSlots = new Set<string>(); // "day-time-teacher" or "day-time-class"

    // Distribute subjects across the week
    const assignments = subject_teacher_assignments as SubjectTeacherAssignment[];
    const availableTimeSlots = time_slots as TimeSlot[];
    
    let assignmentIndex = 0;
    let roomCounter = 1;

    for (const day of days) {
      for (const timeSlot of availableTimeSlots) {
        // Skip if we've assigned all subjects for this cycle
        if (assignmentIndex >= assignments.length) {
          assignmentIndex = 0; // Reset to distribute subjects evenly
        }

        const assignment = assignments[assignmentIndex];
        const slotKey = `${day}-${timeSlot.start}-${assignment.teacher_id}`;
        const classSlotKey = `${day}-${timeSlot.start}-${class_id}`;

        // Check if teacher or class is already occupied at this time
        if (!occupiedSlots.has(slotKey) && !occupiedSlots.has(classSlotKey)) {
          timetableEntries.push({
            subject_id: assignment.subject_id,
            teacher_id: assignment.teacher_id,
            day_of_week: day,
            start_time: timeSlot.start,
            end_time: timeSlot.end,
            room: `Room ${roomCounter}`
          });

          occupiedSlots.add(slotKey);
          occupiedSlots.add(classSlotKey);
          
          assignmentIndex++;
          roomCounter = (roomCounter % 20) + 1; // Cycle through 20 rooms
        }
      }
    }

    console.log(`📋 Generated ${timetableEntries.length} timetable entries`);

    // Clear existing timetable for this class and term
    console.log('🗑️ Clearing existing timetable...');
    const { error: deleteError } = await supabase
      .from('timetables')
      .delete()
      .eq('school_id', school_id)
      .eq('class_id', class_id)
      .eq('term', term);
    
    if (deleteError) {
      console.error('❌ Delete error:', deleteError);
      throw new Error('Failed to clear existing timetable: ' + deleteError.message);
    }
    
    // Insert new timetable entries
    if (timetableEntries.length > 0) {
      console.log('💾 Inserting new timetable entries...');
      
      const timetableData = timetableEntries.map(entry => ({
        school_id,
        class_id,
        subject_id: entry.subject_id,
        teacher_id: entry.teacher_id,
        day_of_week: entry.day_of_week,
        start_time: entry.start_time,
        end_time: entry.end_time,
        room: entry.room,
        created_by_principal_id: principalId,
        is_published: false, // Draft mode initially
        term
      }));

      const { error: insertError } = await supabase
        .from('timetables')
        .insert(timetableData);
        
      if (insertError) {
        console.error('❌ Insert error:', insertError);
        throw new Error('Failed to save timetable: ' + insertError.message);
      }
      
      console.log('✅ Timetable saved successfully');
    } else {
      console.log('⚠️ No timetable entries generated');
    }

    console.log('🎉 Enhanced timetable generation completed successfully');
    return new Response(JSON.stringify({ 
      success: true, 
      entriesCount: timetableEntries.length,
      message: 'Timetable generated successfully'
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
    
  } catch (err: any) {
    console.error('💥 Enhanced timetable generation error:', err);
    return new Response(JSON.stringify({ 
      error: err.message || 'An unknown error occurred',
      details: err.stack || 'No stack trace available'
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
