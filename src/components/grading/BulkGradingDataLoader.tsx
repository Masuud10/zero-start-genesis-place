
import { useState, useEffect, useCallback, useRef } from 'react';
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

  // Caching refs
  const initialDataCache = useRef<{ classes: any[], terms: any[] } | null>(null);
  const classDataCache = useRef<Map<string, { students: any[], subjects: any[] }>>(new Map());
  const gradesCache = useRef<Map<string, any>>(new Map());

  // Fetch initial data with caching (classes and terms)
  const fetchInitialData = useCallback(async () => {
    if (!schoolId) return;
    
    // Check cache first
    if (initialDataCache.current) {
      console.log('🎓 BulkGrading: Using cached initial data');
      setClasses(initialDataCache.current.classes);
      setAcademicTerms(initialDataCache.current.terms);
      setInitialLoading(false);
      return;
    }
    
    try {
      console.log('🎓 BulkGrading: Fetching initial data for school:', schoolId);
      
      // Fetch both in parallel
      const [classesRes, termsRes] = await Promise.all([
        supabase.from('classes').select('*').eq('school_id', schoolId).order('name'),
        supabase.from('academic_terms').select('*').eq('school_id', schoolId).order('start_date', { ascending: false })
      ]);

      if (classesRes.error) throw classesRes.error;
      if (termsRes.error) throw termsRes.error;

      const validClasses = Array.isArray(classesRes.data) ? classesRes.data : [];
      const validTerms = Array.isArray(termsRes.data) ? termsRes.data : [];

      // Cache the results
      initialDataCache.current = {
        classes: validClasses,
        terms: validTerms
      };

      setClasses(validClasses);
      setAcademicTerms(validTerms);
      
      console.log('🎓 BulkGrading: Cached initial data - Classes:', validClasses.length, 'Terms:', validTerms.length);
      
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

  // Fetch class data with caching (students and subjects)
  const fetchClassData = useCallback(async () => {
    if (!selectedClass || !schoolId) {
      setStudents([]);
      setSubjects([]);
      return;
    }
    
    const cacheKey = `${selectedClass}_${isTeacher ? userId : 'all'}`;
    
    // Check cache first
    if (classDataCache.current.has(cacheKey)) {
      console.log('🎓 BulkGrading: Using cached class data for', cacheKey);
      const cached = classDataCache.current.get(cacheKey)!;
      setStudents(cached.students);
      setSubjects(cached.subjects);
      return;
    }
    
    setLoading(true);
    try {
      console.log('🎓 BulkGrading: Fetching class data for:', selectedClass);
      
      // Build queries based on teacher role
      const studentsQuery = supabase
        .from('students')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('name');

      const subjectsQuery = isTeacher
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
            .eq('class_id', selectedClass);

      // Fetch both in parallel
      const [studentsRes, subjectsRes] = await Promise.all([
        studentsQuery,
        subjectsQuery
      ]);

      if (studentsRes.error) throw studentsRes.error;
      if (subjectsRes.error) throw subjectsRes.error;

      const validStudents = Array.isArray(studentsRes.data) ? studentsRes.data.filter(s => s && s.id && s.name) : [];
      const validSubjects = Array.isArray(subjectsRes.data) ? subjectsRes.data.filter(s => s && s.id && s.name) : [];

      // Cache the results
      classDataCache.current.set(cacheKey, {
        students: validStudents,
        subjects: validSubjects
      });

      setStudents(validStudents);
      setSubjects(validSubjects);

      console.log('🎓 BulkGrading: Cached class data - Students:', validStudents.length, 'Subjects:', validSubjects.length);

      // Show specific messages only if there are issues
      if (validStudents.length === 0) {
        toast({
          title: "No Students Found",
          description: `No active students found in the selected class.`,
          variant: "default"
        });
      }

      if (validSubjects.length === 0) {
        const message = isTeacher 
          ? "You are not assigned to teach any subjects for this class."
          : "No subjects found for this class.";
        
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

  // Fetch existing grades with caching
  const fetchExistingGrades = useCallback(async () => {
    if (!selectedClass || !selectedTerm || !selectedExamType || !schoolId) return;
    
    const cacheKey = `${selectedClass}_${selectedTerm}_${selectedExamType}`;
    
    // Check cache first
    if (gradesCache.current.has(cacheKey)) {
      console.log('🎓 BulkGrading: Using cached grades for', cacheKey);
      const cachedGrades = gradesCache.current.get(cacheKey);
      updatePermissions(cachedGrades.data || []);
      setGrades(cachedGrades.grades || {});
      return;
    }
    
    setLoading(true);
    try {
      console.log('🎓 BulkGrading: Fetching grades for:', { selectedClass, selectedTerm, selectedExamType });
      
      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('term', selectedTerm)
        .eq('exam_type', selectedExamType)
        .eq('school_id', schoolId);
      
      if (error) throw error;
      
      // Process grades
      const newGrades: Record<string, Record<string, GradeValue>> = {};
      if (data && data.length > 0) {
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
      }

      // Cache the results
      gradesCache.current.set(cacheKey, {
        data: data || [],
        grades: newGrades
      });

      updatePermissions(data || []);
      setGrades(newGrades);
      
      console.log('🎓 BulkGrading: Cached grades - Records:', data?.length || 0, 'Students:', Object.keys(newGrades).length);
      
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

  // Effects with optimized dependencies
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (selectedClass) {
      fetchClassData();
    }
  }, [fetchClassData]);

  useEffect(() => {
    if (selectedClass && selectedTerm && selectedExamType) {
      fetchExistingGrades();
    }
  }, [fetchExistingGrades]);

  // Clear caches when school changes
  useEffect(() => {
    initialDataCache.current = null;
    classDataCache.current.clear();
    gradesCache.current.clear();
  }, [schoolId]);

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
