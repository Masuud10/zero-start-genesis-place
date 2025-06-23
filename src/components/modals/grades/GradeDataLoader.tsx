
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GradeDataLoaderProps {
  user: any;
  selectedClass: string;
  setClasses: (classes: any[]) => void;
  setSubjects: (subjects: any[]) => void;
  setStudents: (students: any[]) => void;
  setFormError: (error: string | null) => void;
}

const GradeDataLoader: React.FC<GradeDataLoaderProps> = ({
  user,
  selectedClass,
  setClasses,
  setSubjects,
  setStudents,
  setFormError
}) => {
  // Load classes
  useEffect(() => {
    const loadClasses = async () => {
      if (!user?.school_id) return;
      
      try {
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .eq('school_id', user.school_id);
          
        if (error) {
          console.error('Error loading classes:', error);
          setFormError(`Failed to load classes: ${error.message}`);
          return;
        }
        
        setClasses(data || []);
      } catch (err: any) {
        console.error('Error loading classes:', err);
        setFormError('Failed to load classes. Please try again.');
      }
    };
    loadClasses();
  }, [user?.school_id, setClasses, setFormError]);

  // Load subjects
  useEffect(() => {
    const loadSubjects = async () => {
      if (!selectedClass || !user?.school_id) {
        setSubjects([]);
        return;
      }

      try {
        let query = supabase
          .from('subjects')
          .select('*')
          .eq('class_id', selectedClass)
          .eq('school_id', user.school_id);
        
        if (user.role === 'teacher') {
          query = query.eq('teacher_id', user.id);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error loading subjects:', error);
          setFormError(`Failed to load subjects: ${error.message}`);
          return;
        }

        setSubjects(data || []);
        if (data?.length === 0 && user.role === 'teacher') {
          setFormError("You are not assigned to any subjects for this class.");
        } else {
          setFormError(null);
        }
      } catch (err: any) {
        console.error('Error loading subjects:', err);
        setFormError('Failed to load subjects. Please try again.');
      }
    };

    loadSubjects();
  }, [selectedClass, user?.school_id, user?.id, user?.role, setSubjects, setFormError]);

  // Load students
  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedClass || !user?.school_id) return;

      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('class_id', selectedClass)
          .eq('school_id', user.school_id);

        if (error) {
          console.error('Error loading students:', error);
          setFormError(`Failed to load students: ${error.message}`);
          return;
        }

        setStudents(data || []);
      } catch (err: any) {
        console.error('Error loading students:', err);
        setFormError('Failed to load students. Please try again.');
      }
    };

    loadStudents();
  }, [selectedClass, user?.school_id, setStudents, setFormError]);

  return null;
};

export default GradeDataLoader;
