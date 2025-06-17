
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from './useSchoolScopedData';

export interface TimetableEntry {
    id: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    class: { id: string; name: string };
    subject: { id: string; name: string };
    room?: string;
    term: string;
}

const fetchTeacherTimetable = async (teacherId: string, schoolId: string): Promise<TimetableEntry[]> => {
    console.log('📅 Fetching teacher timetable for:', { teacherId, schoolId });
    
    const { data, error } = await supabase
        .from('timetables')
        .select(`
            id,
            day_of_week,
            start_time,
            end_time,
            room,
            term,
            classes!timetables_class_id_fkey(id, name),
            subjects!timetables_subject_id_fkey(id, name)
        `)
        .eq('teacher_id', teacherId)
        .eq('school_id', schoolId)
        .eq('is_published', true)
        .order('day_of_week')
        .order('start_time');

    if (error) {
        console.error('📅 Teacher timetable fetch error:', error);
        throw new Error(error.message);
    }
    
    console.log('📅 Teacher timetable data:', data);
    
    return (data || []).map((item: any) => ({
        id: item.id,
        day_of_week: item.day_of_week,
        start_time: item.start_time,
        end_time: item.end_time,
        room: item.room,
        term: item.term,
        class: item.classes || { id: '', name: 'Unknown Class' },
        subject: item.subjects || { id: '', name: 'Unknown Subject' },
    }));
};

export const useTeacherTimetable = () => {
    const { user } = useAuth();
    const { schoolId } = useSchoolScopedData();
    const teacherId = user?.id;

    return useQuery<TimetableEntry[], Error>({
        queryKey: ['teacherTimetable', teacherId, schoolId],
        queryFn: () => fetchTeacherTimetable(teacherId!, schoolId!),
        enabled: !!teacherId && !!schoolId,
        staleTime: 5 * 60 * 1000, // 5 minutes cache
        refetchOnWindowFocus: false,
    });
};
