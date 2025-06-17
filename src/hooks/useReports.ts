
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { Report, ReportFilters, ReportGenerationRequest, StudentReportData, ClassReportData } from '@/types/report';

export const useReports = (filters?: ReportFilters) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();

  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['reports', filters, schoolId],
    queryFn: async () => {
      let query = supabase
        .from('reports')
        .select(`
          *,
          school:schools(name, logo_url, address, phone, email),
          generated_by_profile:profiles!reports_generated_by_fkey(name)
        `)
        .order('generated_at', { ascending: false });

      if (filters?.school_id && user?.role === 'edufam_admin') {
        query = query.eq('school_id', filters.school_id);
      } else if (schoolId && user?.role !== 'edufam_admin') {
        query = query.eq('school_id', schoolId);
      }
      
      if (filters?.report_type) {
        query = query.eq('report_type', filters.report_type);
      }

      // Role-based filtering
      if (user?.role === 'finance_officer') {
        query = query.eq('report_type', 'financial');
      }

      if (user?.role === 'parent') {
        // Parents can only see their child's reports
        query = query.eq('report_type', 'individual_academic');
        // Additional filtering by student_id will be handled by RLS
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Report[];
    },
    enabled: !!user?.id,
  });

  const generateStudentReportMutation = useMutation({
    mutationFn: async (request: ReportGenerationRequest) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Get student report data using the database function
      const { data: reportData, error: reportError } = await supabase
        .rpc('get_student_report_data', {
          p_student_id: request.student_id,
          p_academic_year: request.academic_year,
          p_term: request.term
        });

      if (reportError) throw reportError;

      // Store the generated report
      const { data, error } = await supabase
        .from('reports')
        .insert({
          school_id: schoolId,
          generated_by: user.id,
          report_type: request.report_type,
          report_data: reportData,
          filters: request.filters || {}
        })
        .select()
        .single();

      if (error) throw error;
      return { report: data, reportData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: "Success",
        description: "Student report generated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate student report",
        variant: "destructive",
      });
    },
  });

  const generateClassReportMutation = useMutation({
    mutationFn: async (request: ReportGenerationRequest) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Get class report data using the database function
      const { data: reportData, error: reportError } = await supabase
        .rpc('get_class_report_data', {
          p_class_id: request.class_id,
          p_academic_year: request.academic_year,
          p_term: request.term
        });

      if (reportError) throw reportError;

      // Store the generated report
      const { data, error } = await supabase
        .from('reports')
        .insert({
          school_id: schoolId,
          generated_by: user.id,
          report_type: request.report_type,
          report_data: reportData,
          filters: request.filters || {}
        })
        .select()
        .single();

      if (error) throw error;
      return { report: data, reportData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: "Success",
        description: "Class report generated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate class report",
        variant: "destructive",
      });
    },
  });

  const deleteReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: "Success",
        description: "Report deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete report",
        variant: "destructive",
      });
    },
  });

  const canGenerateReports = () => {
    return ['principal', 'finance_officer', 'edufam_admin'].includes(user?.role || '');
  };

  const canViewReports = () => {
    return ['principal', 'school_owner', 'finance_officer', 'parent', 'edufam_admin'].includes(user?.role || '');
  };

  const getAvailableReportTypes = () => {
    switch (user?.role) {
      case 'finance_officer':
        return ['financial'];
      case 'parent':
        return ['individual_academic'];
      case 'principal':
      case 'edufam_admin':
        return ['individual_academic', 'class_academic', 'financial', 'attendance'];
      default:
        return [];
    }
  };

  return {
    reports,
    isLoading,
    error,
    generateStudentReport: generateStudentReportMutation.mutate,
    generateClassReport: generateClassReportMutation.mutate,
    isGeneratingStudent: generateStudentReportMutation.isPending,
    isGeneratingClass: generateClassReportMutation.isPending,
    deleteReport: deleteReportMutation.mutate,
    isDeleting: deleteReportMutation.isPending,
    canGenerateReports: canGenerateReports(),
    canViewReports: canViewReports(),
    availableReportTypes: getAvailableReportTypes(),
  };
};
