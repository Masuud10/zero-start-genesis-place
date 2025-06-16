
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
    };
    classPerformance: Array<{
        class: string;
        average: number;
        attendance: number;
    }>;
    subjectPerformance: Array<{
        subject: string;
        average: number;
        improvement: number;
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
}

const fetchPrincipalAnalytics = async (schoolId: string, term: string, year: string): Promise<PrincipalAnalyticsData> => {
    // Get total students count
    const studentsQuery = await supabase
        .from('students')
        .select('id', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .eq('is_active', true);

    const totalStudents = studentsQuery.count || 0;

    // Fetch school analytics
    const schoolAnalyticsQuery = await supabase
        .from('school_analytics')
        .select('*')
        .eq('school_id', schoolId)
        .eq('term', term)
        .eq('year', year)
        .maybeSingle();

    const schoolAnalyticsData = schoolAnalyticsQuery.data;

    // Fetch class analytics
    const classAnalyticsQuery = await supabase
        .from('class_analytics')
        .select('class_id, avg_grade, attendance_rate')
        .eq('school_id', schoolId)
        .eq('term', term)
        .eq('year', year);
    
    const classAnalyticsData = classAnalyticsQuery.data || [];

    // Get class names
    const classIds = classAnalyticsData.map(c => c.class_id).filter(Boolean);
    let classLookup: Record<string, string> = {};
    
    if (classIds.length > 0) {
        const classesQuery = await supabase
            .from('classes')
            .select('id, name')
            .in('id', classIds);

        if (classesQuery.data) {
            classLookup = classesQuery.data.reduce((acc: Record<string, string>, cls) => {
                acc[cls.id] = cls.name;
                return acc;
            }, {});
        }
    }

    const classPerformance = classAnalyticsData.map(c => ({
        class: classLookup[c.class_id] || 'Unknown Class',
        average: c.avg_grade || 0,
        attendance: c.attendance_rate || 0
    }));

    // Fetch grades for subject performance
    const gradesQuery = await supabase
        .from('grades')
        .select('score, subject_id')
        .eq('school_id', schoolId)
        .eq('term', term)
        .neq('score', null);
    
    const subjectGrades = gradesQuery.data || [];

    // Get subject names
    const subjectsQuery = await supabase
        .from('subjects')
        .select('id, name')
        .eq('school_id', schoolId);

    const subjects = subjectsQuery.data || [];
    const subjectLookup = subjects.reduce((acc: Record<string, string>, subject) => {
        acc[subject.id] = subject.name;
        return acc;
    }, {});

    // Process subject performance
    const subjectMap = subjectGrades.reduce((acc: Record<string, number[]>, grade) => {
        const subjectName = subjectLookup[grade.subject_id];
        if (subjectName && typeof grade.score === 'number') {
            if (!acc[subjectName]) acc[subjectName] = [];
            acc[subjectName].push(grade.score);
        }
        return acc;
    }, {});

    const subjectPerformance = Object.entries(subjectMap).map(([subject, scores]) => ({
        subject,
        average: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
        improvement: 0
    }));

    // Fetch student rankings
    const rankingsQuery = await supabase
        .from('grade_summary')
        .select('average_score, class_position, student_id, class_id')
        .eq('school_id', schoolId)
        .eq('term', term)
        .eq('academic_year', year)
        .neq('average_score', null)
        .order('average_score', { ascending: false })
        .limit(5);
    
    const studentRankingsData = rankingsQuery.data || [];

    // Get student and class data for rankings
    const studentIds = studentRankingsData.map(s => s.student_id).filter(Boolean);
    const rankingClassIds = studentRankingsData.map(s => s.class_id).filter(Boolean);

    let studentLookup: Record<string, string> = {};
    let rankingClassLookup: Record<string, string> = {};

    if (studentIds.length > 0) {
        const studentsDataQuery = await supabase
            .from('students')
            .select('id, name')
            .in('id', studentIds);

        if (studentsDataQuery.data) {
            studentLookup = studentsDataQuery.data.reduce((acc: Record<string, string>, student) => {
                acc[student.id] = student.name;
                return acc;
            }, {});
        }
    }

    if (rankingClassIds.length > 0) {
        const rankingClassesQuery = await supabase
            .from('classes')
            .select('id, name')
            .in('id', rankingClassIds);

        if (rankingClassesQuery.data) {
            rankingClassLookup = rankingClassesQuery.data.reduce((acc: Record<string, string>, cls) => {
                acc[cls.id] = cls.name;
                return acc;
            }, {});
        }
    }

    const studentRankings = studentRankingsData
        .filter(s => s.student_id && s.class_id && studentLookup[s.student_id] && rankingClassLookup[s.class_id])
        .map(s => ({
            name: studentLookup[s.student_id],
            class: rankingClassLookup[s.class_id],
            average: s.average_score || 0,
            position: s.class_position || 0,
        }));

    // Fetch teacher activity
    const teacherActivityQuery = await supabase
        .from('grades')
        .select('submitted_by')
        .eq('school_id', schoolId)
        .eq('term', term)
        .neq('submitted_by', null);
    
    const teacherActivityData = teacherActivityQuery.data || [];

    const teacherIds = [...new Set(teacherActivityData.map(g => g.submitted_by).filter(Boolean))];
    let teacherLookup: Record<string, string> = {};
    
    if (teacherIds.length > 0) {
        const teachersQuery = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', teacherIds);

        if (teachersQuery.data) {
            teacherLookup = teachersQuery.data.reduce((acc: Record<string, string>, teacher) => {
                acc[teacher.id] = teacher.name;
                return acc;
            }, {});
        }
    }

    const teacherMap = teacherActivityData.reduce((acc: Record<string, number>, grade) => {
        const teacherName = teacherLookup[grade.submitted_by];
        if (teacherName) {
            acc[teacherName] = (acc[teacherName] || 0) + 1;
        }
        return acc;
    }, {});

    const teacherActivity = Object.entries(teacherMap).map(([teacher, submissions]) => ({
        teacher,
        grades: submissions,
        submissions,
        onTime: 0,
    }));

    return {
        keyMetrics: {
            totalStudents,
            schoolAverage: schoolAnalyticsData?.avg_grade || 0,
            attendanceRate: schoolAnalyticsData?.attendance_rate || 0,
            resultsReleased: 0,
        },
        classPerformance,
        subjectPerformance,
        studentRankings,
        teacherActivity,
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
