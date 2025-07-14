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

interface StudentWithClass {
  id: string;
  name: string;
  class_id: string;
  classes?: {
    name: string;
  };
}

interface GradeWithSubject {
  student_id: string;
  score: number | null;
  max_score: number | null;
  percentage: number | null;
  letter_grade: string | null;
  term: string;
  exam_type: string | null;
  created_at: string;
  status: string;
  subjects?: {
    name: string;
  };
}

interface QueryError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
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

    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        console.log('📚 Parent Children Grades: Starting fetch for parent:', user.id);

        // Ultra-optimized timeout control  
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
          console.error('📚 Parent grades query timed out');
        }, 10000); // Increased timeout to 10 seconds

        try {
          // Single optimized query to get parent's children using new index
          console.log('📚 Fetching parent-student relationships...');
          const { data: parentStudents, error: parentStudentsError } = await supabase
            .from('parent_students')
            .select('student_id')
            .eq('parent_id', user.id)
            .limit(20) // Reasonable limit for children
            .abortSignal(controller.signal);

          if (parentStudentsError) {
            console.error('📚 Parent students query error:', parentStudentsError);
            throw new Error(`Could not fetch your children information: ${parentStudentsError.message}`);
          }

          if (!parentStudents || parentStudents.length === 0) {
            console.log('📚 No children found for parent');
            setChildrenGrades([]);
            setLoading(false);
            clearTimeout(timeoutId);
            return;
          }

          const studentIds = parentStudents.map(ps => ps.student_id);
          console.log('📚 Found students:', studentIds.length, 'Student IDs:', studentIds);

          // Optimized parallel queries with proper limits
          console.log('📚 Fetching students and grades data...');
          const [studentsResult, gradesResult] = await Promise.all([
            // Get students with class info in single optimized query
            supabase
              .from('students')
              .select(`
                id, 
                name, 
                class_id,
                classes!students_class_id_fkey(name)
              `)
              .in('id', studentIds)
              .limit(20)
              .abortSignal(controller.signal),

            // Get only recent released grades (last 3 months) with subject info
            supabase
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
                status,
                subjects!fk_grades_subject_id(name)
              `)
              .in('student_id', studentIds)
              .eq('status', 'released')
              .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()) // Last 3 months only
              .order('created_at', { ascending: false })
              .limit(100) // Limit total grades to prevent excessive data
              .abortSignal(controller.signal)
          ]);

          clearTimeout(timeoutId);

          // Add warnings for data truncation
          if (gradesResult.data && gradesResult.data.length === 100) {
            console.warn('⚠️ Grades data may be truncated (100 records fetched)');
          }

          if (studentsResult.error) {
            console.error('📚 Students query error:', studentsResult.error);
            throw new Error(`Could not fetch student information: ${studentsResult.error.message}`);
          }

          if (gradesResult.error) {
            console.error('📚 Grades query error:', gradesResult.error);
            throw new Error(`Could not fetch grades: ${gradesResult.error.message}`);
          }

          console.log('📚 Students data:', studentsResult.data?.length || 0, 'records');
          console.log('📚 Grades data:', gradesResult.data?.length || 0, 'records');

          // Process the data efficiently
          const childrenGradesMap: Record<string, ChildGrade> = {};

          // Initialize with student data
          studentsResult.data?.forEach((student: StudentWithClass) => {
            childrenGradesMap[student.id] = {
              student_id: student.id,
              student_name: student.name,
              class_name: student.classes?.name || 'Unknown Class',
              recent_grades: [],
              average_score: 0,
              total_subjects: 0
            };
          });

          // Add grades data efficiently
          gradesResult.data?.forEach((grade: GradeWithSubject) => {
            if (childrenGradesMap[grade.student_id]) {
              childrenGradesMap[grade.student_id].recent_grades.push({
                subject: grade.subjects?.name || 'Unknown Subject',
                score: grade.score || 0,
                max_score: grade.max_score || 100,
                percentage: grade.percentage || 0,
                letter_grade: grade.letter_grade || 'N/A',
                term: grade.term,
                exam_type: grade.exam_type || 'Unknown'
              });
            }
          });

          // Calculate averages and limit recent grades efficiently
          Object.values(childrenGradesMap).forEach(child => {
            // Sort by most recent and take top 5 only
            child.recent_grades = child.recent_grades
              .sort((a, b) => new Date(b.term).getTime() - new Date(a.term).getTime())
              .slice(0, 5);

            // Calculate average only if we have grades
            if (child.recent_grades.length > 0) {
              const validGrades = child.recent_grades.filter(g => g.percentage > 0);
              if (validGrades.length > 0) {
                child.average_score = Math.round(
                  validGrades.reduce((sum, grade) => sum + grade.percentage, 0) / validGrades.length
                );
                child.total_subjects = new Set(validGrades.map(g => g.subject)).size;
              }
            }
          });

          const result = Object.values(childrenGradesMap);
          
          // Add warning if no grades found for any children
          const childrenWithGrades = result.filter(child => child.recent_grades.length > 0);
          if (result.length > 0 && childrenWithGrades.length === 0) {
            console.warn('⚠️ No grades found for any children - possible data or release issue');
          }

          setChildrenGrades(result);
          console.log('📚 Successfully loaded grades for', Object.keys(childrenGradesMap).length, 'children');
          return; // Success, exit retry loop

        } catch (queryError) {
          clearTimeout(timeoutId);
          if (queryError.name === 'AbortError') {
            throw new Error('Grades query timed out - please try again');
          }
          throw queryError;
        }

      } catch (error: unknown) {
        attempts++;
        console.error(`📚 Error fetching children grades (attempt ${attempts}/${maxAttempts}):`, error);
        
        // If this is the last attempt, set error state
        if (attempts >= maxAttempts) {
          const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while fetching grades';
          setError(errorMessage);
          break;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
      }
    }
  }, [user]);

  useEffect(() => {
    fetchChildrenGrades();
  }, [fetchChildrenGrades]);

  return { childrenGrades, loading, error, refetch: fetchChildrenGrades };
};
