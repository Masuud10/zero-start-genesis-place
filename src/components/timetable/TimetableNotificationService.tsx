
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const TimetableNotificationService = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Listen for timetable updates for teachers
  useEffect(() => {
    if (!user || user.role !== 'teacher') return;

    const channel = supabase
      .channel('timetable-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'timetables',
          filter: `teacher_id=eq.${user.id}`
        },
        (payload) => {
          toast({
            title: "New Timetable Available",
            description: "Your timetable has been updated. Check your dashboard for the latest schedule.",
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'timetables',
          filter: `teacher_id=eq.${user.id}`
        },
        (payload) => {
          toast({
            title: "Timetable Updated",
            description: "Your timetable has been modified. Please review the changes.",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  return null;
};

export default TimetableNotificationService;
