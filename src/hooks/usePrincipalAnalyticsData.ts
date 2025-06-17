
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
                    .eq('term', term)
                    .not('score', 'is', null);

                // Get attendance for this class
                const { data: attendance } = await supabase
                    .from('attendance')
                    .select('status')
                    .eq('school_id', schoolId)
                    .eq('class_id', cls.id)
                    .eq('term', term);

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
                    .eq('term', term)
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
            .eq('term', term)
            .eq('academic_year', year)
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

        // Fetch teacher activity with error handling
        const { data: teacherGrades, error: teacherError } = await supabase
            .from('grades')
            .select(`
                submitted_by,
                submitted_at,
                profiles!grades_submitted_by_fkey(id, name)
            `)
            .eq('school_id', schoolId)
            .eq('term', term)
            .not('submitted_by', 'is', null);

        if (teacherError) {
            console.warn('Error fetching teacher activity:', teacherError);
        }

        const teacherActivity = Object.entries(
            (teacherGrades || []).reduce((acc: any, grade) => {
                const teacherName = grade.profiles?.name || 'Unknown';
                if (!acc[teacherName]) {
                    acc[teacherName] = { grades: 0, submissions: 0, onTime: 0 };
                }
                acc[teacherName].grades += 1;
                acc[teacherName].submissions += 1;
                acc[teacherName].onTime = 95; // Placeholder
                return acc;
            }, {})
        ).map(([teacher, stats]: [string, any]) => ({
            teacher,
            ...stats
        }));

        // Fetch financial data with error handling
        const { data: feeData, error: feeError } = await supabase
            .from('fees')
            .select('amount, paid_amount, status')
            .eq('school_id', schoolId)
            .eq('term', term);

        if (feeError) {
            console.warn('Error fetching fee data:', feeError);
        }

        const totalFees = feeData?.reduce((sum, fee) => sum + (fee.amount || 0), 0) || 0;
        const totalCollected = feeData?.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0) || 0;
        const totalPending = totalFees - totalCollected;
        const collectionRate = totalFees > 0 ? (totalCollected / totalFees) * 100 : 0;

        // Calculate overall metrics
        const allGrades = classPerformance.reduce((acc, cls) => acc.concat([cls.average]), []);
        const schoolAverage = allGrades.length > 0 
            ? allGrades.reduce((sum, avg) => sum + avg, 0) / allGrades.length 
            : 0;

        const allAttendance = classPerformance.reduce((acc, cls) => acc.concat([cls.attendance]), []);
        const attendanceRate = allAttendance.length > 0 
            ? allAttendance.reduce((sum, rate) => sum + rate, 0) / allAttendance.length 
            : 0;

        const resultsReleased = subjectPerformance.filter(s => s.totalGrades > 0).length;

        return {
            keyMetrics: {
                totalStudents: totalStudents || 0,
                schoolAverage,
                attendanceRate,
                resultsReleased,
                totalRevenue: totalCollected,
                outstandingFees: totalPending,
            },
            classPerformance,
            subjectPerformance: subjectPerformance.filter(s => s.totalGrades > 0),
            studentRankings,
            teacherActivity,
            financialSummary: {
                totalCollected,
                totalPending,
                collectionRate,
            },
        };
    } catch (error) {
        console.error('Error in fetchPrincipalAnalytics:', error);
        // Return empty data structure instead of throwing
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
};

export const usePrincipalAnalyticsData = () => {
    const { schoolId } = useSchoolScopedData();
    const { academicInfo, loading: academicInfoLoading } = useCurrentAcademicInfo(schoolId);

    return useQuery({
        queryKey: ['principalAnalytics', schoolId, academicInfo.term, academicInfo.year],
        queryFn: () => fetchPrincipalAnalytics(schoolId!, academicInfo.term!, academicInfo.year!),
        enabled: !!schoolId && !!academicInfo.term && !!academicInfo.year && !academicInfoLoading,
        staleTime: 5 * 60 * 1000, // 5 minutes cache
        refetchOnWindowFocus: false,
        retry: 1,
        retryDelay: 1000,
    });
};
