import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from './useSchoolScopedData';
import { useCurrentAcademicInfo } from './useCurrentAcademicInfo';

// A simplified query, can be expanded later
const fetchPrincipalAnalytics = async (schoolId: string, term: string, year: string) => {
    
    // In a real scenario, this would call a dedicated DB function for performance.
    // For now, we fetch from the school_analytics summary table.
    const { data, error } = await supabase
        .from('school_analytics')
        .select('*')
        .eq('school_id', schoolId)
        .eq('term', term)
        .eq('year', year)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) throw new Error(error.message);

    // Fetch class performances
    const { data: classData, error: classError } = await supabase
        .from('class_analytics')
        .select('*, classes(name)')
        .eq('school_id', schoolId)
        .eq('term', term)
        .eq('year', year);
    
    if (classError) throw new Error(classError.message);

    const topStudents = data?.top_students;

    return {
        keyMetrics: {
            totalStudents: Array.isArray(topStudents) ? topStudents.length : 0,
            schoolAverage: data?.avg_grade ?? 0,
            attendanceRate: data?.attendance_rate ?? 0,
            resultsReleased: 0, // This needs a proper query
        },
        classPerformance: classData?.map(c => ({
            class: c.classes?.name,
            average: c.avg_grade,
            attendance: c.attendance_rate
        })) || [],
        subjectPerformance: [], // TODO: Fetch real subject performance data
        studentRankings: [], // TODO: Fetch real student rankings data
        teacherActivity: [], // TODO: Fetch real teacher activity data
    };
};

export const usePrincipalAnalyticsData = () => {
    const { schoolId } = useSchoolScopedData();
    const { academicInfo, loading: academicInfoLoading } = useCurrentAcademicInfo(schoolId);

    return useQuery({
        queryKey: ['principalAnalytics', schoolId, academicInfo.term, academicInfo.year],
        queryFn: () => fetchPrincipalAnalytics(schoolId!, academicInfo.term!, academicInfo.year!),
        enabled: !!schoolId && !!academicInfo.term && !!academicInfo.year,
    });
};
