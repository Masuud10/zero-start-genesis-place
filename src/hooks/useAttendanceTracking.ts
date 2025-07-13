
import { useState } from 'react';
import { useAnalyticsTracking } from './useAnalyticsTracking';
import { supabase } from '@/integrations/supabase/client';

export const useAttendanceTracking = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { trackAttendanceUpdate } = useAnalyticsTracking();

  const submitAttendance = async (attendanceData: any) => {
    setIsSubmitting(true);
    try {
      if (!attendanceData.class_id) {
        throw new Error("class_id is required to submit attendance");
      }

      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('school_id')
        .eq('id', attendanceData.class_id)
        .single();

      if (classError) throw classError;
      if (!classData?.school_id) throw new Error("Could not find school for the class");
      
      const completeAttendanceData = {
        ...attendanceData,
        school_id: classData.school_id,
      };

      // Use upsert with proper conflict resolution
      const { data, error } = await supabase
        .from('attendance')
        .upsert(completeAttendanceData, {
          onConflict: 'school_id,class_id,student_id,date,session',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('Attendance upsert error:', error);
        throw new Error(error.message || 'Failed to save attendance');
      }

      // Track the attendance event
      await trackAttendanceUpdate({
        student_id: attendanceData.student_id,
        class_id: attendanceData.class_id,
        status: attendanceData.status,
        session: attendanceData.session
      });

      return { success: true, data };
    } catch (error) {
      console.error('Attendance submission failed:', error);
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitAttendance,
    isSubmitting
  };
};
