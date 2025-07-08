import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';
import { AcademicIntegrationService, AcademicContext, ModuleIntegrationData } from '@/services/AcademicIntegrationService';
import { supabase } from '@/integrations/supabase/client';

export interface AcademicModuleState {
  context: AcademicContext | null;
  isLoading: boolean;
  error: string | null;
  data: ModuleIntegrationData;
  isValid: boolean;
}

export interface AcademicModuleActions {
  setContext: (context: Partial<AcademicContext>) => void;
  refreshData: () => void;
  createExamination: (data: any) => Promise<{ success: boolean; error?: string }>;
  recordAttendance: (data: any[]) => Promise<{ success: boolean; error?: string }>;
  saveGrades: (data: any[]) => Promise<{ success: boolean; error?: string }>;
  generateReport: (type: string, filters?: any) => Promise<{ success: boolean; error?: string; data?: any }>;
  getAnalytics: () => Promise<{ success: boolean; error?: string; data?: any }>;
}

export const useAcademicModuleIntegration = (
  initialModules: ('examinations' | 'attendance' | 'grades' | 'reports' | 'analytics')[] = []
) => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [context, setContextState] = useState<AcademicContext | null>(null);
  const [modules, setModules] = useState(initialModules);

  // Get current academic period
  const { data: currentPeriod, isLoading: loadingPeriod } = useQuery({
    queryKey: ['currentAcademicPeriod', schoolId],
    queryFn: async () => {
      if (!schoolId) return null;
      
      const { data: year, error: yearError } = await supabase
        .from('academic_years')
        .select('*')
        .eq('school_id', schoolId)
        .eq('is_current', true)
        .single();

      if (yearError) return null;

      const { data: term, error: termError } = await supabase
        .from('academic_terms')
        .select('*')
        .eq('school_id', schoolId)
        .eq('is_current', true)
        .single();

      if (termError) return null;

      return { year, term };
    },
    enabled: !!schoolId,
  });

  // Initialize context when current period is loaded
  useEffect(() => {
    if (currentPeriod?.year && currentPeriod?.term && schoolId) {
      setContextState({
        academic_year_id: currentPeriod.year.id,
        term_id: currentPeriod.term.id,
        school_id: schoolId
      });
    }
  }, [currentPeriod, schoolId]);

  // Validate academic context
  const { data: validation, isLoading: validating } = useQuery({
    queryKey: ['academicContextValidation', context],
    queryFn: async () => {
      if (!context) return { isValid: false, errors: ['No context provided'] };
      return await AcademicIntegrationService.validateAcademicContext(
        context.school_id,
        context.academic_year_id,
        context.term_id,
        context.class_id,
        context.subject_id
      );
    },
    enabled: !!context,
  });

  // Fetch academic module data
  const { data: moduleData, isLoading: loadingData, error: dataError } = useQuery({
    queryKey: ['academicModuleData', context, modules],
    queryFn: async () => {
      if (!context || !validation?.isValid) {
        return {
          examinations: [],
          attendance: [],
          grades: [],
          reports: [],
          analytics: {}
        };
      }
      return await AcademicIntegrationService.getAcademicModuleData(context, modules);
    },
    enabled: !!context && validation?.isValid && modules.length > 0,
  });

  // Set context with validation
  const setContext = useCallback((newContext: Partial<AcademicContext>) => {
    if (!schoolId) return;
    
    setContextState(prev => ({
      ...prev,
      ...newContext,
      school_id: schoolId
    } as AcademicContext));
  }, [schoolId]);

  // Refresh data
  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['academicModuleData'] });
    queryClient.invalidateQueries({ queryKey: ['currentAcademicPeriod'] });
    queryClient.invalidateQueries({ queryKey: ['academicContextValidation'] });
  }, [queryClient]);

  // Create examination mutation
  const createExaminationMutation = useMutation({
    mutationFn: async (examinationData: any) => {
      if (!context || !user?.id) {
        throw new Error('Invalid context or user');
      }

      // Validate permissions
      const permissionCheck = await AcademicIntegrationService.validateUserPermissions(
        user.id,
        context.school_id,
        'create_examination',
        context
      );

      if (!permissionCheck.canPerform) {
        throw new Error(permissionCheck.error || 'Insufficient permissions');
      }

      const result = await AcademicIntegrationService.createExamination(
        examinationData,
        context,
        user.id
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to create examination');
      }

      return result.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Examination created successfully",
      });
      refreshData();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create examination",
        variant: "destructive",
      });
    }
  });

  // Record attendance mutation
  const recordAttendanceMutation = useMutation({
    mutationFn: async (attendanceData: any[]) => {
      if (!context || !user?.id) {
        throw new Error('Invalid context or user');
      }

      // Validate permissions
      const permissionCheck = await AcademicIntegrationService.validateUserPermissions(
        user.id,
        context.school_id,
        'record_attendance',
        context
      );

      if (!permissionCheck.canPerform) {
        throw new Error(permissionCheck.error || 'Insufficient permissions');
      }

      const result = await AcademicIntegrationService.recordAttendance(
        attendanceData,
        context,
        user.id
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to record attendance');
      }

      return result.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Attendance recorded successfully",
      });
      refreshData();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record attendance",
        variant: "destructive",
      });
    }
  });

  // Save grades mutation
  const saveGradesMutation = useMutation({
    mutationFn: async (gradesData: any[]) => {
      if (!context || !user?.id) {
        throw new Error('Invalid context or user');
      }

      // Validate permissions
      const permissionCheck = await AcademicIntegrationService.validateUserPermissions(
        user.id,
        context.school_id,
        'enter_grades',
        context
      );

      if (!permissionCheck.canPerform) {
        throw new Error(permissionCheck.error || 'Insufficient permissions');
      }

      const result = await AcademicIntegrationService.saveGrades(
        gradesData,
        context,
        user.id,
        user.role || 'teacher'
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to save grades');
      }

      return result.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Grades saved successfully",
      });
      refreshData();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save grades",
        variant: "destructive",
      });
    }
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: async ({ type, filters }: { type: string; filters?: any }) => {
      if (!context || !user?.id) {
        throw new Error('Invalid context or user');
      }

      // Validate permissions
      const permissionCheck = await AcademicIntegrationService.validateUserPermissions(
        user.id,
        context.school_id,
        'generate_reports',
        context
      );

      if (!permissionCheck.canPerform) {
        throw new Error(permissionCheck.error || 'Insufficient permissions');
      }

      const result = await AcademicIntegrationService.generateReport(
        type,
        context,
        user.id,
        filters
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate report');
      }

      return result.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Report generated successfully",
      });
      refreshData();
      return data;
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate report",
        variant: "destructive",
      });
    }
  });

  // Get analytics
  const getAnalytics = useCallback(async () => {
    if (!context) {
      return { success: false, error: 'No context available' };
    }

    try {
      const result = await AcademicIntegrationService.getRealTimeAnalytics(context);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [context]);

  // Action handlers
  const createExamination = useCallback(async (data: any) => {
    try {
      await createExaminationMutation.mutateAsync(data);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [createExaminationMutation]);

  const recordAttendance = useCallback(async (data: any[]) => {
    try {
      await recordAttendanceMutation.mutateAsync(data);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [recordAttendanceMutation]);

  const saveGrades = useCallback(async (data: any[]) => {
    try {
      await saveGradesMutation.mutateAsync(data);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [saveGradesMutation]);

  const generateReport = useCallback(async (type: string, filters?: any) => {
    try {
      const data = await generateReportMutation.mutateAsync({ type, filters });
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [generateReportMutation]);

  // State
  const state: AcademicModuleState = {
    context,
    isLoading: loadingPeriod || validating || loadingData,
    error: dataError?.message || null,
    data: moduleData || {
      examinations: [],
      attendance: [],
      grades: [],
      reports: [],
      analytics: {}
    },
    isValid: validation?.isValid || false
  };

  // Actions
  const actions: AcademicModuleActions = {
    setContext,
    refreshData,
    createExamination,
    recordAttendance,
    saveGrades,
    generateReport,
    getAnalytics
  };

  return {
    ...state,
    ...actions,
    // Additional utilities
    currentPeriod,
    validation,
    isCreatingExamination: createExaminationMutation.isPending,
    isRecordingAttendance: recordAttendanceMutation.isPending,
    isSavingGrades: saveGradesMutation.isPending,
    isGeneratingReport: generateReportMutation.isPending,
    // Add modules to context
    addModules: (newModules: typeof modules) => {
      setModules(prev => [...new Set([...prev, ...newModules])]);
    },
    removeModules: (modulesToRemove: typeof modules) => {
      setModules(prev => prev.filter(m => !modulesToRemove.includes(m)));
    }
  };
}; 