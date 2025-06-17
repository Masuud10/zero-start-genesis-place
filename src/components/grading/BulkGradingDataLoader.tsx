
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BulkGradingDataLoaderProps {
  schoolId: string;
  selectedClass: string;
  selectedTerm: string;
  selectedExamType: string;
  userId?: string;
  isTeacher: boolean;
  updatePermissions: (data: any[]) => void;
}

type GradeValue = {
  score?: number | null;
  letter_grade?: string | null;
  cbc_performance_level?: string | null;
  percentage?: number | null;
};

export const useBulkGradingDataLoader = ({
  schoolId,
  selectedClass,
  selectedTerm,
  selectedExamType,
  userId,
  isTeacher,
  updatePermissions
}: BulkGradingDataLoaderProps) => {
  const { toast } = useToast();
  
  const [classes, setClasses] = useState<any[]>([]);
  const [academicTerms, setAcademicTerms] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<Record<string, Record<string, GradeValue>>>({});
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch initial data (classes and terms)
  const fetchInitialData = useCallback(async () => {
    if (!schoolId) return;
    
    try {
      console.log('Fetching initial data for school:', schoolId);
      
      const [classesRes, termsRes] = await Promise.all([
        supabase.from('classes').select('*').eq('school_id', schoolId).order('name'),
        supabase.from('academic_terms').select('*').eq('school_id', schoolId).order('start_date', { ascending: false })
      ]);

      if (classesRes.error) throw classesRes.error;
      if (termsRes.error) throw termsRes.error;

      console.log('Classes found:', classesRes.data?.length || 0);
      console.log('Terms found:', termsRes.data?.length || 0);

      const validClasses = Array.isArray(classesRes.data) ? classesRes.data : [];
      const validTerms = Array.isArray(termsRes.data) ? termsRes.data : [];

      setClasses(validClasses);
      setAcademicTerms(validTerms);
      
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast({
        title: "Error",
        description: "Failed to load classes and terms",
        variant: "destructive"
      });
    } finally {
      setInitialLoading(false);
    }
  }, [schoolId, toast]);

  // Fetch class data (students and subjects)
  const fetchClassData = useCallback(async () => {
    if (!selectedClass || !schoolId) {
      setStudents([]);
      setSubjects([]);
      return;
    }
    
    setLoading(true);
    try {
      console.log('Fetching data for class:', selectedClass, 'school:', schoolId);
      
      const [studentsRes, subjectsRes] = await Promise.all([
        supabase
          .from('students')
          .select('*')
          .eq('class_id', selectedClass)
          .eq('school_id', schoolId)
          .eq('is_active', true)
          .order('name'),
        
        isTeacher
          ? supabase
              .from('subjects')
              .select('*')
              .eq('school_id', schoolId)
              .eq('teacher_id', userId)
              .eq('class_id', selectedClass)
          : supabase
              .from('subjects')
              .select('*')
              .eq('school_id', schoolId)
              .eq('class_id', selectedClass)
      ]);

      if (studentsRes.error) throw studentsRes.error;
      if (subjectsRes.error) throw subjectsRes.error;

      const validStudents = Array.isArray(studentsRes.data) ? studentsRes.data.filter(s => s && s.id && s.name) : [];
      const validSubjects = Array.isArray(subjectsRes.data) ? subjectsRes.data.filter(s => s && s.id && s.name) : [];

      console.log('Valid students:', validStudents.length);
      console.log('Valid subjects:', validSubjects.length);

      setStudents(validStudents);
      setSubjects(validSubjects);

      // Show specific messages based on what's missing
      if (validStudents.length === 0) {
        toast({
          title: "No Students Found",
          description: `No active students found in the selected class. Please ensure students are properly enrolled.`,
          variant: "default"
        });
      }

      if (validSubjects.length === 0) {
        const message = isTeacher 
          ? "You are not assigned to teach any subjects for this class."
          : "No subjects found for this class. Please ensure subjects are properly set up.";
        
        toast({
          title: "No Subjects Found",
          description: message,
          variant: "default"
        });
      }

    } catch (error) {
      console.error('Error fetching class data:', error);
      setStudents([]);
      setSubjects([]);
      toast({
        title: "Error",
        description: `Failed to load class data: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [selectedClass, schoolId, userId, isTeacher, toast]);

  // Fetch existing grades
  const fetchExistingGrades = useCallback(async () => {
    if (!selectedClass || !selectedTerm || !selectedExamType || !schoolId) return;
    
    setLoading(true);
    try {
      console.log('Fetching existing grades for:', { selectedClass, selectedTerm, selectedExamType });
      
      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('term', selectedTerm)
        .eq('exam_type', selectedExamType)
        .eq('school_id', schoolId);
      
      if (error) throw error;
      console.log('Existing grades found:', data?.length || 0);

      updatePermissions(data || []);

      if (data && data.length > 0) {
        // Load existing grades
        const newGrades: Record<string, Record<string, GradeValue>> = {};
        for (const grade of data) {
          if (!newGrades[grade.student_id]) {
            newGrades[grade.student_id] = {};
          }
          newGrades[grade.student_id][grade.subject_id] = {
            score: grade.score,
            letter_grade: grade.letter_grade,
            cbc_performance_level: grade.cbc_performance_level,
            percentage: grade.percentage
          };
        }
        setGrades(newGrades);
        console.log('Grades loaded for:', Object.keys(newGrades).length, 'students');
      } else {
        setGrades({});
        console.log('No existing grades found');
      }
    } catch (error) {
      console.error('Error fetching existing grades:', error);
      toast({
        title: "Warning",
        description: "Could not load existing grades.",
        variant: "default"
      });
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedTerm, selectedExamType, schoolId, updatePermissions, toast]);

  // Effects
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    fetchClassData();
  }, [fetchClassData]);

  useEffect(() => {
    fetchExistingGrades();
  }, [fetchExistingGrades]);

  return {
    classes,
    academicTerms,
    subjects,
    students,
    grades,
    setGrades,
    loading,
    initialLoading
  };
};
