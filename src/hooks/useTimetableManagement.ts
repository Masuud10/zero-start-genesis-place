import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';

export interface TimetableEntry {
  id?: string;
  school_id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room?: string;
  created_by_principal_id: string;
  is_published: boolean;
  term?: string;
  created_at?: string;
  updated_at?: string;
  subjects?: { id: string; name: string };
  profiles?: { id: string; name: string };
}

export interface GeneratedTimetable {
  id: string;
  class_id: string;
  class_name: string;
  created_at: string;
  is_published: boolean;
  entries: TimetableEntry[];
}

export const useTimetableManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const queryClient = useQueryClient();

  // Fetch all generated timetables for the school
  const { data: generatedTimetables = [], isLoading: isLoadingTimetables, refetch: refetchTimetables } = useQuery({
    queryKey: ['generated-timetables', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];

      const { data, error } = await supabase
        .from('timetables')
        .select(`
          id,
          class_id,
          school_id,
          created_at,
          is_published,
          day_of_week,
          start_time,
          end_time,
          room,
          subject_id,
          teacher_id,
          classes!inner(id, name),
          subjects(id, name),
          profiles!timetables_teacher_id_fkey(id, name)
        `)
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by class
      const groupedByClass = data.reduce((acc: any, item: any) => {
        const classId = item.class_id;
        if (!acc[classId]) {
          acc[classId] = {
            id: classId,
            class_id: classId,
            class_name: item.classes?.name || 'Unknown Class',
            created_at: item.created_at,
            is_published: item.is_published,
            entries: []
          };
        }
        acc[classId].entries.push(item);
        return acc;
      }, {});

      return Object.values(groupedByClass) as GeneratedTimetable[];
    },
    enabled: !!schoolId && !!user
  });

  // Generate timetable mutation
  const generateTimetableMutation = useMutation({
    mutationFn: async (params: {
      class_id: string;
      subjects: Array<{ subject_id: string; teacher_id: string }>;
      time_slots: Array<{ start: string; end: string }>;
      term?: string;
    }) => {
      if (!schoolId || !user?.id) throw new Error('Missing required data');

      // Clear existing timetable for this class
      await supabase
        .from('timetables')
        .delete()
        .eq('school_id', schoolId)
        .eq('class_id', params.class_id);

      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      const timetableEntries: Omit<TimetableEntry, 'id'>[] = [];

      // Generate entries by cycling through subjects and time slots
      let subjectIndex = 0;
      days.forEach(day => {
        params.time_slots.forEach(slot => {
          const subject = params.subjects[subjectIndex % params.subjects.length];
          timetableEntries.push({
            school_id: schoolId,
            class_id: params.class_id,
            subject_id: subject.subject_id,
            teacher_id: subject.teacher_id,
            day_of_week: day,
            start_time: slot.start,
            end_time: slot.end,
            room: `Room ${(subjectIndex % 20) + 1}`,
            created_by_principal_id: user.id,
            is_published: false,
            term: params.term
          });
          subjectIndex++;
        });
      });

      const { data, error } = await supabase
        .from('timetables')
        .insert(timetableEntries)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Timetable generated successfully!",
      });
      refetchTimetables();
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate timetable",
        variant: "destructive"
      });
    }
  });

  // Publish/unpublish timetable mutation
  const togglePublishMutation = useMutation({
    mutationFn: async ({ class_id, is_published }: { class_id: string; is_published: boolean }) => {
      if (!schoolId) throw new Error('School ID required');

      const { error } = await supabase
        .from('timetables')
        .update({ is_published })
        .eq('school_id', schoolId)
        .eq('class_id', class_id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: `Timetable ${variables.is_published ? 'published' : 'unpublished'} successfully!`,
      });
      refetchTimetables();
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update timetable",
        variant: "destructive"
      });
    }
  });

  // Send to teachers mutation
  const sendToTeachersMutation = useMutation({
    mutationFn: async (class_id: string) => {
      if (!schoolId) throw new Error('School ID required');

      // Get all teachers for this timetable
      const { data: timetableData, error: fetchError } = await supabase
        .from('timetables')
        .select('teacher_id')
        .eq('school_id', schoolId)
        .eq('class_id', class_id);

      if (fetchError) throw fetchError;

      const teacherIds = [...new Set(timetableData.map(t => t.teacher_id))];

      // Create notifications for teachers (using announcements table)
      const notifications = teacherIds.map(teacher_id => ({
        school_id: schoolId,
        title: 'New Timetable Available',
        content: `A new timetable has been published for your class. Please check your dashboard.`,
        type: 'timetable',
        target_audience: ['teacher'],
        created_by: user?.id,
        teacher_id: teacher_id
      }));

      const { error: notificationError } = await supabase
        .from('announcements')
        .insert(notifications);

      if (notificationError) throw notificationError;
      
      return teacherIds.length;
    },
    onSuccess: (teacherCount) => {
      toast({
        title: "Sent Successfully",
        description: `Timetable sent to ${teacherCount} teachers`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Send Failed",
        description: error.message || "Failed to send timetable to teachers",
        variant: "destructive"
      });
    }
  });

  // Delete timetable mutation
  const deleteTimetableMutation = useMutation({
    mutationFn: async (class_id: string) => {
      if (!schoolId) throw new Error('School ID required');

      const { error } = await supabase
        .from('timetables')
        .delete()
        .eq('school_id', schoolId)
        .eq('class_id', class_id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Deleted",
        description: "Timetable deleted successfully",
      });
      refetchTimetables();
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete timetable",
        variant: "destructive"
      });
    }
  });

  return {
    generatedTimetables,
    isLoadingTimetables,
    generateTimetable: generateTimetableMutation.mutate,
    isGenerating: generateTimetableMutation.isPending,
    togglePublish: togglePublishMutation.mutate,
    isTogglingPublish: togglePublishMutation.isPending,
    sendToTeachers: sendToTeachersMutation.mutate,
    isSendingToTeachers: sendToTeachersMutation.isPending,
    deleteTimetable: deleteTimetableMutation.mutate,
    isDeletingTimetable: deleteTimetableMutation.isPending,
    refetchTimetables
  };
};