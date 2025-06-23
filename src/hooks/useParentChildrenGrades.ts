
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ChildGrade {
  student_id: string;
  student_name: string;
  class_name: string;
  recent_grades: {
    subject: string;
    score: number;
    max_score: number;
    percentage: number;
    letter_grade: string;
    term: string;
    exam_type: string;
  }[];
  average_score: number;
  total_subjects: number;
}

export const useParentChildrenGrades = () => {
  const { user } = useAuth();
  const [childrenGrades, setChildrenGrades] = useState<ChildGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChildrenGrades = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      // First, get the parent's children
      const { data: parentStudents, error: parentStudentsError } = await supabase
        .from('parent_students')
        .select('student_id')
        .eq('parent_id', user.id);

      if (parentStudentsError) {
        throw new Error('Could not fetch your children information');
      }

      if (!parentStudents || parentStudents.length === 0) {
        setChildrenGrades([]);
        setLoading(false);
        return;
      }

      const studentIds = parentStudents.map(ps => ps.student_id);

      // Get students info with class information
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          id, 
          name, 
          class_id,
          classes!students_class_id_fkey(name)
        `)
        .in('id', studentIds);

      if (studentsError) {
        throw new Error('Could not fetch student information');
      }

      // Get released grades for these students with subject information
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select(`
          student_id,
          score,
          max_score,
          percentage,
          letter_grade,
          term,
          exam_type,
          created_at,
          subjects!grades_subject_id_fkey(name)
        `)
        .in('student_id', studentIds)
        .eq('status', 'released')
        .order('created_at', { ascending: false });

      if (gradesError) {
        throw new Error('Could not fetch grades');
      }

      // Process the data
      const childrenGradesMap: Record<string, ChildGrade> = {};

      // Initialize with student data
      studentsData?.forEach(student => {
        const classes = student.classes as any;
        childrenGradesMap[student.id] = {
          student_id: student.id,
          student_name: student.name,
          class_name: classes?.name || 'Unknown Class',
          recent_grades: [],
          average_score: 0,
          total_subjects: 0
        };
      });

      // Add grades data
      gradesData?.forEach(grade => {
        if (childrenGradesMap[grade.student_id]) {
          const subjects = grade.subjects as any;
          childrenGradesMap[grade.student_id].recent_grades.push({
            subject: subjects?.name || 'Unknown Subject',
            score: grade.score || 0,
            max_score: grade.max_score || 100,
            percentage: grade.percentage || 0,
            letter_grade: grade.letter_grade || 'N/A',
            term: grade.term,
            exam_type: grade.exam_type || 'Unknown'
          });
        }
      });

      // Calculate averages and limit recent grades
      Object.values(childrenGradesMap).forEach(child => {
        // Sort by most recent and take top 5
        child.recent_grades = child.recent_grades
          .sort((a, b) => new Date(b.term).getTime() - new Date(a.term).getTime())
          .slice(0, 5);

        // Calculate average
        if (child.recent_grades.length > 0) {
          child.average_score = child.recent_grades.reduce((sum, grade) => sum + grade.percentage, 0) / child.recent_grades.length;
          child.total_subjects = new Set(child.recent_grades.map(g => g.subject)).size;
        }
      });

      setChildrenGrades(Object.values(childrenGradesMap));
    } catch (error: any) {
      console.error('Error fetching children grades:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchChildrenGrades();
  }, [fetchChildrenGrades]);

  return { childrenGrades, loading, error, refetch: fetchChildrenGrades };
};
