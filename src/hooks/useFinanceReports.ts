
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ReportFilters {
  reportType: 'school_financial' | 'fee_collection' | 'expense_summary' | 'mpesa_transactions';
  academicYear?: string;
  term?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const useFinanceReports = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const generateReport = async (filters: ReportFilters) => {
    if (!user?.school_id) {
      return { data: null, error: 'No school assigned to user' };
    }

    try {
      setLoading(true);
      
      let data: any = {};
      const { reportType, academicYear, term, dateFrom, dateTo } = filters;

      switch (reportType) {
        case 'school_financial':
          // Fetch financial overview
          const [feesResult, expensesResult, transactionsResult] = await Promise.all([
            supabase
              .from('fees')
              .select('amount, paid_amount, status, category')
              .eq('school_id', user.school_id)
              .gte('created_at', academicYear ? `${academicYear}-01-01` : '2024-01-01'),
            
            supabase
              .from('expenses')
              .select('amount, category, date')
              .eq('school_id', user.school_id)
              .gte('date', dateFrom || '2024-01-01'),
            
            supabase
              .from('mpesa_transactions')
              .select('amount_paid, transaction_status, transaction_date')
              .eq('school_id', user.school_id)
              .gte('transaction_date', dateFrom || '2024-01-01')
          ]);

          data = {
            fees: feesResult.data || [],
            expenses: expensesResult.data || [],
            transactions: transactionsResult.data || [],
            summary: {
              totalFees: feesResult.data?.reduce((sum, fee) => sum + Number(fee.amount), 0) || 0,
              totalCollected: feesResult.data?.reduce((sum, fee) => sum + Number(fee.paid_amount || 0), 0) || 0,
              totalExpenses: expensesResult.data?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0,
              mpesaCollections: transactionsResult.data?.filter(t => t.transaction_status === 'Success')
                .reduce((sum, t) => sum + Number(t.amount_paid), 0) || 0
            }
          };
          break;

        case 'fee_collection':
          const { data: feeData } = await supabase
            .from('fees')
            .select(`
              *,
              students(name, admission_number, class_id),
              classes(name)
            `)
            .eq('school_id', user.school_id)
            .gte('created_at', academicYear ? `${academicYear}-01-01` : '2024-01-01');

          data = { feeCollection: feeData || [] };
          break;

        case 'expense_summary':
          const { data: expenseData } = await supabase
            .from('expenses')
            .select('*')
            .eq('school_id', user.school_id)
            .gte('date', dateFrom || '2024-01-01');

          data = { expenses: expenseData || [] };
          break;

        case 'mpesa_transactions':
          const { data: mpesaData } = await supabase
            .from('mpesa_transactions')
            .select(`
              *,
              students(name, admission_number),
              classes(name)
            `)
            .eq('school_id', user.school_id)
            .gte('transaction_date', dateFrom || '2024-01-01');

          data = { mpesaTransactions: mpesaData || [] };
          break;
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Error generating report:', error);
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (data: any, filename: string) => {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    generateReport,
    downloadReport,
    loading
  };
};
