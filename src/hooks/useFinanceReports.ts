
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ReportFilters {
  reportType: 'school_financial' | 'fee_collection' | 'expense_summary' | 'mpesa_transactions';
  classId?: string;
  studentId?: string;
  academicYear?: string;
  term?: string;
  startDate?: string;
  endDate?: string;
}

export const useFinanceReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const generateReport = async (filters: ReportFilters) => {
    if (!user?.school_id) {
      return { data: null, error: 'No school assigned to user' };
    }

    setLoading(true);
    setError(null);

    try {
      let data: any = null;

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
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate report';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const generateSchoolFinancialReport = async (schoolId: string, filters: ReportFilters) => {
    // Fetch fees data
    const { data: feesData } = await supabase
      .from('fees')
      .select(`
        *,
        students(name, admission_number),
        classes(name)
      `)
      .eq('school_id', schoolId);

    // Fetch expenses data
    const { data: expensesData } = await supabase
      .from('expenses')
      .select('*')
      .eq('school_id', schoolId);

    // Fetch MPESA transactions
    const { data: mpesaData } = await supabase
      .from('mpesa_transactions')
      .select('*')
      .eq('school_id', schoolId);

    const totalFees = feesData?.reduce((sum, fee) => sum + Number(fee.amount || 0), 0) || 0;
    const totalCollected = feesData?.reduce((sum, fee) => sum + Number(fee.paid_amount || 0), 0) || 0;
    const totalExpenses = expensesData?.reduce((sum, expense) => sum + Number(expense.amount || 0), 0) || 0;
    const totalMpesa = mpesaData?.reduce((sum, txn) => sum + Number(txn.amount_paid || 0), 0) || 0;

    return {
      reportType: 'School Financial Overview',
      generatedAt: new Date().toISOString(),
      summary: {
        totalFees,
        totalCollected,
        outstanding: totalFees - totalCollected,
        totalExpenses,
        totalMpesa,
        netIncome: totalCollected - totalExpenses
      },
      records: feesData || [],
      totalAmount: totalCollected
    };
  };

  const generateFeeCollectionReport = async (schoolId: string, filters: ReportFilters) => {
    let query = supabase
      .from('fees')
      .select(`
        *,
        students(name, admission_number),
        classes(name)
      `)
      .eq('school_id', schoolId);

    if (filters.classId) {
      query = query.eq('class_id', filters.classId);
    }

    if (filters.academicYear) {
      query = query.eq('academic_year', filters.academicYear);
    }

    if (filters.term) {
      query = query.eq('term', filters.term);
    }

    const { data } = await query;

    const totalExpected = data?.reduce((sum, fee) => sum + Number(fee.amount || 0), 0) || 0;
    const totalCollected = data?.reduce((sum, fee) => sum + Number(fee.paid_amount || 0), 0) || 0;

    return {
      reportType: 'Fee Collection Report',
      generatedAt: new Date().toISOString(),
      filters,
      summary: {
        totalExpected,
        totalCollected,
        outstanding: totalExpected - totalCollected,
        collectionRate: totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0
      },
      records: data || [],
      totalAmount: totalCollected
    };
  };

  const generateExpenseSummaryReport = async (schoolId: string, filters: ReportFilters) => {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('school_id', schoolId);

    const totalExpenses = data?.reduce((sum, expense) => sum + Number(expense.amount || 0), 0) || 0;

    // Group by category
    const categoryBreakdown = data?.reduce((acc: any, expense) => {
      const category = expense.category || 'Other';
      acc[category] = (acc[category] || 0) + Number(expense.amount || 0);
      return acc;
    }, {}) || {};

    return {
      reportType: 'Expense Summary Report',
      generatedAt: new Date().toISOString(),
      summary: {
        totalExpenses,
        expenseCount: data?.length || 0,
        categoryBreakdown
      },
      records: data || [],
      totalAmount: totalExpenses
    };
  };

  const generateMpesaTransactionsReport = async (schoolId: string, filters: ReportFilters) => {
    const { data } = await supabase
      .from('mpesa_transactions')
      .select(`
        *,
        students(name, admission_number),
        classes(name)
      `)
      .eq('school_id', schoolId);

    const totalAmount = data?.reduce((sum, txn) => sum + Number(txn.amount_paid || 0), 0) || 0;
    const successfulTransactions = data?.filter(txn => txn.transaction_status === 'Success') || [];

    return {
      reportType: 'M-PESA Transactions Report',
      generatedAt: new Date().toISOString(),
      summary: {
        totalTransactions: data?.length || 0,
        successfulTransactions: successfulTransactions.length,
        totalAmount,
        successfulAmount: successfulTransactions.reduce((sum, txn) => sum + Number(txn.amount_paid || 0), 0)
      },
      records: data || [],
      totalAmount
    };
  };

  const downloadReport = (reportData: any, filename: string) => {
    // Convert to CSV format
    const csvContent = convertToCSV(reportData);
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const convertToCSV = (reportData: any) => {
    if (!reportData.records || reportData.records.length === 0) {
      return 'No data available';
    }

    const headers = Object.keys(reportData.records[0]).join(',');
    const rows = reportData.records.map((record: any) =>
      Object.values(record).map((value: any) => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(',')
    );

    return [headers, ...rows].join('\n');
  };

  return {
    generateReport,
    downloadReport,
    loading,
    error
  };
};
