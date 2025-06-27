
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface GenerateTimetableParams {
  school_id: string;
  class_id: string;
  term: string;
  subject_teacher_assignments: SubjectTeacherAssignment[];
  time_slots: TimeSlot[];
}

export const useEnhancedTimetable = () => {
  const { toast } = useToast();

  const generateTimetable = useMutation({
    mutationFn: async (params: GenerateTimetableParams) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch('/api/generate-enhanced-timetable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate timetable');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Timetable generated successfully with ${data.entriesCount} entries.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    generateTimetable,
    isGenerating: generateTimetable.isPending,
    error: generateTimetable.error
  };
};
