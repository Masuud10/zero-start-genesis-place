
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FinanceFilters {
  term: string;
  class: string;
}

export const useFinanceOfficerAnalytics = (filters: FinanceFilters) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['finance-officer-analytics', user?.school_id, filters],
    queryFn: async () => {
      if (!user?.school_id) {
        throw new Error('No school ID available');
      }

      // Fetch fees data with explicit relationship hints
      const { data: fees, error: feesError } = await supabase
        .from('fees')
        .select(`
          *,
          students!fees_student_id_fkey(name, admission_number),
          classes!fees_class_id_fkey(name)
        `)
        .eq('school_id', user.school_id);

      if (feesError) throw feesError;

      // Fetch MPESA transactions
      const { data: mpesaTransactions, error: mpesaError } = await supabase
        .from('mpesa_transactions')
        .select('*')
        .eq('school_id', user.school_id);

      if (mpesaError) throw mpesaError;

      // Fetch expenses
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('school_id', user.school_id);

      if (expensesError) throw expensesError;

      // Calculate key metrics
      const totalRevenue = fees?.reduce((sum, fee) => sum + (fee.amount || 0), 0) || 0;
      const totalCollected = fees?.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0) || 0;
      const outstandingAmount = totalRevenue - totalCollected;
      const collectionRate = totalRevenue > 0 ? (totalCollected / totalRevenue) * 100 : 0;
      
      const studentIds = [...new Set(fees?.map(fee => fee.student_id))];
      const totalStudents = studentIds.length;
      
      const defaultersCount = fees?.filter(fee => 
        (fee.amount || 0) > (fee.paid_amount || 0) && 
        new Date(fee.due_date) < new Date()
      ).length || 0;

      const keyMetrics = {
        totalRevenue,
        totalCollected,
        outstandingAmount,
        collectionRate,
        totalStudents,
        defaultersCount
      };

      // Fee collection by class
      const feeCollectionData = fees?.reduce((acc: any[], fee) => {
        const className = fee.classes?.name || 'Unknown';
        const existing = acc.find(item => item.class === className);
        
        if (existing) {
          existing.collected += fee.paid_amount || 0;
          existing.expected += fee.amount || 0;
        } else {
          acc.push({
            class: className,
            collected: fee.paid_amount || 0,
            expected: fee.amount || 0
          });
        }
        
        return acc;
      }, []) || [];

      // Daily transactions (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const dailyTransactions = last7Days.map(date => {
        const dayTransactions = mpesaTransactions?.filter(txn => 
          txn.transaction_date?.startsWith(date)
        ) || [];
        
        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          amount: dayTransactions.reduce((sum, txn) => sum + (txn.amount_paid || 0), 0)
        };
      });

      // Expense breakdown
      const expenseBreakdown = expenses?.reduce((acc: any[], expense) => {
        const existing = acc.find(item => item.category === expense.category);
        
        if (existing) {
          existing.amount += expense.amount || 0;
        } else {
          acc.push({
            category: expense.category,
            amount: expense.amount || 0,
            color: `#${Math.floor(Math.random()*16777215).toString(16)}`
          });
        }
        
        return acc;
      }, []) || [];

      // Top defaulters
      const defaultersList = fees?.filter(fee => 
        (fee.amount || 0) > (fee.paid_amount || 0) && 
        new Date(fee.due_date) < new Date()
      ).map(fee => ({
        student_name: fee.students?.name || 'Unknown',
        admission_number: fee.students?.admission_number || 'N/A',
        outstanding_amount: (fee.amount || 0) - (fee.paid_amount || 0),
        class_name: fee.classes?.name || 'Unknown',
        days_overdue: Math.floor((new Date().getTime() - new Date(fee.due_date).getTime()) / (1000 * 60 * 60 * 24))
      })).sort((a, b) => b.outstanding_amount - a.outstanding_amount) || [];

      return {
        keyMetrics,
        feeCollectionData,
        dailyTransactions,
        expenseBreakdown,
        defaultersList
      };
    },
    enabled: !!user?.school_id
  });
};
