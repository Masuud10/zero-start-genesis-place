
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
    // Fetch basic school analytics
    const { data: schoolAnalyticsData } = await supabase
        .from('school_analytics')
        .select('*')
        .eq('school_id', schoolId)
        .eq('term', term)
        .eq('year', year)
        .maybeSingle();

    // Fetch class analytics with basic data
    const { data: classAnalyticsData } = await supabase
        .from('class_analytics')
        .select('class_id, avg_grade, attendance_rate')
        .eq('school_id', schoolId)
        .eq('term', term)
        .eq('year', year);

    // Get class names
    const classIds = classAnalyticsData?.map(c => c.class_id).filter(Boolean) || [];
    const { data: classesData } = await supabase
        .from('classes')
        .select('id, name')
        .in('id', classIds);

    const classLookup = classesData?.reduce((acc: Record<string, string>, cls) => {
        acc[cls.id] = cls.name;
        return acc;
    }, {}) || {};

    const classPerformance = classAnalyticsData?.map(c => ({
        class: classLookup[c.class_id] || 'Unknown Class',
        average: c.avg_grade || 0,
        attendance: c.attendance_rate || 0
    })) || [];

    // Fetch grades for subject performance
    const { data: subjectGrades } = await supabase
        .from('grades')
        .select('score, subject_id')
        .eq('school_id', schoolId)
        .eq('term', term)
        .eq('academic_year', year)
        .not('score', 'is', null);

    // Get subject names
    const { data: subjects } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('school_id', schoolId);

    const subjectLookup = subjects?.reduce((acc: Record<string, string>, subject) => {
        acc[subject.id] = subject.name;
        return acc;
    }, {}) || {};

    // Process subject performance
    const subjectMap = (subjectGrades || []).reduce((acc: Record<string, number[]>, grade) => {
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
    const { data: studentRankingsData } = await supabase
        .from('grade_summary')
        .select('average_score, class_position, student_id, class_id')
        .eq('school_id', schoolId)
        .eq('term', term)
        .eq('academic_year', year)
        .not('average_score', 'is', null)
        .order('average_score', { ascending: false })
        .limit(5);

    // Get student and class data for rankings
    const studentIds = studentRankingsData?.map(s => s.student_id).filter(Boolean) || [];
    const rankingClassIds = studentRankingsData?.map(s => s.class_id).filter(Boolean) || [];

    const { data: studentsData } = await supabase
        .from('students')
        .select('id, name')
        .in('id', studentIds);

    const { data: rankingClassesData } = await supabase
        .from('classes')
        .select('id, name')
        .in('id', rankingClassIds);

    const studentLookup = studentsData?.reduce((acc: Record<string, string>, student) => {
        acc[student.id] = student.name;
        return acc;
    }, {}) || {};

    const rankingClassLookup = rankingClassesData?.reduce((acc: Record<string, string>, cls) => {
        acc[cls.id] = cls.name;
        return acc;
    }, {}) || {};

    const studentRankings = (studentRankingsData || [])
        .filter(s => s.student_id && s.class_id && studentLookup[s.student_id] && rankingClassLookup[s.class_id])
        .map(s => ({
            name: studentLookup[s.student_id],
            class: rankingClassLookup[s.class_id],
            average: s.average_score || 0,
            position: s.class_position || 0,
        }));

    // Fetch teacher activity
    const { data: teacherActivityData } = await supabase
        .from('grades')
        .select('submitted_by')
        .eq('school_id', schoolId)
        .eq('term', term)
        .eq('academic_year', year)
        .not('submitted_by', 'is', null);

    const teacherIds = [...new Set(teacherActivityData?.map(g => g.submitted_by).filter(Boolean))] || [];
    const { data: teachersData } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', teacherIds);

    const teacherLookup = teachersData?.reduce((acc: Record<string, string>, teacher) => {
        acc[teacher.id] = teacher.name;
        return acc;
    }, {}) || {};

    const teacherMap = (teacherActivityData || []).reduce((acc: Record<string, number>, grade) => {
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
            totalStudents: schoolAnalyticsData?.total_students || 0,
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
