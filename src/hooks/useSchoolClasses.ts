
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Class } from '@/types/academic';

const fetchSchoolClasses = async (schoolId: string): Promise<Class[]> => {
    const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('school_id', schoolId);
    if (error) throw new Error(error.message);
    
    if (!data) {
        return [];
    }
    
    // Manually map to fix snake_case to camelCase mismatch and handle optional properties
    const classes: Class[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        schoolId: item.school_id, // Map from snake_case
        created_at: item.created_at,
        teacherId: item.teacher_id, // Map from snake_case
        // `students` and `subjects` are optional and not fetched here
    }));

    return classes;
};

export const useSchoolClasses = () => {
    const { user } = useAuth();
    const schoolId = user?.school_id;

    const { data: classes = [], isLoading, error, refetch: retry } = useQuery<Class[], Error>({
        queryKey: ['schoolClasses', schoolId],
        queryFn: () => fetchSchoolClasses(schoolId!),
        enabled: !!schoolId,
    });

    return { classes, isLoading, error: error?.message || null, retry };
};
