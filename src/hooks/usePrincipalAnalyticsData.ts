
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from './useSchoolScopedData';
import { useCurrentAcademicInfo } from './useCurrentAcademicInfo';

// Define the return type for the main analytics data
interface PrincipalAnalyticsData {
    keyMetrics: {
        totalStudents: number;
        schoolAverage: number;
        attendanceRate: number;
        resultsReleased: number;
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
        onTime: number;
    }[];
}

const fetchPrincipalAnalytics = async (schoolId: string, term: string, year: string): Promise<PrincipalAnalyticsData> => {
    
    // Fetch from school_analytics summary table
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

    // Fetch subject performance - simplified approach
    const { data: subjectGrades, error: subjectGradesError } = await supabase
        .from('grades')
        .select('score, subject_id')
        .eq('school_id', schoolId)
        .eq('term', term)
        .eq('academic_year', year)
        .not('score', 'is', null);
    
    if (subjectGradesError) throw new Error(`Fetching subject performance: ${subjectGradesError.message}`);

    // Get subject names separately to avoid complex joins
    const { data: subjects, error: subjectsError } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('school_id', schoolId);

    if (subjectsError) throw new Error(`Fetching subjects: ${subjectsError.message}`);

    // Create subject lookup map
    const subjectLookup = subjects?.reduce((acc, subject) => {
        acc[subject.id] = subject.name;
        return acc;
    }, {} as Record<string, string>) || {};

    // Process subject performance
    const subjectPerformanceMap = (subjectGrades || []).reduce((acc, grade) => {
        const subjectName = subjectLookup[grade.subject_id];
        if (!subjectName) return acc;
        
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

    // Fetch student rankings - simplified approach
    const { data: studentRankingsData, error: studentRankingsError } = await supabase
        .from('grade_summary')
        .select('average_score, class_position, student_id, class_id')
        .eq('school_id', schoolId)
        .eq('term', term)
        .eq('academic_year', year)
        .not('average_score', 'is', null)
        .order('average_score', { ascending: false })
        .limit(5);

    if (studentRankingsError) throw new Error(`Fetching student rankings: ${studentRankingsError.message}`);

    // Get student and class data separately
    const studentIds = studentRankingsData?.map(s => s.student_id).filter(Boolean) || [];
    const classIds = studentRankingsData?.map(s => s.class_id).filter(Boolean) || [];

    let studentLookup: Record<string, string> = {};
    let classLookup: Record<string, string> = {};

    if (studentIds.length > 0) {
        const { data: studentsData } = await supabase
            .from('students')
            .select('id, name')
            .in('id', studentIds);
        
        studentLookup = studentsData?.reduce((acc, student) => {
            acc[student.id] = student.name;
            return acc;
        }, {} as Record<string, string>) || {};
    }

    if (classIds.length > 0) {
        const { data: classesData } = await supabase
            .from('classes')
            .select('id, name')
            .in('id', classIds);
        
        classLookup = classesData?.reduce((acc, cls) => {
            acc[cls.id] = cls.name;
            return acc;
        }, {} as Record<string, string>) || {};
    }

    const studentRankings = (studentRankingsData || [])
        .filter(s => studentLookup[s.student_id] && classLookup[s.class_id])
        .map(s => ({
            name: studentLookup[s.student_id],
            class: classLookup[s.class_id],
            average: s.average_score ?? 0,
            position: s.class_position ?? 0,
        }));
    
    // Fetch teacher activity - simplified approach
    const { data: teacherActivityData, error: teacherActivityError } = await supabase
        .from('grades')
        .select('submitted_by')
        .eq('school_id', schoolId)
        .eq('term', term)
        .eq('academic_year', year)
        .not('submitted_by', 'is', null);

    if (teacherActivityError) throw new Error(`Fetching teacher activity: ${teacherActivityError.message}`);

    // Get teacher names separately
    const teacherIds = [...new Set(teacherActivityData?.map(g => g.submitted_by).filter(Boolean))] || [];
    let teacherLookup: Record<string, string> = {};

    if (teacherIds.length > 0) {
        const { data: teachersData } = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', teacherIds);
        
        teacherLookup = teachersData?.reduce((acc, teacher) => {
            acc[teacher.id] = teacher.name;
            return acc;
        }, {} as Record<string, string>) || {};
    }

    const teacherActivityMap = (teacherActivityData || []).reduce((acc, grade) => {
        const teacherName = teacherLookup[grade.submitted_by];
        if (!teacherName) return acc;
        
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
