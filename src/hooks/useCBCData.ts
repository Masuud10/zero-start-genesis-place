import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  CBCStrand,
  CBCSubStrand,
  CBCLearningOutcome,
  CBCAssessmentType,
  CBCAssessment,
  CBCStudentAssessment,
  CBCPerformanceLevel,
  CBCTermSummary,
  CBCAssessmentTemplate,
  CBCStrandFormData,
  CBCSubStrandFormData,
  CBCLearningOutcomeFormData,
  CBCAssessmentFormData,
  CBCStudentAssessmentFormData,
  CBCTermSummaryFormData,
  CBCPerformanceAnalytics,
} from '@/types/cbc';

// Hook for CBC Learning Areas (existing table)
export const useCBCLearningAreas = (subjectId?: string, classId?: string) => {
  const { schoolId } = useSchoolScopedData();

  return useQuery({
    queryKey: ['cbc-learning-areas', schoolId, subjectId, classId],
    queryFn: async () => {
      if (!schoolId) throw new Error('School ID is required');

      let query = supabase
        .from('cbc_learning_areas')
        .select('*')
        .eq('school_id', schoolId);

      if (subjectId) query = query.eq('subject_id', subjectId);

      const { data, error } = await query.order('learning_area_name');

      if (error) throw error;
      return data as any[];
    },
    enabled: !!schoolId,
  });
};

// Hook for CBC Performance Descriptors (existing table)
export const useCBCPerformanceDescriptors = (learningAreaId?: string) => {
  const { schoolId } = useSchoolScopedData();

  return useQuery({
    queryKey: ['cbc-performance-descriptors', schoolId, learningAreaId],
    queryFn: async () => {
      if (!schoolId) throw new Error('School ID is required');

      let query = supabase
        .from('cbc_performance_descriptors')
        .select('*')
        .eq('school_id', schoolId);

      if (learningAreaId) query = query.eq('learning_area_id', learningAreaId);

      const { data, error } = await query.order('performance_level');

      if (error) throw error;
      return data as any[];
    },
    enabled: !!schoolId,
  });
};

// Hook for CBC Grades (existing table)
export const useCBCGrades = (
  classId?: string,
  subjectId?: string,
  term?: string,
  academicYear?: string
) => {
  const { schoolId } = useSchoolScopedData();

  return useQuery({
    queryKey: ['cbc-grades', schoolId, classId, subjectId, term, academicYear],
    queryFn: async () => {
      if (!schoolId) throw new Error('School ID is required');

      let query = supabase
        .from('cbc_grades')
        .select(`
          *,
          learning_area:cbc_learning_areas(*),
          student:students(id, first_name, last_name, admission_number)
        `)
        .eq('school_id', schoolId);

      if (classId) query = query.eq('class_id', classId);
      if (subjectId) query = query.eq('learning_area_id', subjectId);
      if (term) query = query.eq('term', term);
      if (academicYear) query = query.eq('academic_year', academicYear);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!schoolId,
  });
};

// Hook for CBC Strand Assessments (existing table)
export const useCBCStrandAssessments = (
  classId?: string,
  subjectId?: string,
  term?: string,
  academicYear?: string
) => {
  const { schoolId } = useSchoolScopedData();

  return useQuery({
    queryKey: ['cbc-strand-assessments', schoolId, classId, subjectId, term, academicYear],
    queryFn: async () => {
      if (!schoolId) throw new Error('School ID is required');

      let query = supabase
        .from('cbc_strand_assessments')
        .select(`
          *,
          competency:cbc_competencies(*),
          student:students(id, first_name, last_name, admission_number)
        `)
        .eq('school_id', schoolId);

      if (classId) query = query.eq('class_id', classId);
      if (subjectId) query = query.eq('subject_id', subjectId);
      if (term) query = query.eq('term', term);
      if (academicYear) query = query.eq('academic_year', academicYear);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!schoolId,
  });
};

// Hook for CBC Performance Summary (existing table)
export const useCBCPerformanceSummary = (
  classId?: string,
  subjectId?: string,
  term?: string,
  academicYear?: string
) => {
  const { schoolId } = useSchoolScopedData();

  return useQuery({
    queryKey: ['cbc-performance-summary', schoolId, classId, subjectId, term, academicYear],
    queryFn: async () => {
      if (!schoolId) throw new Error('School ID is required');

      let query = supabase
        .from('cbc_performance_summary')
        .select(`
          *,
          student:students(id, first_name, last_name, admission_number)
        `)
        .eq('school_id', schoolId);

      if (classId) query = query.eq('class_id', classId);
      if (subjectId) query = query.eq('subject_id', subjectId);
      if (term) query = query.eq('term', term);
      if (academicYear) query = query.eq('academic_year', academicYear);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!schoolId,
  });
};

// Hook for CBC Competencies (existing table)
export const useCBCCompetencies = (subjectId?: string, classId?: string) => {
  const { schoolId } = useSchoolScopedData();

  return useQuery({
    queryKey: ['cbc-competencies', schoolId, subjectId, classId],
    queryFn: async () => {
      if (!schoolId) throw new Error('School ID is required');

      let query = supabase
        .from('cbc_competencies')
        .select('*')
        .eq('school_id', schoolId);

      if (subjectId) query = query.eq('subject_id', subjectId);
      if (classId) query = query.eq('class_id', classId);

      const { data, error } = await query.order('competency_name');

      if (error) throw error;
      return data as any[];
    },
    enabled: !!schoolId,
  });
};

// Mutations for existing CBC tables
export const useCreateCBCGrade = () => {
  const { schoolId } = useSchoolScopedData();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      student_id: string;
      class_id: string;
      learning_area_id: string;
      term: string;
      academic_year: string;
      performance_level: string;
      performance_descriptor?: string;
      teacher_remarks?: string;
    }) => {
      if (!schoolId || !user) throw new Error('School ID and user are required');

      const { data: result, error } = await supabase
        .from('cbc_grades')
        .insert({
          ...data,
          school_id: schoolId,
          teacher_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cbc-grades'] });
      queryClient.invalidateQueries({ queryKey: ['cbc-performance-summary'] });
      toast({
        title: 'Success',
        description: 'CBC grade saved successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateCBCGrade = () => {
  const { schoolId } = useSchoolScopedData();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<any> }) => {
      if (!schoolId || !user) throw new Error('School ID and user are required');

      const { data: result, error } = await supabase
        .from('cbc_grades')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('school_id', schoolId)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cbc-grades'] });
      queryClient.invalidateQueries({ queryKey: ['cbc-performance-summary'] });
      toast({
        title: 'Success',
        description: 'CBC grade updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useCreateCBCStrandAssessment = () => {
  const { schoolId } = useSchoolScopedData();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      student_id: string;
      subject_id: string;
      class_id: string;
      competency_id?: string;
      strand_name: string;
      sub_strand_name?: string;
      assessment_type: string;
      performance_level: string;
      teacher_remarks?: string;
      term: string;
      academic_year: string;
    }) => {
      if (!schoolId || !user) throw new Error('School ID and user are required');

      const { data: result, error } = await supabase
        .from('cbc_strand_assessments')
        .insert({
          ...data,
          school_id: schoolId,
          teacher_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cbc-strand-assessments'] });
      queryClient.invalidateQueries({ queryKey: ['cbc-performance-summary'] });
      toast({
        title: 'Success',
        description: 'Strand assessment saved successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Main CBC data hook that returns all CBC-related hooks
export const useCBCData = () => {
  return {
    useCBCLearningAreas,
    useCBCPerformanceDescriptors,
    useCBCGrades,
    useCBCStrandAssessments,
    useCBCPerformanceSummary,
    useCBCCompetencies,
    useCreateCBCGrade,
    useUpdateCBCGrade,
    useCreateCBCStrandAssessment,
  };
}; 