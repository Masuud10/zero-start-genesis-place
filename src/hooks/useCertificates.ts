
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Certificate, CertificateGenerationRequest, CertificateFilters, CertificatePerformance } from '@/types/certificate';

export const useCertificates = (filters?: CertificateFilters) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: certificates, isLoading, error } = useQuery({
    queryKey: ['certificates', filters],
    queryFn: async () => {
      let query = supabase
        .from('certificates')
        .select(`
          *,
          school:schools(name, logo_url, address, phone, email),
          student:students(name, admission_number),
          class:classes(name, level),
          generated_by_profile:profiles!certificates_generated_by_fkey(name)
        `)
        .order('generated_at', { ascending: false });

      if (filters?.school_id) {
        query = query.eq('school_id', filters.school_id);
      }
      
      if (filters?.academic_year) {
        query = query.eq('academic_year', filters.academic_year);
      }
      
      if (filters?.class_id) {
        query = query.eq('class_id', filters.class_id);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      // Transform the data to match our Certificate type
      const transformedData: Certificate[] = (data || []).map((item: any) => ({
        ...item,
        performance: item.performance as CertificatePerformance,
      }));

      return transformedData;
    },
  });

  const generateCertificateMutation = useMutation({
    mutationFn: async (request: CertificateGenerationRequest) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // First get the student certificate data
      const { data: performanceData, error: performanceError } = await supabase
        .rpc('get_student_certificate_data', {
          p_student_id: request.student_id,
          p_academic_year: request.academic_year,
          p_class_id: request.class_id
        });

      if (performanceError) throw performanceError;

      // Create certificate record
      const { data, error } = await supabase
        .from('certificates')
        .insert({
          student_id: request.student_id,
          class_id: request.class_id,
          academic_year: request.academic_year,
          performance: performanceData,
          school_id: (performanceData as any).student.school_id,
          generated_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      toast({
        title: "Success",
        description: "Certificate generated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate certificate",
        variant: "destructive",
      });
    },
  });

  const deleteCertificateMutation = useMutation({
    mutationFn: async (certificateId: string) => {
      const { error } = await supabase
        .from('certificates')
        .delete()
        .eq('id', certificateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      toast({
        title: "Success",
        description: "Certificate deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete certificate",
        variant: "destructive",
      });
    },
  });

  return {
    certificates,
    isLoading,
    error,
    generateCertificate: generateCertificateMutation.mutate,
    isGenerating: generateCertificateMutation.isPending,
    deleteCertificate: deleteCertificateMutation.mutate,
    isDeleting: deleteCertificateMutation.isPending,
  };
};
