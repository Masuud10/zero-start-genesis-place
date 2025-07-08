import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from './useSchoolScopedData';
import { useCurrentAcademicInfo } from './useCurrentAcademicInfo';

// Simplified interfaces to avoid deep type instantiation
type KeyMetrics = {
    totalStudents: number;
    schoolAverage: number;
    attendanceRate: number;
    resultsReleased: number;
    totalRevenue: number;
    outstandingFees: number;
};

type ClassPerformance = {
    class: string;
    average: number;
    attendance: number;
    studentCount: number;
};

type SubjectPerformance = {
    subject: string;
    average: number;
    improvement: number;
    totalGrades: number;
};

type StudentRanking = {
    name: string;
    class: string;
    average: number;
    position: number;
};

type TeacherActivity = {
    teacher: string;
    grades: number;
    submissions: number;
    onTime: number;
    lastActivity?: string;
};

type FinancialSummary = {
    totalCollected: number;
    totalPending: number;
    collectionRate: number;
};

type PrincipalAnalyticsData = {
    keyMetrics: KeyMetrics;
    classPerformance: ClassPerformance[];
    subjectPerformance: SubjectPerformance[];
    studentRankings: StudentRanking[];
    teacherActivity: TeacherActivity[];
    financialSummary: FinancialSummary;
};

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

    // Normalize term parameter
    const normalizedTerm = term || 'Term 1';
    const normalizedYear = year || new Date().getFullYear().toString();
    
    console.log('📊 Using normalized parameters:', { normalizedTerm, normalizedYear });

    // Create flexible term matching - handle different term formats
    const termVariations = [
        normalizedTerm,
        normalizedTerm.toLowerCase(),
        normalizedTerm.toUpperCase(),
        normalizedTerm.replace(/\s+/g, ''),
        normalizedTerm.replace(/\s+/g, '').toLowerCase(),
        normalizedTerm.replace(/\s+/g, '').toUpperCase()
    ];

    console.log('📊 Term variations to try:', termVariations);

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
            .select('id, name')
            .eq('school_id', schoolId);

        if (classError) {
            console.warn('Error fetching class data:', classError);
        }

        console.log('📊 Classes found:', classData?.length || 0, 'for school:', schoolId);

        // Process class performance with proper error handling
        const classPerformance: ClassPerformance[] = await Promise.all((classData || []).map(async (cls) => {
            try {
                console.log(`📊 Processing class: ${cls.name} (${cls.id})`);
                
                // Get grades for this class with proper school isolation
                const { data: grades, error: gradesError } = await supabase
                    .from('grades')
                    .select('score, percentage')
                    .eq('school_id', schoolId)
                    .eq('class_id', cls.id)
                    .in('term', termVariations)
                    .in('status', ['approved', 'released'])
                    .not('score', 'is', null);

                if (gradesError) {
                    console.warn(`Error fetching grades for class ${cls.name}:`, gradesError);
                }

                // Get attendance for this class with proper school isolation
                const { data: attendance, error: attendanceError } = await supabase
                    .from('attendance')
                    .select('status')
                    .eq('school_id', schoolId)
                    .eq('class_id', cls.id)
                    .in('term', termVariations);

                if (attendanceError) {
                    console.warn(`Error fetching attendance for class ${cls.name}:`, attendanceError);
                }

                // Get student count for this class
                const { count: studentCount, error: studentCountError } = await supabase
                    .from('students')
                    .select('id', { count: 'exact', head: true })
                    .eq('school_id', schoolId)
                    .eq('class_id', cls.id)
                    .eq('is_active', true);

                if (studentCountError) {
                    console.warn(`Error fetching student count for class ${cls.name}:`, studentCountError);
                }

                const totalGrades = grades?.length || 0;
                const averageGrade = totalGrades > 0 
                    ? grades.reduce((sum, g) => sum + (g.percentage || g.score || 0), 0) / totalGrades 
                    : 0;

                const presentCount = attendance?.filter(a => a.status === 'present').length || 0;
                const totalAttendance = attendance?.length || 0;
                const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

                console.log(`📊 Class ${cls.name} stats:`, {
                    students: studentCount || 0,
                    grades: totalGrades,
                    average: averageGrade,
                    attendance: attendanceRate,
                    attendanceRecords: totalAttendance
                });

                // Return class data even if no grades/attendance yet
                return {
                    class: cls.name,
                    average: Math.round(averageGrade * 100) / 100,
                    attendance: Math.round(attendanceRate * 100) / 100,
                    studentCount: studentCount || 0
                };
            } catch (error) {
                console.warn(`Error processing class ${cls.name}:`, error);
                // Return class with zero values instead of skipping it
                return {
                    class: cls.name,
                    average: 0,
                    attendance: 0,
                    studentCount: 0
                };
            }
        }));

        // Filter out classes with no students to avoid showing empty classes
        const filteredClassPerformance = classPerformance.filter(cls => cls.studentCount > 0);

        console.log('📊 Final class performance data:', filteredClassPerformance);

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
                    .in('term', termVariations)
                    .in('status', ['approved', 'released'])
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

        // Fetch student rankings - try grade_summary first, fallback to direct calculation
        let studentRankings: Array<{
            name: string;
            class: string;
            average: number;
            position: number;
        }> = [];

        try {
            // First try to get from grade_summary table
            const { data: rankingsData, error: rankingsError } = await supabase
                .from('grade_summary')
                .select(`
                    average_score, 
                    class_position, 
                    students!inner(id, name, class_id),
                    classes!inner(id, name)
                `)
                .eq('school_id', schoolId)
                .in('term', termVariations)
                .eq('academic_year', normalizedYear)
                .not('average_score', 'is', null)
                .order('average_score', { ascending: false })
                .limit(10);

            if (!rankingsError && rankingsData && rankingsData.length > 0) {
                studentRankings = rankingsData.map((ranking, index) => ({
                    name: ranking.students?.name || 'Unknown',
                    class: ranking.classes?.name || 'Unknown',
                    average: Math.round((ranking.average_score || 0) * 100) / 100,
                    position: ranking.class_position || index + 1,
                }));
            } else {
                // Fallback: Calculate rankings directly from grades table
                console.log('Using fallback ranking calculation');
                
                // First get all students with their grades
                const { data: studentGrades } = await supabase
                    .from('grades')
                    .select('student_id, percentage')
                    .eq('school_id', schoolId)
                    .in('term', termVariations)
                    .in('status', ['approved', 'released'])
                    .not('percentage', 'is', null);

                if (studentGrades && studentGrades.length > 0) {
                    // Get unique student IDs
                    const studentIds = [...new Set(studentGrades.map(g => g.student_id))];
                    
                    // Get student details
                    const { data: students } = await supabase
                        .from('students')
                        .select('id, name, class_id')
                        .eq('school_id', schoolId)
                        .in('id', studentIds);

                    // Get class details
                    const classIds = [...new Set(students?.map(s => s.class_id).filter(Boolean) || [])];
                    const { data: classes } = await supabase
                        .from('classes')
                        .select('id, name')
                        .eq('school_id', schoolId)
                        .in('id', classIds);

                    // Create lookup maps
                    const studentMap = new Map(students?.map(s => [s.id, s]) || []);
                    const classMap = new Map(classes?.map(c => [c.id, c]) || []);

                    // Group by student and calculate averages
                    const studentAverages = new Map<string, { name: string; class: string; total: number; count: number }>();
                    
                    studentGrades.forEach(grade => {
                        const studentId = grade.student_id;
                        const student = studentMap.get(studentId);
                        const classInfo = student ? classMap.get(student.class_id) : null;
                        
                        const existing = studentAverages.get(studentId);
                        
                        if (existing) {
                            existing.total += grade.percentage || 0;
                            existing.count += 1;
                        } else {
                            studentAverages.set(studentId, {
                                name: student?.name || 'Unknown',
                                class: classInfo?.name || 'Unknown',
                                total: grade.percentage || 0,
                                count: 1
                            });
                        }
                    });

                    // Convert to array and sort by average
                    const rankings = Array.from(studentAverages.entries())
                        .map(([studentId, data]) => ({
                            name: data.name,
                            class: data.class,
                            average: Math.round((data.total / data.count) * 100) / 100,
                            position: 0 // Will be set below
                        }))
                        .sort((a, b) => b.average - a.average)
                        .slice(0, 10)
                        .map((student, index) => ({
                            ...student,
                            position: index + 1
                        }));

                    studentRankings = rankings;
                }
            }
        } catch (error) {
            console.warn('Error fetching student rankings:', error);
        }

        // Fetch teacher activity with proper school isolation
        const { data: teacherData, error: teacherError } = await supabase
            .from('profiles')
            .select('id, name')
            .eq('school_id', schoolId)
            .eq('role', 'teacher');

        const teacherActivity = await Promise.all((teacherData || []).map(async (teacher) => {
            try {
                // Get grades count for this teacher
                const { count: gradesCount } = await supabase
                    .from('grades')
                    .select('id', { count: 'exact', head: true })
                    .eq('school_id', schoolId)
                    .eq('submitted_by', teacher.id)
                    .in('term', termVariations);

                // Get last activity date
                const { data: lastGrade } = await supabase
                    .from('grades')
                    .select('submitted_at')
                    .eq('school_id', schoolId)
                    .eq('submitted_by', teacher.id)
                    .in('term', termVariations)
                    .order('submitted_at', { ascending: false })
                    .limit(1);

                // Calculate on-time percentage (placeholder - could be enhanced)
                const onTimePercentage = gradesCount > 0 ? 95 : 0; // Placeholder calculation

                return {
                    teacher: teacher.name || 'Unknown',
                    grades: gradesCount || 0,
                    submissions: gradesCount || 0,
                    onTime: onTimePercentage,
                    lastActivity: lastGrade?.[0]?.submitted_at
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
            .eq('academic_year', normalizedYear);

        const totalExpected = financialData?.reduce((sum, fee) => sum + (fee.amount || 0), 0) || 0;
        const totalCollected = financialData?.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0) || 0;
        const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

        // Calculate school average from all grades
        const { data: allGrades } = await supabase
            .from('grades')
            .select('percentage, score')
            .eq('school_id', schoolId)
            .in('term', termVariations)
            .in('status', ['approved', 'released'])
            .not('score', 'is', null);

        const schoolAverage = allGrades?.length 
            ? allGrades.reduce((sum, g) => sum + (g.percentage || g.score || 0), 0) / allGrades.length 
            : 0;

        // Calculate attendance rate
        const { data: allAttendance } = await supabase
            .from('attendance')
            .select('status')
            .eq('school_id', schoolId)
            .in('term', termVariations);

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
            classPerformance: filteredClassPerformance,
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
        enabled: isReady && !loading && !!schoolId && schoolId !== 'null' && schoolId !== 'undefined',
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchInterval: false, // Disable auto-refetch to reduce load
        refetchOnWindowFocus: false, // Disable refetch on focus to reduce queries
        retry: 1, // Reduce retry attempts
        retryDelay: 2000,
    });
};
