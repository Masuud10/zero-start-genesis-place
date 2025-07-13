import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useSchoolScopedData } from './useSchoolScopedData';
import { useToast } from './use-toast';
import { SystemIntegrationService } from '@/services/integration/SystemIntegrationService';
import { supabase } from '@/integrations/supabase/client';

export interface AcademicPeriodData {
  year: {
    id: string;
    year_name: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
    term_structure: string;
  } | null;
  term: {
    id: string;
    term_name: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
    academic_year_id: string;
  } | null;
}

export interface ClassData {
  id: string;
  name: string;
  level: string;
  stream?: string;
  curriculum_type: 'CBC' | 'IGCSE' | 'Standard';
  academic_year_id: string;
  is_active: boolean;
}

export interface StudentEnrollmentData {
  id: string;
  student_id: string;
  class_id: string;
  academic_year_id: string;
  term_id: string;
  enrollment_date: string;
  is_active: boolean;
  students?: {
    name: string;
    admission_number: string;
  };
  classes?: {
    name: string;
    curriculum_type: string;
  };
}

export interface SubjectAssignmentData {
  id: string;
  subject_id: string;
  class_id: string;
  teacher_id: string;
  academic_year_id: string;
  term_id: string;
  is_active: boolean;
  subjects?: {
    name: string;
    code: string;
  };
  profiles?: {
    name: string;
    email: string;
  };
  classes?: {
    name: string;
  };
}

export const useAcademicPeriodIntegration = () => {
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current academic period
  const {
    data: currentPeriod,
    isLoading: loadingPeriod,
    error: periodError,
    refetch: refetchPeriod
  } = useQuery({
    queryKey: ['currentAcademicPeriod', schoolId],
    queryFn: async () => {
      if (!schoolId) return null;
      return await SystemIntegrationService.getCurrentAcademicPeriod(schoolId);
    },
    enabled: !!schoolId,
  });

  // Get available classes for current period
  const {
    data: availableClasses,
    isLoading: loadingClasses,
    error: classesError,
    refetch: refetchClasses
  } = useQuery({
    queryKey: ['availableClasses', schoolId, currentPeriod?.year?.id],
    queryFn: async () => {
      if (!schoolId) return [];
      const result = await SystemIntegrationService.getAvailableClasses(
        schoolId, 
        currentPeriod?.year?.id
      );
      return result.classes || [];
    },
    enabled: !!schoolId && !!currentPeriod?.year?.id,
  });

  // Get academic years
  const {
    data: academicYears,
    isLoading: loadingYears,
    error: yearsError,
    refetch: refetchYears
  } = useQuery({
    queryKey: ['academicYears', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .eq('school_id', schoolId)
        .order('start_date', { ascending: false });
      
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!schoolId,
  });

  // Get academic terms
  const {
    data: academicTerms,
    isLoading: loadingTerms,
    error: termsError,
    refetch: refetchTerms
  } = useQuery({
    queryKey: ['academicTerms', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await supabase
        .from('academic_terms')
        .select('*, academic_years(year_name)')
        .eq('school_id', schoolId)
        .order('start_date', { ascending: false });
      
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!schoolId,
  });

  // Set current academic year
  const setCurrentYear = useMutation({
    mutationFn: async (yearId: string) => {
      if (!schoolId) throw new Error('No school ID');
      
      // First, unset all current years for this school
      await supabase
        .from('academic_years')
        .update({ is_current: false })
        .eq('school_id', schoolId);
      
      // Then set the selected year as current
      const { error } = await supabase
        .from('academic_years')
        .update({ is_current: true })
        .eq('id', yearId)
        .eq('school_id', schoolId);
      
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Current academic year updated successfully." });
      refetchPeriod();
      refetchYears();
      refetchClasses();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: 'destructive' });
    }
  });

  // Set current academic term
  const setCurrentTerm = useMutation({
    mutationFn: async (termId: string) => {
      if (!schoolId) throw new Error('No school ID');
      
      // First, unset all current terms for this school
      await supabase
        .from('academic_terms')
        .update({ is_current: false })
        .eq('school_id', schoolId);
      
      // Then set the selected term as current
      const { error } = await supabase
        .from('academic_terms')
        .update({ is_current: true })
        .eq('id', termId)
        .eq('school_id', schoolId);
      
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Current academic term updated successfully." });
      refetchPeriod();
      refetchTerms();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: 'destructive' });
    }
  });

  // Get class students query
  const classStudentsQuery = useQuery({
    queryKey: ['classStudents', currentPeriod?.term?.id],
    queryFn: async () => {
      // This will be called with specific classId when needed
      return [];
    },
    enabled: false, // Disabled by default, will be enabled when needed
  });

  // Get class subjects query
  const classSubjectsQuery = useQuery({
    queryKey: ['classSubjects', currentPeriod?.term?.id],
    queryFn: async () => {
      // This will be called with specific classId when needed
      return [];
    },
    enabled: false, // Disabled by default, will be enabled when needed
  });

  // Get class examinations query
  const classExaminationsQuery = useQuery({
    queryKey: ['classExaminations', currentPeriod?.term?.id],
    queryFn: async () => {
      // This will be called with specific classId when needed
      return [];
    },
    enabled: false, // Disabled by default, will be enabled when needed
  });

  // Get class fee structure query
  const classFeeStructureQuery = useQuery({
    queryKey: ['classFeeStructure', currentPeriod?.term?.id],
    queryFn: async () => {
      // This will be called with specific classId when needed
      return [];
    },
    enabled: false, // Disabled by default, will be enabled when needed
  });

  // Helper functions to fetch data
  const getClassStudents = useCallback(async (classId: string, termId?: string) => {
    if (!classId) return [];
    const result = await SystemIntegrationService.getClassStudents(
      classId,
      termId || currentPeriod?.term?.id
    );
    return result.students || [];
  }, [currentPeriod?.term?.id]);

  const getClassSubjects = useCallback(async (classId: string, termId?: string) => {
    if (!classId) return [];
    const result = await SystemIntegrationService.getClassSubjects(
      classId,
      termId || currentPeriod?.term?.id
    );
    return result.subjects || [];
  }, [currentPeriod?.term?.id]);

  const getClassExaminations = useCallback(async (classId: string, termId?: string) => {
    if (!classId) return [];
    const result = await SystemIntegrationService.getClassExaminations(
      classId,
      termId || currentPeriod?.term?.id
    );
    return result.examinations || [];
  }, [currentPeriod?.term?.id]);

  const getClassFeeStructure = useCallback(async (classId: string, termId?: string) => {
    if (!classId) return [];
    const result = await SystemIntegrationService.getClassFeeStructure(
      classId,
      termId || currentPeriod?.term?.id
    );
    return result.fees || [];
  }, [currentPeriod?.term?.id]);

  // Enroll student in class
  const enrollStudent = useMutation({
    mutationFn: async ({
      studentId,
      classId,
      academicYearId,
      termId
    }: {
      studentId: string;
      classId: string;
      academicYearId: string;
      termId: string;
    }) => {
      return await SystemIntegrationService.enrollStudent(
        studentId,
        classId,
        academicYearId,
        termId
      );
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({ title: "Success", description: "Student enrolled successfully." });
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['classStudents'] });
        queryClient.invalidateQueries({ queryKey: ['students'] });
      } else {
        toast({ title: "Error", description: result.error || "Failed to enroll student", variant: 'destructive' });
      }
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: 'destructive' });
    }
  });

  // Assign subject to class
  const assignSubjectToClass = useMutation({
    mutationFn: async ({
      subjectId,
      classId,
      teacherId,
      academicYearId,
      termId
    }: {
      subjectId: string;
      classId: string;
      teacherId: string;
      academicYearId: string;
      termId: string;
    }) => {
      return await SystemIntegrationService.assignSubjectToClass(
        subjectId,
        classId,
        teacherId,
        academicYearId,
        termId
      );
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({ title: "Success", description: "Subject assigned successfully." });
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['classSubjects'] });
        queryClient.invalidateQueries({ queryKey: ['subjects'] });
      } else {
        toast({ title: "Error", description: result.error || "Failed to assign subject", variant: 'destructive' });
      }
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: 'destructive' });
    }
  });

  // Create examination schedule
  const createExaminationSchedule = useMutation({
    mutationFn: async (examinationData: {
      name: string;
      start_date: string;
      end_date: string;
      academic_year_id: string;
      term_id: string;
      class_id: string;
      description?: string;
    }) => {
      const scheduleData = {
        ...examinationData,
        is_active: true,
        type: 'examination',
        class_ids: [examinationData.class_id]
      };
      return await SystemIntegrationService.createExaminationSchedule(scheduleData);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({ title: "Success", description: "Examination schedule created successfully." });
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['examinations'] });
        queryClient.invalidateQueries({ queryKey: ['classExaminations'] });
      } else {
        toast({ title: "Error", description: result.error || "Failed to create examination schedule", variant: 'destructive' });
      }
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: 'destructive' });
    }
  });

  // Create fee structure
  const createFeeStructure = useMutation({
    mutationFn: async (feeData: Record<string, unknown>) => {
      const structureData = {
        academic_year_id: String(feeData.academic_year_id || ''),
        class_id: String(feeData.class_id || ''),
        term_id: String(feeData.term_id || ''),
        name: String(feeData.name || 'Fee'),
        is_active: true,
        amount: Number(feeData.amount || 0),
        currency: String(feeData.currency || 'KES'),
        category: String(feeData.category || 'tuition'),
        due_date: String(feeData.due_date || new Date().toISOString().split('T')[0])
      };
      return await SystemIntegrationService.createFeeStructure(structureData);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({ title: "Success", description: "Fee structure created successfully." });
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['feeStructures'] });
        queryClient.invalidateQueries({ queryKey: ['classFeeStructure'] });
      } else {
        toast({ title: "Error", description: result.error || "Failed to create fee structure", variant: 'destructive' });
      }
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: 'destructive' });
    }
  });

  // Promote students
  const promoteStudents = useMutation({
    mutationFn: async ({
      currentClassId,
      nextClassId,
      academicYearId,
      termId,
      studentIds
    }: {
      currentClassId: string;
      nextClassId: string;
      academicYearId: string;
      termId: string;
      studentIds?: string[];
    }) => {
      return await SystemIntegrationService.promoteStudents(
        currentClassId,
        nextClassId,
        academicYearId,
        termId,
        studentIds
      );
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({ 
          title: "Success", 
          description: `${result.promotedCount} students promoted successfully.` 
        });
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['classStudents'] });
        queryClient.invalidateQueries({ queryKey: ['students'] });
        queryClient.invalidateQueries({ queryKey: ['availableClasses'] });
      } else {
        toast({ title: "Error", description: result.error || "Failed to promote students", variant: 'destructive' });
      }
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: 'destructive' });
    }
  });

  // Get student profile
  const getStudentProfile = useCallback(async (studentId: string) => {
    if (!studentId) return null;
    const result = await SystemIntegrationService.getStudentProfile(studentId);
    return result.profile;
  }, []);

  // Get class analytics
  const getClassAnalytics = useCallback(async (classId: string, termId?: string) => {
    if (!classId) return null;
    const result = await SystemIntegrationService.getClassAnalytics(
      classId,
      termId || currentPeriod?.term?.id || ''
    );
    return result.analytics;
  }, [currentPeriod?.term?.id]);

  // Validate relationships
  const validateRelationships = useCallback(async (operation: string, data: Record<string, unknown>) => {
    return await SystemIntegrationService.validateRelationships(operation, data);
  }, []);

  // Check if current period is set
  const isCurrentPeriodSet = !!(currentPeriod?.year?.id && currentPeriod?.term?.id);

  // Get loading states
  const isLoading = loadingPeriod || loadingClasses || loadingYears || loadingTerms;

  // Get error states
  const hasError = periodError || classesError || yearsError || termsError;

  // Refetch all data
  const refetchAll = () => {
    refetchPeriod();
    refetchClasses();
    refetchYears();
    refetchTerms();
  };

  return {
    // Data
    currentPeriod,
    availableClasses,
    academicYears,
    academicTerms,
    
    // Loading states
    isLoading,
    loadingPeriod,
    loadingClasses,
    loadingYears,
    loadingTerms,
    
    // Error states
    hasError,
    periodError,
    classesError,
    yearsError,
    termsError,
    
    // Mutations
    setCurrentYear,
    setCurrentTerm,
    enrollStudent,
    assignSubjectToClass,
    createExaminationSchedule,
    createFeeStructure,
    promoteStudents,
    
    // Query functions
    getClassStudents,
    getClassSubjects,
    getClassExaminations,
    getClassFeeStructure,
    getStudentProfile,
    getClassAnalytics,
    
    // Utility functions
    validateRelationships,
    isCurrentPeriodSet,
    refetchAll,
    refetchPeriod,
    refetchClasses,
    refetchYears,
    refetchTerms,
  };
}; 