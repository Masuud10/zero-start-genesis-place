
import { useState } from 'react';
import { useAnalyticsTracking } from './useAnalyticsTracking';
import { supabase } from '@/integrations/supabase/client';

export const useAttendanceTracking = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { trackAttendanceUpdate } = useAnalyticsTracking();

  const submitAttendance = async (attendanceData: any) => {
    setIsSubmitting(true);
    try {
      // Submit attendance to database
      const { data, error } = await supabase
        .from('attendance')
        .insert(attendanceData)
        .select()
        .single();

      if (error) throw error;

      // Track the attendance event
      await trackAttendanceUpdate({
        student_id: attendanceData.student_id,
        class_id: attendanceData.class_id,
        status: attendanceData.status,
        session: attendanceData.session,
        date: attendanceData.date
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
