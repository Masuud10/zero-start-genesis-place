
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
        // Get total students count with proper school isolation
        const { count: totalStudents, error: studentsError } = await supabase
            .from('students')
            .select('id', { count: 'exact', head: true })
            .eq('school_id', schoolId)
            .eq('is_active', true);

        if (studentsError) {
            console.warn('Error fetching students count:', studentsError);
        }

        // Fetch class performance with proper school isolation
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

        // Process class performance with proper error handling
        const classPerformance = await Promise.all((classData || []).map(async (cls) => {
            try {
                // Get grades for this class with proper school isolation
                const { data: grades } = await supabase
                    .from('grades')
                    .select('score, percentage')
                    .eq('school_id', schoolId)
                    .eq('class_id', cls.id)
                    .eq('term', term || 'Term 1')
                    .eq('status', 'released')
                    .not('score', 'is', null);

                // Get attendance for this class with proper school isolation
                const { data: attendance } = await supabase
                    .from('attendance')
                    .select('status')
                    .eq('school_id', schoolId)
                    .eq('class_id', cls.id)
                    .eq('term', term || 'Term 1');

                const totalGrades = grades?.length || 0;
                const averageGrade = totalGrades > 0 
                    ? grades.reduce((sum, g) => sum + (g.percentage || g.score || 0), 0) / totalGrades 
                    : 0;

                const presentCount = attendance?.filter(a => a.status === 'present').length || 0;
                const totalAttendance = attendance?.length || 0;
                const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

                return {
                    class: cls.name,
                    average: Math.round(averageGrade * 100) / 100,
                    attendance: Math.round(attendanceRate * 100) / 100,
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

        // Fetch subject performance with proper school isolation
        const { data: subjects, error: subjectsError } = await supabase
            .from('subjects')
            .select('id, name')
            .eq('school_id', schoolId)
            .eq('is_active', true);

        if (subjectsError) {
            console.warn('Error fetching subjects:', subjectsError);
        }

        const subjectPerformance = await Promise.all((subjects || []).map(async (subject) => {
            try {
                const { data: grades } = await supabase
                    .from('grades')
                    .select('score, percentage')
                    .eq('school_id', schoolId)
                    .eq('subject_id', subject.id)
                    .eq('term', term || 'Term 1')
                    .eq('status', 'released')
                    .not('score', 'is', null);

                const totalGrades = grades?.length || 0;
                const average = totalGrades > 0 
                    ? grades.reduce((sum, g) => sum + (g.percentage || g.score || 0), 0) / totalGrades 
                    : 0;

                return {
                    subject: subject.name,
                    average: Math.round(average * 100) / 100,
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

        // Fetch student rankings with proper school isolation
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
            average: Math.round((ranking.average_score || 0) * 100) / 100,
            position: ranking.class_position || index + 1,
        }));

        // Fetch teacher activity with proper school isolation
        const { data: teacherData, error: teacherError } = await supabase
            .from('profiles')
            .select('id, name')
            .eq('school_id', schoolId)
            .eq('role', 'teacher');

        const teacherActivity = await Promise.all((teacherData || []).map(async (teacher) => {
            try {
                const { count: gradesCount } = await supabase
                    .from('grades')
                    .select('id', { count: 'exact', head: true })
                    .eq('school_id', schoolId)
                    .eq('submitted_by', teacher.id)
                    .eq('term', term || 'Term 1');

                return {
                    teacher: teacher.name || 'Unknown',
                    grades: gradesCount || 0,
                    submissions: gradesCount || 0,
                    onTime: 95 // Placeholder - could be calculated based on submission dates
                };
            } catch (error) {
                return {
                    teacher: teacher.name || 'Unknown',
                    grades: 0,
                    submissions: 0,
                    onTime: 0
                };
            }
        }));

        // Fetch financial data with proper school isolation
        const { data: financialData } = await supabase
            .from('fees')
            .select('amount, paid_amount, status')
            .eq('school_id', schoolId)
            .eq('academic_year', year || new Date().getFullYear().toString());

        const totalExpected = financialData?.reduce((sum, fee) => sum + (fee.amount || 0), 0) || 0;
        const totalCollected = financialData?.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0) || 0;
        const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

        // Calculate school average from all grades
        const { data: allGrades } = await supabase
            .from('grades')
            .select('percentage, score')
            .eq('school_id', schoolId)
            .eq('term', term || 'Term 1')
            .eq('status', 'released')
            .not('score', 'is', null);

        const schoolAverage = allGrades?.length 
            ? allGrades.reduce((sum, g) => sum + (g.percentage || g.score || 0), 0) / allGrades.length 
            : 0;

        // Calculate attendance rate
        const { data: allAttendance } = await supabase
            .from('attendance')
            .select('status')
            .eq('school_id', schoolId)
            .eq('term', term || 'Term 1');

        const attendanceRate = allAttendance?.length
            ? (allAttendance.filter(a => a.status === 'present').length / allAttendance.length) * 100
            : 0;

        return {
            keyMetrics: {
                totalStudents: totalStudents || 0,
                schoolAverage: Math.round(schoolAverage * 100) / 100,
                attendanceRate: Math.round(attendanceRate * 100) / 100,
                resultsReleased: subjectPerformance.filter(s => s.totalGrades > 0).length,
                totalRevenue: Math.round(totalCollected * 100) / 100,
                outstandingFees: Math.round((totalExpected - totalCollected) * 100) / 100,
            },
            classPerformance,
            subjectPerformance,
            studentRankings,
            teacherActivity,
            financialSummary: {
                totalCollected: Math.round(totalCollected * 100) / 100,
                totalPending: Math.round((totalExpected - totalCollected) * 100) / 100,
                collectionRate: Math.round(collectionRate * 100) / 100,
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
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchInterval: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: true,
        retry: 2,
        retryDelay: 1000,
    });
};
