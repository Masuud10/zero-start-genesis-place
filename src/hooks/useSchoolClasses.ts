
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Class } from '@/types/academics';

const fetchSchoolClasses = async (schoolId: string): Promise<Class[]> => {
    const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('school_id', schoolId);
    if (error) throw new Error(error.message);
    return data as Class[];
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
