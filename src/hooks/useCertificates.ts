
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
      
      if (error) {
        console.error('Certificate fetch error:', error);
        throw error;
      }

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
      console.log('🔄 Starting certificate generation with request:', request);
      
      if (!user?.id) {
        console.error('❌ Certificate Generation Error: User not authenticated');
        throw new Error('User not authenticated');
      }

      if (!user?.school_id && user?.role !== 'edufam_admin') {
        console.error('❌ Certificate Generation Error: User has no school assignment');
        throw new Error('User must be assigned to a school');
      }

      // Validation: Check required fields
      if (!request.student_id || !request.class_id || !request.academic_year) {
        console.error('❌ Certificate Generation Error: Missing required fields:', {
          student_id: !!request.student_id,
          class_id: !!request.class_id,
          academic_year: !!request.academic_year
        });
        throw new Error('Missing required fields for certificate generation');
      }

      try {
        console.log('🔍 Fetching student certificate data...');
        
        // First get the student certificate data
        const { data: performanceData, error: performanceError } = await supabase
          .rpc('get_student_certificate_data', {
            p_student_id: request.student_id,
            p_academic_year: request.academic_year,
            p_class_id: request.class_id
          });

        if (performanceError) {
          console.error('❌ Performance Data Error:', performanceError);
          throw new Error(`Failed to fetch student data: ${performanceError.message}`);
        }

        if (!performanceData) {
          console.error('❌ No performance data returned for student');
          throw new Error('No performance data found for this student and academic year');
        }

        console.log('✅ Performance data fetched successfully:', performanceData);

        // Validate that we have the required performance data structure
        if (!performanceData.student || !performanceData.school) {
          console.error('❌ Invalid performance data structure:', performanceData);
          throw new Error('Invalid performance data structure - missing student or school data');
        }

        // Prepare certificate payload with all required fields
        const certificatePayload = {
          student_id: request.student_id,
          class_id: request.class_id,
          academic_year: request.academic_year,
          performance: performanceData,
          school_id: user.role === 'edufam_admin' ? performanceData.student.school_id : user.school_id,
          generated_by: user.id,
          generated_at: new Date().toISOString()
        };

        console.log('📤 Inserting certificate with payload:', {
          ...certificatePayload,
          performance: '[PERFORMANCE_DATA]' // Don't log the full performance data
        });

        // Create certificate record
        const { data: certificateData, error: insertError } = await supabase
          .from('certificates')
          .insert(certificatePayload)
          .select()
          .single();

        if (insertError) {
          console.error('❌ Certificate Insert Error:', {
            error: insertError,
            code: insertError.code,
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint
          });
          
          // Provide more specific error messages based on error codes
          if (insertError.code === '23503') {
            throw new Error('Invalid reference data - please check student, class, or school information');
          } else if (insertError.code === '42501') {
            throw new Error('Permission denied - you may not have access to generate certificates for this school');
          } else if (insertError.code === '23505') {
            throw new Error('Certificate already exists for this student and academic year');
          } else {
            throw new Error(`Database error: ${insertError.message}`);
          }
        }

        if (!certificateData) {
          console.error('❌ No certificate data returned after insert');
          throw new Error('Certificate was not created successfully');
        }

        console.log('✅ Certificate created successfully:', certificateData.id);
        return certificateData;

      } catch (error: any) {
        console.error('❌ Unhandled Certificate Generation Error:', error);
        
        // Re-throw with more context if it's a generic error
        if (error.message === 'Something went wrong') {
          throw new Error('Certificate generation failed - please check your data and try again');
        }
        
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('🎉 Certificate generation successful:', data.id);
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      toast({
        title: "Success",
        description: "Certificate generated successfully",
      });
    },
    onError: (error: any) => {
      console.error('💥 Certificate generation failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate certificate",
        variant: "destructive",
      });
    },
  });

  const deleteCertificateMutation = useMutation({
    mutationFn: async (certificateId: string) => {
      console.log('🗑️ Deleting certificate:', certificateId);
      
      const { error } = await supabase
        .from('certificates')
        .delete()
        .eq('id', certificateId);

      if (error) {
        console.error('❌ Certificate Delete Error:', error);
        throw error;
      }

      console.log('✅ Certificate deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      toast({
        title: "Success",
        description: "Certificate deleted successfully",
      });
    },
    onError: (error: any) => {
      console.error('💥 Certificate deletion failed:', error);
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
