import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from './useSchoolScopedData';
import { useCurrentAcademicInfo } from './useCurrentAcademicInfo';

// Types for Supabase queries to avoid TS instantiation errors
interface SubjectGrade {
    score: number | null;
    subjects: { name: string } | null;
}

interface StudentRankingData {
    average_score: number | null;
    class_position: number | null;
    students: {
        name: string;
        classes: { name: string } | null;
    } | null;
}

interface TeacherActivityData {
    submitted_by: string | null;
    teacher: { name: string } | null;
}

// Define the return type for the main analytics data
interface PrincipalAnalyticsData {
    keyMetrics: {
        totalStudents: number;
        schoolAverage: number;
        attendanceRate: number;
        resultsReleased: number; // Placeholder
    };
    classPerformance: {
        class: string | undefined;
        average: any;
        attendance: any;
    }[];
    subjectPerformance: {
        subject: string;
        average: number;
        improvement: number;
    }[];
    studentRankings: {
        name: string;
        class: string;
        average: number;
        position: number;
    }[];
    teacherActivity: {
        teacher: string;
        grades: number;
        submissions: number;
        onTime: number; // Placeholder
    }[];
}

// A simplified query, can be expanded later
const fetchPrincipalAnalytics = async (schoolId: string, term: string, year: string): Promise<PrincipalAnalyticsData> => {
    
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

    // Fetch subject performance
    const { data: subjectGrades, error: subjectGradesError } = await supabase
        .from('grades')
        .select('score, subjects!subject_id!inner(name)')
        .eq('school_id', schoolId)
        .eq('term', term)
        .eq('academic_year', year)
        .returns<SubjectGrade[]>();
    
    if (subjectGradesError) throw new Error(`Fetching subject performance: ${subjectGradesError.message}`);

    const subjectPerformanceMap = (subjectGrades || []).reduce((acc, grade) => {
        if (!grade.subjects) return acc;
        const subjectName = grade.subjects.name;
        if (!acc[subjectName]) acc[subjectName] = { scores: [], count: 0 };
        if (typeof grade.score === 'number') {
            acc[subjectName].scores.push(grade.score);
            acc[subjectName].count++;
        }
        return acc;
    }, {} as Record<string, { scores: number[], count: number }>);
    
    const subjectPerformance = Object.entries(subjectPerformanceMap).map(([subject, data]) => ({
        subject,
        average: data.count > 0 ? data.scores.reduce((a, b) => a + b, 0) / data.count : 0,
        improvement: 0 // Placeholder, requires historical data
    }));

    // Fetch student rankings
    const { data: studentRankingsData, error: studentRankingsError } = await supabase
        .from('grade_summary')
        .select('average_score, class_position, students!student_id!inner(name, classes!class_id!inner(name))')
        .eq('school_id', schoolId)
        .eq('term', term)
        .eq('academic_year', year)
        .not('average_score', 'is', null)
        .order('average_score', { ascending: false })
        .limit(5)
        .returns<StudentRankingData[]>();

    if (studentRankingsError) throw new Error(`Fetching student rankings: ${studentRankingsError.message}`);

    const studentRankings = (studentRankingsData || [])
        .filter(s => s.students && s.students.classes)
        .map(s => ({
            name: s.students!.name,
            class: s.students!.classes!.name,
            average: s.average_score ?? 0,
            position: s.class_position ?? 0,
        }));
    
    // Fetch teacher activity
    const { data: teacherActivityData, error: teacherActivityError } = await supabase
        .from('grades')
        .select('submitted_by, teacher:profiles!submitted_by!inner(name)')
        .eq('school_id', schoolId)
        .eq('term', term)
        .eq('academic_year', year)
        .not('submitted_by', 'is', null)
        .returns<TeacherActivityData[]>();

    if (teacherActivityError) throw new Error(`Fetching teacher activity: ${teacherActivityError.message}`);

    const teacherActivityMap = (teacherActivityData || []).reduce((acc, grade) => {
        if (!grade.teacher) return acc;
        const teacherName = grade.teacher.name;
        if (!acc[teacherName]) acc[teacherName] = { submissions: 0 };
        acc[teacherName].submissions++;
        return acc;
    }, {} as Record<string, { submissions: number }>);

    const teacherActivity = Object.entries(teacherActivityMap).map(([teacher, data]) => ({
        teacher,
        grades: data.submissions,
        submissions: data.submissions,
        onTime: 0, // Placeholder
    }));

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
        subjectPerformance: subjectPerformance,
        studentRankings: studentRankings,
        teacherActivity: teacherActivity,
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
