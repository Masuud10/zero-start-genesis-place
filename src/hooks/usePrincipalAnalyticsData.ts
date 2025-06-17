
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

    // Get total students count
    const { count: totalStudents } = await supabase
        .from('students')
        .select('id', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .eq('is_active', true);

    // Fetch class performance with student counts
    const { data: classData } = await supabase
        .from('classes')
        .select(`
            id, 
            name,
            students!inner(id, school_id)
        `)
        .eq('school_id', schoolId);

    const classPerformance = await Promise.all((classData || []).map(async (cls) => {
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
    }));

    // Fetch subject performance
    const { data: subjects } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('school_id', schoolId);

    const subjectPerformance = await Promise.all((subjects || []).map(async (subject) => {
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
    }));

    // Fetch student rankings
    const { data: rankingsData } = await supabase
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

    const studentRankings = (rankingsData || []).map((ranking, index) => ({
        name: ranking.students?.name || 'Unknown',
        class: ranking.classes?.name || 'Unknown',
        average: ranking.average_score || 0,
        position: ranking.class_position || index + 1,
    }));

    // Fetch teacher activity - fix relationship hint for profiles and grades
    const { data: teacherGrades } = await supabase
        .from('grades')
        .select(`
            submitted_by,
            submitted_at,
            profiles!grades_submitted_by_fkey(id, name)
        `)
        .eq('school_id', schoolId)
        .eq('term', term)
        .not('submitted_by', 'is', null);

    const teacherActivity = Object.entries(
        (teacherGrades || []).reduce((acc: any, grade) => {
            const teacherName = grade.profiles?.name || 'Unknown';
            if (!acc[teacherName]) {
                acc[teacherName] = { grades: 0, submissions: 0, onTime: 0 };
            }
            acc[teacherName].grades += 1;
            acc[teacherName].submissions += 1;
            // Could calculate on-time percentage based on due dates
            acc[teacherName].onTime = 95; // Placeholder
            return acc;
        }, {})
    ).map(([teacher, stats]: [string, any]) => ({
        teacher,
        ...stats
    }));

    // Fetch financial data
    const { data: feeData } = await supabase
        .from('fees')
        .select('amount, paid_amount, status')
        .eq('school_id', schoolId)
        .eq('term', term);

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
    });
};
