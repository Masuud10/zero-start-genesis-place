
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
}

const fetchTeacherTimetable = async (teacherId: string, schoolId: string): Promise<TimetableEntry[]> => {
    const { data, error } = await supabase
        .from('timetables')
        .select(`
            id,
            day_of_week,
            start_time,
            end_time,
            class:classes(id, name),
            subject:subjects(id, name)
        `)
        .eq('teacher_id', teacherId)
        .eq('school_id', schoolId)
        .order('day_of_week')
        .order('start_time');

    if (error) {
        throw new Error(error.message);
    }
    
    return (data || []).map((item: any) => ({ ...item }));
};

export const useTeacherTimetable = () => {
    const { user } = useAuth();
    const { schoolId } = useSchoolScopedData();
    const teacherId = user?.id;

    return useQuery<TimetableEntry[], Error>({
        queryKey: ['teacherTimetable', teacherId, schoolId],
        queryFn: () => fetchTeacherTimetable(teacherId!, schoolId!),
        enabled: !!teacherId && !!schoolId,
    });
};
