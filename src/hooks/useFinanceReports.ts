
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ReportFilters {
  reportType: 'school_financial' | 'fee_collection' | 'expense_summary' | 'mpesa_transactions';
  academicYear?: string;
  term?: string;
  classId?: string;
  studentId?: string;
}

export const useFinanceReports = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateReport = async (filters: ReportFilters) => {
    if (!user?.school_id) {
      toast({
        title: "Error",
        description: "No school associated with your account",
        variant: "destructive",
      });
      return { data: null, error: 'No school ID' };
    }

    setLoading(true);
    
    try {
      let data = null;
      
      switch (filters.reportType) {
        case 'school_financial':
          data = await generateSchoolFinancialReport(user.school_id, filters);
          break;
        case 'fee_collection':
          data = await generateFeeCollectionReport(user.school_id, filters);
          break;
        case 'expense_summary':
          data = await generateExpenseSummaryReport(user.school_id, filters);
          break;
        case 'mpesa_transactions':
          data = await generateMpesaTransactionsReport(user.school_id, filters);
          break;
        default:
          throw new Error('Invalid report type');
      }

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate report",
        variant: "destructive",
      });
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (reportData: any, filename: string) => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text('Financial Report', 20, 20);
      
      // Add generated date
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
      
      // Add report data as a simple table
      if (reportData && typeof reportData === 'object') {
        const tableData = Object.entries(reportData).map(([key, value]) => [
          key.replace(/_/g, ' ').toUpperCase(),
          String(value)
        ]);
        
        (doc as any).autoTable({
          head: [['Field', 'Value']],
          body: tableData,
          startY: 40,
        });
      }
      
      doc.save(`${filename}.pdf`);
      
      toast({
        title: "Success",
        description: "Report downloaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to download report",
        variant: "destructive",
      });
    }
  };

  return {
    generateReport,
    downloadReport,
    loading
  };
};

// Helper functions for different report types
const generateSchoolFinancialReport = async (schoolId: string, filters: ReportFilters) => {
  const { data, error } = await supabase
    .from('fees')
    .select('*')
    .eq('school_id', schoolId);
  
  if (error) throw error;
  
  const totalFees = data?.reduce((sum, fee) => sum + (fee.amount || 0), 0) || 0;
  const totalPaid = data?.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0) || 0;
  
  return {
    summary: {
      total_fees: totalFees,
      total_collected: totalPaid,
      outstanding: totalFees - totalPaid,
      collection_rate: totalFees > 0 ? (totalPaid / totalFees) * 100 : 0
    },
    details: data
  };
};

const generateFeeCollectionReport = async (schoolId: string, filters: ReportFilters) => {
  const { data, error } = await supabase
    .from('fees')
    .select('*, student:students(name, admission_number), class:classes(name)')
    .eq('school_id', schoolId);
  
  if (error) throw error;
  
  return {
    collections: data,
    total_collected: data?.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0) || 0
  };
};

const generateExpenseSummaryReport = async (schoolId: string, filters: ReportFilters) => {
  // This would need an expenses table - for now return empty
  return {
    message: 'Expense tracking not yet implemented',
    total_expenses: 0
  };
};

const generateMpesaTransactionsReport = async (schoolId: string, filters: ReportFilters) => {
  const { data, error } = await supabase
    .from('mpesa_transactions')
    .select('*')
    .eq('school_id', schoolId);
  
  if (error) throw error;
  
  const totalAmount = data?.reduce((sum, txn) => sum + (txn.amount_paid || 0), 0) || 0;
  
  return {
    transactions: data,
    summary: {
      total_transactions: data?.length || 0,
      total_amount: totalAmount,
      successful_transactions: data?.filter(txn => txn.transaction_status === 'Success').length || 0
    }
  };
};
