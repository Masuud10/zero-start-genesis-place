
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FinanceAnalyticsData {
  keyMetrics: {
    totalFeesCollected: number;
    totalOutstanding: number;
    totalMpesaPayments: number;
    collectionRate: number;
  };
  feeCollectionData: Array<{
    month: string;
    collected: number;
    outstanding: number;
  }>;
  dailyTransactions: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
  expenseBreakdown: Array<{
    category: string;
    amount: number;
  }>;
  defaultersList: Array<{
    studentName: string;
    admissionNumber: string;
    className: string;
    outstandingAmount: number;
    daysPastDue: number;
  }>;
}

export const useFinanceOfficerAnalytics = (filters: { term: string; class: string }) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['finance-officer-analytics', user?.school_id, filters],
    queryFn: async (): Promise<FinanceAnalyticsData> => {
      if (!user?.school_id) {
        throw new Error('No school ID available');
      }

      console.log('📊 Fetching finance analytics for school:', user.school_id);

      // Fetch fees data
      const { data: feesData, error: feesError } = await supabase
        .from('fees')
        .select(`
          *,
          students!fees_student_id_fkey(name, admission_number),
          classes!fees_class_id_fkey(name)
        `)
        .eq('school_id', user.school_id);

      if (feesError) {
        console.error('Error fetching fees:', feesError);
      }

      // Fetch MPESA transactions
      const { data: mpesaData, error: mpesaError } = await supabase
        .from('mpesa_transactions')
        .select('*')
        .eq('school_id', user.school_id)
        .eq('transaction_status', 'Success');

      if (mpesaError) {
        console.error('Error fetching MPESA data:', mpesaError);
      }

      // Fetch expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('school_id', user.school_id);

      if (expensesError) {
        console.error('Error fetching expenses:', expensesError);
      }

      const fees = feesData || [];
      const mpesaTransactions = mpesaData || [];
      const expenses = expensesData || [];

      // Calculate key metrics
      const totalFees = fees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
      const totalPaid = fees.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0);
      const totalMpesaPayments = mpesaTransactions.reduce((sum, txn) => sum + (txn.amount_paid || 0), 0);
      const totalFeesCollected = totalPaid + totalMpesaPayments;
      const totalOutstanding = totalFees - totalFeesCollected;
      const collectionRate = totalFees > 0 ? (totalFeesCollected / totalFees) * 100 : 0;

      const keyMetrics = {
        totalFeesCollected,
        totalOutstanding,
        totalMpesaPayments,
        collectionRate: Math.round(collectionRate * 100) / 100
      };

      // Generate monthly collection data
      const monthlyData = new Map<string, { collected: number; outstanding: number }>();
      
      fees.forEach(fee => {
        const month = new Date(fee.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        
        if (!monthlyData.has(month)) {
          monthlyData.set(month, { collected: 0, outstanding: 0 });
        }
        
        const data = monthlyData.get(month)!;
        data.collected += fee.paid_amount || 0;
        data.outstanding += (fee.amount || 0) - (fee.paid_amount || 0);
      });

      const feeCollectionData = Array.from(monthlyData.entries()).map(([month, data]) => ({
        month,
        ...data
      }));

      // Generate daily transactions
      const dailyTxns = new Map<string, { amount: number; count: number }>();
      
      mpesaTransactions.forEach(txn => {
        const date = new Date(txn.transaction_date).toLocaleDateString();
        if (!dailyTxns.has(date)) {
          dailyTxns.set(date, { amount: 0, count: 0 });
        }
        const data = dailyTxns.get(date)!;
        data.amount += txn.amount_paid || 0;
        data.count += 1;
      });

      const dailyTransactions = Array.from(dailyTxns.entries()).map(([date, data]) => ({
        date,
        ...data
      }));

      // Generate expense breakdown
      const expenseCategories = new Map<string, number>();
      expenses.forEach(expense => {
        const category = expense.category || 'Other';
        expenseCategories.set(category, (expenseCategories.get(category) || 0) + (expense.amount || 0));
      });

      const expenseBreakdown = Array.from(expenseCategories.entries()).map(([category, amount]) => ({
        category,
        amount
      }));

      // Generate defaulters list
      const defaultersList = fees
        .filter(fee => {
          const outstanding = (fee.amount || 0) - (fee.paid_amount || 0);
          const isPastDue = new Date(fee.due_date) < new Date();
          return outstanding > 0 && isPastDue;
        })
        .map(fee => {
          const daysPastDue = Math.floor(
            (new Date().getTime() - new Date(fee.due_date).getTime()) / (1000 * 60 * 60 * 24)
          );
          
          return {
            studentName: fee.students?.name || 'Unknown Student',
            admissionNumber: fee.students?.admission_number || 'N/A',
            className: fee.classes?.name || 'Unknown Class',
            outstandingAmount: (fee.amount || 0) - (fee.paid_amount || 0),
            daysPastDue
          };
        })
        .sort((a, b) => b.outstandingAmount - a.outstandingAmount)
        .slice(0, 10);

      console.log('📊 Finance analytics compiled successfully');

      return {
        keyMetrics,
        feeCollectionData,
        dailyTransactions,
        expenseBreakdown,
        defaultersList
      };
    },
    enabled: !!user?.school_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });
};
