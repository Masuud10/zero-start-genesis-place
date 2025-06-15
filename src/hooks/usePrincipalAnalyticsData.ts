
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

    // This is a placeholder for more complex data fetching logic
    // which should be implemented with database functions.
    const MOCK_SUBJECT_DATA = [
        { subject: 'Mathematics', average: 78, improvement: 5 },
        { subject: 'English', average: 85, improvement: 2 },
        { subject: 'Science', average: 82, improvement: -1 },
    ];
    const MOCK_STUDENT_RANKINGS = [
        { name: 'Alice Johnson', class: 'Grade 2A', average: 95, position: 1 },
        { name: 'Bob Smith', class: 'Grade 2B', average: 93, position: 2 },
    ];
    const MOCK_TEACHER_ACTIVITY = [
        { teacher: 'Ms. Johnson', grades: 125, submissions: 98, onTime: 95 },
        { teacher: 'Mr. Smith', grades: 110, submissions: 102, onTime: 88 },
    ];

    return {
        keyMetrics: {
            totalStudents: data?.top_students?.length || 0,
            schoolAverage: data?.avg_grade ?? 0,
            attendanceRate: data?.attendance_rate ?? 0,
            resultsReleased: 0, // This needs a proper query
        },
        classPerformance: classData?.map(c => ({
            class: c.classes?.name,
            average: c.avg_grade,
            attendance: c.attendance_rate
        })) || [],
        subjectPerformance: MOCK_SUBJECT_DATA,
        studentRankings: MOCK_STUDENT_RANKINGS,
        teacherActivity: MOCK_TEACHER_ACTIVITY,
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
