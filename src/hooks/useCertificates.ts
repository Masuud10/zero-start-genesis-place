
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from './useSchoolScopedData';
import { supabase } from '@/integrations/supabase/client';

interface CertificateStudent {
  id: string;
  name: string;
  admission_number: string;
  roll_number?: string;
}

interface CertificatePerformance {
  student: {
    id: string;
    name: string;
    admission_number: string;
    roll_number?: string;
    school_id: string;
  };
  school: {
    id: string;
    name: string;
    location?: string;
    address?: string;
    phone?: string;
    email?: string;
    logo_url?: string;
    motto?: string;
    slogan?: string;
    principal_name?: string;
    principal_contact?: string;
  };
  performance: {
    total_marks: number;
    possible_marks: number;
    average_score: number;
    grade_letter?: string;
    total_subjects: number;
    class_position?: number;
    subjects_performance?: Array<{
      subject_name: string;
      subject_code: string;
      score: number;
      max_score: number;
      percentage: number;
      grade: string;
    }>;
  };
  attendance: {
    total_days: number;
    present_days: number;
    absent_days: number;
    attendance_percentage: number;
  };
  academic_year: string;
  class_id: string;
}

export const useCertificates = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { schoolId } = useSchoolScopedData();

  const generateCertificate = useCallback(async (
    studentId: string,
    classId: string,
    academicYear: string
  ): Promise<CertificatePerformance | null> => {
    if (!schoolId) {
      toast({
        title: "Error",
        description: "No school context found",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    try {
      console.log('Generating certificate for:', { studentId, classId, academicYear, schoolId });

      // Call the Supabase function to get certificate data
      const { data: performanceData, error: performanceError } = await supabase
        .rpc('get_student_certificate_data', {
          p_student_id: studentId,
          p_academic_year: academicYear,
          p_class_id: classId
        });

      if (performanceError) {
        console.error('Performance data error:', performanceError);
        throw new Error(performanceError.message || 'Failed to fetch certificate data');
      }

      if (!performanceData) {
        throw new Error('No performance data found for certificate generation');
      }

      // Type assertion for the performance data
      const typedPerformanceData = performanceData as unknown as CertificatePerformance;

      // Save certificate record
      const { data: certificate, error: saveError } = await supabase
        .from('certificates')
        .insert({
          student_id: studentId,
          class_id: classId,
          academic_year: academicYear,
          performance: typedPerformanceData as any, // Convert to Json type for database
          school_id: schoolId,
          generated_by: (await supabase.auth.getUser()).data.user?.id || '',
          generated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (saveError) {
        console.error('Certificate save error:', saveError);
        throw new Error(saveError.message || 'Failed to save certificate');
      }

      toast({
        title: "Success",
        description: "Certificate generated successfully"
      });

      return typedPerformanceData;
    } catch (error: any) {
      console.error('Certificate generation failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate certificate",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [schoolId, toast]);

  const getCertificates = useCallback(async (studentId?: string) => {
    if (!schoolId) return [];

    try {
      let query = supabase
        .from('certificates')
        .select(`
          *,
          students!inner(name, admission_number)
        `)
        .eq('school_id', schoolId)
        .order('generated_at', { ascending: false });

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching certificates:', error);
        throw error;
      }

      return data || [];
    } catch (error: any) {
      console.error('Error fetching certificates:', error);
      return [];
    }
  }, [schoolId]);

  return {
    generateCertificate,
    getCertificates,
    loading
  };
};
