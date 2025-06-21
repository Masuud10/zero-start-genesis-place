
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ReportFilters {
  reportType: 'school_financial' | 'class_financial' | 'individual_student';
  academicYear?: string;
  term?: string;
  classId?: string;
  studentId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const useFinanceReports = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateReport = async (filters: ReportFilters) => {
    if (!user?.school_id) {
      toast({
        title: "Error",
        description: "No school associated with user",
        variant: "destructive",
      });
      return { error: 'No school associated with user' };
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('generate_finance_report', {
        p_report_type: filters.reportType,
        p_school_id: user.school_id,
        p_class_id: filters.classId || null,
        p_student_id: filters.studentId || null,
        p_academic_year: filters.academicYear || null,
        p_term: filters.term || null,
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Success",
        description: "Report generated successfully",
      });

      return { data, error: null };
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Failed to generate report: ${err.message}`,
        variant: "destructive",
      });
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (reportData: any, filename: string) => {
    try {
      // Convert JSON data to CSV format
      const csvContent = convertToCSV(reportData);
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Report downloaded successfully",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Failed to download report: ${err.message}`,
        variant: "destructive",
      });
    }
  };

  const convertToCSV = (reportData: any): string => {
    let csvContent = '';
    
    if (reportData.report_type === 'school_financial') {
      csvContent = 'School Financial Report\n';
      csvContent += `Generated: ${new Date(reportData.generated_at).toLocaleDateString()}\n`;
      csvContent += `School: ${reportData.school?.name}\n`;
      csvContent += `Academic Year: ${reportData.academic_year}\n`;
      csvContent += `Term: ${reportData.term || 'All Terms'}\n\n`;
      
      csvContent += 'Summary\n';
      csvContent += 'Metric,Amount (KES)\n';
      csvContent += `Total Fees,${reportData.summary?.total_fees || 0}\n`;
      csvContent += `Total Collected,${reportData.summary?.total_collected || 0}\n`;
      csvContent += `Outstanding,${reportData.summary?.outstanding || 0}\n`;
      csvContent += `Collection Rate,${reportData.summary?.collection_rate || 0}%\n`;
      csvContent += `Total Expenses,${reportData.expenses?.total_expenses || 0}\n`;
    } else if (reportData.report_type === 'class_financial') {
      csvContent = 'Class Financial Report\n';
      csvContent += `Generated: ${new Date(reportData.generated_at).toLocaleDateString()}\n\n`;
      
      csvContent += 'Class,Total Fees,Collected,Outstanding,Students\n';
      reportData.class_breakdown?.forEach((classData: any) => {
        csvContent += `${classData.class_name},${classData.total_fees},${classData.collected},${classData.outstanding},${classData.student_count}\n`;
      });
    }
    
    return csvContent;
  };

  const getFinancialSummary = async (filters?: { academicYear?: string; term?: string }) => {
    if (!user?.school_id) return { error: 'No school associated with user' };

    try {
      const { data, error } = await supabase
        .from('student_fees')
        .select('amount, amount_paid, status')
        .eq('school_id', user.school_id)
        .then(({ data, error }) => {
          if (error) throw error;
          
          const summary = data?.reduce((acc, fee) => {
            acc.totalFees += fee.amount;
            acc.totalCollected += fee.amount_paid;
            acc.outstanding += (fee.amount - fee.amount_paid);
            
            if (fee.status === 'paid') acc.paidCount++;
            else if (fee.status === 'partial') acc.partialCount++;
            else if (fee.status === 'unpaid') acc.unpaidCount++;
            else if (fee.status === 'overdue') acc.overdue++;
            
            return acc;
          }, {
            totalFees: 0,
            totalCollected: 0,
            outstanding: 0,
            paidCount: 0,
            partialCount: 0,
            unpaidCount: 0,
            overdue: 0,
          });
          
          return { data: summary, error: null };
        });

      return { data, error };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return {
    generateReport,
    downloadReport,
    getFinancialSummary,
    loading,
  };
};
