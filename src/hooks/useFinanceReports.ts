
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from './useSchoolScopedData';

interface ReportFilters {
  reportType: 'individual_student' | 'class_financial' | 'school_financial';
  studentId?: string;
  classId?: string;
  academicYear?: string;
  term?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface ReportResponse {
  success?: boolean;
  error?: string;
  school?: any;
  report_type?: string;
  generated_at?: string;
  academic_year?: string;
  term?: string;
  data?: any;
}

export const useFinanceReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { schoolId, isSystemAdmin } = useSchoolScopedData();

  const generateReport = async (filters: ReportFilters) => {
    if (!schoolId && !isSystemAdmin) {
      const message = 'School ID is required to generate reports';
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return { data: null, error: message };
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Generating finance report with filters:', filters);

      const { data, error: reportError } = await supabase.rpc('generate_finance_report', {
        p_report_type: filters.reportType,
        p_school_id: isSystemAdmin ? null : schoolId,
        p_class_id: filters.classId || null,
        p_student_id: filters.studentId || null,
        p_academic_year: filters.academicYear || null,
        p_term: filters.term || null
      });

      if (reportError) {
        console.error('Report generation error:', reportError);
        throw new Error(`Failed to generate report: ${reportError.message}`);
      }

      // Type cast the response to handle JSON structure
      const response = data as ReportResponse;

      if (response?.error) {
        throw new Error(response.error);
      }

      console.log('Generated report:', response);
      
      toast({
        title: "Success",
        description: "Financial report generated successfully",
      });

      return { data: response, error: null };
    } catch (err: any) {
      const message = err?.message || 'Failed to generate report';
      console.error('Report generation error:', err);
      setError(message);
      toast({
        title: "Error Generating Report",
        description: message,
        variant: "destructive",
      });
      return { data: null, error: message };
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (reportData: any, filename: string) => {
    try {
      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Report downloaded successfully",
      });
    } catch (err) {
      console.error('Download error:', err);
      toast({
        title: "Download Error",
        description: "Failed to download report",
        variant: "destructive",
      });
    }
  };

  return {
    generateReport,
    downloadReport,
    loading,
    error
  };
};
