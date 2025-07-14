import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AcademicYear {
  id: string;
  year_name: string;
  is_current: boolean;
  start_date: string;
  end_date: string;
}

export interface AcademicTerm {
  id: string;
  term_name: string;
  is_current: boolean;
  start_date: string;
  end_date: string;
  academic_year_id: string;
}

export interface ExamType {
  id: string;
  exam_type: string;
  session_name: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  created_by: string;
}

export const useAcademicFilters = (schoolId: string | null) => {
  // Load academic years
  const { 
    data: academicYears = [], 
    isLoading: loadingYears 
  } = useQuery({
    queryKey: ['academic-years', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      
      const { data, error } = await supabase
        .from('academic_years')
        .select('id, year_name, is_current, start_date, end_date')
        .eq('school_id', schoolId)
        .order('start_date', { ascending: false });
      
      if (error) {
        console.error('Error loading academic years:', error);
        return [];
      }
      
      return data as AcademicYear[];
    },
    enabled: !!schoolId,
  });

  // Load academic terms
  const { 
    data: academicTerms = [], 
    isLoading: loadingTerms 
  } = useQuery({
    queryKey: ['academic-terms', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      
      const { data, error } = await supabase
        .from('academic_terms')
        .select('id, term_name, is_current, start_date, end_date, academic_year_id')
        .eq('school_id', schoolId)
        .order('start_date', { ascending: true });
      
      if (error) {
        console.error('Error loading academic terms:', error);
        return [];
      }
      
      return data as AcademicTerm[];
    },
    enabled: !!schoolId,
  });

  // Load active exam types from exam_sessions table with better fallback
  const { 
    data: examTypes = [], 
    isLoading: loadingExamTypes 
  } = useQuery({
    queryKey: ['exam-types', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      
      try {
        // First try to get exam sessions
        const { data: examSessionsData, error: examSessionsError } = await supabase
          .from('exam_sessions')
          .select('id, exam_type, session_name, is_active, start_date, end_date, created_by, academic_year, term')
          .eq('school_id', schoolId)
          .eq('is_active', true)
          .order('start_date', { ascending: false });
        
        if (!examSessionsError && examSessionsData && examSessionsData.length > 0) {
          console.log('Loaded exam sessions:', examSessionsData);
          return examSessionsData as ExamType[];
        }
        
        // Fallback: check if there are any existing exam types from grades table
        const { data: existingExamTypes, error: gradesError } = await supabase
          .from('grades')
          .select('exam_type')
          .eq('school_id', schoolId)
          .not('exam_type', 'is', null);
        
        if (!gradesError && existingExamTypes && existingExamTypes.length > 0) {
          const uniqueExamTypes = [...new Set(existingExamTypes.map(g => g.exam_type))];
          console.log('Found existing exam types from grades:', uniqueExamTypes);
          
          return uniqueExamTypes.map((examType, index) => ({
            id: `existing_${index}`,
            exam_type: examType,
            session_name: examType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            is_active: true,
            start_date: '',
            end_date: '',
            created_by: ''
          }));
        }
        
        // Final fallback to default exam types
        console.log('Using default exam types fallback');
        return [
          { id: 'opener', exam_type: 'OPENER', session_name: 'Opener Exam', is_active: true, start_date: '', end_date: '', created_by: '' },
          { id: 'mid_term', exam_type: 'MID_TERM', session_name: 'Mid Term Exam', is_active: true, start_date: '', end_date: '', created_by: '' },
          { id: 'end_term', exam_type: 'END_TERM', session_name: 'End Term Exam', is_active: true, start_date: '', end_date: '', created_by: '' },
          { id: 'assignment', exam_type: 'ASSIGNMENT', session_name: 'Assignment', is_active: true, start_date: '', end_date: '', created_by: '' },
          { id: 'test', exam_type: 'TEST', session_name: 'Test', is_active: true, start_date: '', end_date: '', created_by: '' },
          { id: 'project', exam_type: 'PROJECT', session_name: 'Project', is_active: true, start_date: '', end_date: '', created_by: '' },
        ];
      } catch (error) {
        console.error('Error in exam types query:', error);
        return [
          { id: 'opener', exam_type: 'OPENER', session_name: 'Opener Exam', is_active: true, start_date: '', end_date: '', created_by: '' },
          { id: 'mid_term', exam_type: 'MID_TERM', session_name: 'Mid Term Exam', is_active: true, start_date: '', end_date: '', created_by: '' },
          { id: 'end_term', exam_type: 'END_TERM', session_name: 'End Term Exam', is_active: true, start_date: '', end_date: '', created_by: '' },
        ];
      }
    },
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Get current academic year
  const currentAcademicYear = academicYears.find(year => year.is_current);
  
  // Get current academic term
  const currentAcademicTerm = academicTerms.find(term => term.is_current);

  // Get active exam types for current period
  const activeExamTypes = examTypes.filter(exam => {
    if (!exam.is_active) return false;
    
    // If exam has date properties, check if within range
    if (exam.start_date && exam.end_date) {
      const now = new Date();
      const startDate = new Date(exam.start_date as string);
      const endDate = new Date(exam.end_date as string);
      return now >= startDate && now <= endDate;
    }
    
    // Show all active exams if no date filtering
    return true;
  });

  return {
    academicYears,
    academicTerms,
    examTypes,
    currentAcademicYear,
    currentAcademicTerm,
    activeExamTypes,
    isLoading: loadingYears || loadingTerms || loadingExamTypes,
    // Helper functions
    getTermsForYear: (yearId: string) => academicTerms.filter(term => term.academic_year_id === yearId),
    getCurrentYearTerms: () => currentAcademicYear 
      ? academicTerms.filter(term => term.academic_year_id === currentAcademicYear.id)
      : academicTerms
  };
};