
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from './useSchoolScopedData';
import { useCurrentAcademicInfo } from './useCurrentAcademicInfo';

interface PrincipalAnalyticsData {
    keyMetrics: {
        totalStudents: number;
        schoolAverage: number;
        attendanceRate: number;
        resultsReleased: number;
        totalRevenue: number;
        outstandingFees: number;
    };
    classPerformance: Array<{
        class: string;
        average: number;
        attendance: number;
        studentCount: number;
    }>;
    subjectPerformance: Array<{
        subject: string;
        average: number;
        improvement: number;
        totalGrades: number;
    }>;
    studentRankings: Array<{
        name: string;
        class: string;
        average: number;
        position: number;
    }>;
    teacherActivity: Array<{
        teacher: string;
        grades: number;
        submissions: number;
        onTime: number;
    }>;
    financialSummary: {
        totalCollected: number;
        totalPending: number;
        collectionRate: number;
    };
}

const fetchPrincipalAnalytics = async (schoolId: string, term: string, year: string): Promise<PrincipalAnalyticsData> => {
    console.log('📊 Fetching principal analytics for:', { schoolId, term, year });

    // Early return with empty data if no school ID
    if (!schoolId) {
        console.warn('No school ID provided for analytics');
        return {
            keyMetrics: {
                totalStudents: 0,
                schoolAverage: 0,
                attendanceRate: 0,
                resultsReleased: 0,
                totalRevenue: 0,
                outstandingFees: 0,
            },
            classPerformance: [],
            subjectPerformance: [],
            studentRankings: [],
            teacherActivity: [],
            financialSummary: {
                totalCollected: 0,
                totalPending: 0,
                collectionRate: 0,
            },
        };
    }

    try {
        // Get total students count with error handling
        const { count: totalStudents, error: studentsError } = await supabase
            .from('students')
            .select('id', { count: 'exact', head: true })
            .eq('school_id', schoolId)
            .eq('is_active', true);

        if (studentsError) {
            console.warn('Error fetching students count:', studentsError);
        }

        // Fetch class performance with error handling
        const { data: classData, error: classError } = await supabase
            .from('classes')
            .select(`
                id, 
                name,
                students!inner(id, school_id)
            `)
            .eq('school_id', schoolId);

        if (classError) {
            console.warn('Error fetching class data:', classError);
        }

        const classPerformance = await Promise.all((classData || []).map(async (cls) => {
            try {
                // Get grades for this class
                const { data: grades } = await supabase
                    .from('grades')
                    .select('score')
                    .eq('school_id', schoolId)
                    .eq('class_id', cls.id)
                    .eq('term', term || 'Term 1')
                    .not('score', 'is', null);

                // Get attendance for this class
                const { data: attendance } = await supabase
                    .from('attendance')
                    .select('status')
                    .eq('school_id', schoolId)
                    .eq('class_id', cls.id)
                    .eq('term', term || 'Term 1');

                const totalGrades = grades?.length || 0;
                const averageGrade = totalGrades > 0 
                    ? grades.reduce((sum, g) => sum + (g.score || 0), 0) / totalGrades 
                    : 0;

                const presentCount = attendance?.filter(a => a.status === 'present').length || 0;
                const totalAttendance = attendance?.length || 0;
                const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

                return {
                    class: cls.name,
                    average: averageGrade,
                    attendance: attendanceRate,
                    studentCount: cls.students?.length || 0
                };
            } catch (error) {
                console.warn(`Error processing class ${cls.name}:`, error);
                return {
                    class: cls.name,
                    average: 0,
                    attendance: 0,
                    studentCount: 0
                };
            }
        }));

        // Fetch subject performance with error handling
        const { data: subjects, error: subjectsError } = await supabase
            .from('subjects')
            .select('id, name')
            .eq('school_id', schoolId);

        if (subjectsError) {
            console.warn('Error fetching subjects:', subjectsError);
        }

        const subjectPerformance = await Promise.all((subjects || []).map(async (subject) => {
            try {
                const { data: grades } = await supabase
                    .from('grades')
                    .select('score')
                    .eq('school_id', schoolId)
                    .eq('subject_id', subject.id)
                    .eq('term', term || 'Term 1')
                    .not('score', 'is', null);

                const totalGrades = grades?.length || 0;
                const average = totalGrades > 0 
                    ? grades.reduce((sum, g) => sum + (g.score || 0), 0) / totalGrades 
                    : 0;

                return {
                    subject: subject.name,
                    average,
                    improvement: 0, // Could be calculated with historical data
                    totalGrades
                };
            } catch (error) {
                console.warn(`Error processing subject ${subject.name}:`, error);
                return {
                    subject: subject.name,
                    average: 0,
                    improvement: 0,
                    totalGrades: 0
                };
            }
        }));

        // Fetch student rankings with error handling
        const { data: rankingsData, error: rankingsError } = await supabase
            .from('grade_summary')
            .select(`
                average_score, 
                class_position, 
                students!inner(id, name, class_id),
                classes!inner(id, name)
            `)
            .eq('school_id', schoolId)
            .eq('term', term || 'Term 1')
            .eq('academic_year', year || new Date().getFullYear().toString())
            .not('average_score', 'is', null)
            .order('average_score', { ascending: false })
            .limit(10);

        if (rankingsError) {
            console.warn('Error fetching rankings:', rankingsError);
        }

        const studentRankings = (rankingsData || []).map((ranking, index) => ({
            name: ranking.students?.name || 'Unknown',
            class: ranking.classes?.name || 'Unknown',
            average: ranking.average_score || 0,
            position: ranking.class_position || index + 1,
        }));

        // Fetch teacher activity - simplified as the full query is complex
        const teacherActivity: any[] = [];

        return {
            keyMetrics: {
                totalStudents: totalStudents || 0,
                schoolAverage: 75, // placeholder
                attendanceRate: 85, // placeholder
                resultsReleased: 0,
                totalRevenue: 0,
                outstandingFees: 0,
            },
            classPerformance,
            subjectPerformance,
            studentRankings,
            teacherActivity,
            financialSummary: {
                totalCollected: 0,
                totalPending: 0,
                collectionRate: 0,
            },
        };

    } catch (error) {
        console.error('Error fetching analytics:', error);
        throw error;
    }
};

export const usePrincipalAnalyticsData = () => {
    const { schoolId, isReady } = useSchoolScopedData();
    const { academicInfo, loading } = useCurrentAcademicInfo(schoolId);

    return useQuery({
        queryKey: ['principal-analytics', schoolId, academicInfo.term, academicInfo.year],
        queryFn: () => fetchPrincipalAnalytics(schoolId || '', academicInfo.term, academicInfo.year),
        enabled: isReady && !loading && !!schoolId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 10 * 60 * 1000, // 10 minutes
    });
};
