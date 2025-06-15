
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/types/auth';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';

interface TeacherStats {
  classes: number;
  students: number;
  pendingGrades: number;
  todaysClasses: number;
}

export const useTeacherDashboardStats = (user: AuthUser) => {
  const [stats, setStats] = useState<TeacherStats>({
    classes: 0,
    students: 0,
    pendingGrades: 0,
    todaysClasses: 0
  });
  const [loading, setLoading] = useState(true);
  const { schoolId } = useSchoolScopedData();

  useEffect(() => {
    const fetchTeacherStats = async () => {
      if (!user?.id || !schoolId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch teacher's classes for the current school
        const { data: teacherClassesData, error: classesError } = await supabase
            .from('classes')
            .select('id, teacher_classes!inner(teacher_id)')
            .eq('school_id', schoolId)
            .eq('teacher_classes.teacher_id', user.id);
        
        if (classesError) throw classesError;

        const classIds = teacherClassesData?.map(c => c.id) || [];

        // Fetch unique students in teacher's classes
        let studentCount = 0;
        if (classIds.length > 0) {
            const { data: studentClassesData, error: studentsError } = await supabase
                .from('student_classes')
                .select('student_id')
                .in('class_id', classIds)
                .eq('is_active', true)
                .eq('school_id', schoolId);

            if (studentsError) {
                console.error("Error fetching student count for teacher dashboard", studentsError);
            } else if (studentClassesData) {
                const uniqueStudentIds = new Set(studentClassesData.map(sc => sc.student_id));
                studentCount = uniqueStudentIds.size;
            }
        }

        // Fetch pending grades (draft status) for the current school
        const { count: pendingGradesCount } = await supabase
          .from('grades')
          .select('id', { count: 'exact' })
          .eq('submitted_by', user.id)
          .eq('status', 'draft')
          .eq('school_id', schoolId);

        // Fetch today's classes from timetable
        const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const { count: todaysClassesCount } = await supabase
          .from('timetables')
          .select('id', { count: 'exact', head: true })
          .eq('teacher_id', user.id)
          .eq('school_id', schoolId)
          .eq('day_of_week', dayOfWeek);

        setStats({
          classes: classIds.length,
          students: studentCount,
          pendingGrades: pendingGradesCount || 0,
          todaysClasses: todaysClassesCount || 0
        });

      } catch (error) {
        console.error('Error fetching teacher stats:', error);
        setStats({
          classes: 0,
          students: 0,
          pendingGrades: 0,
          todaysClasses: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherStats();
  }, [user?.id, schoolId]);

  return { stats, loading };
};
