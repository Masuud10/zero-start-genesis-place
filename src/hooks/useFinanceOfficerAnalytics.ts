
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FinanceAnalyticsData {
  keyMetrics: {
    totalRevenue: number;
    totalCollected: number;
    outstandingAmount: number;
    totalMpesaPayments: number;
    collectionRate: number;
    totalStudents: number;
    defaultersCount: number;
  };
  feeCollectionData: Array<{
    class: string;
    collected: number;
    expected: number;
  }>;
  dailyTransactions: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
  expenseBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    color: string;
  }>;
  defaultersList: Array<{
    student_name: string;
    admission_number: string;
    class_name: string;
    outstanding_amount: number;
    days_overdue: number;
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

      // Fetch students for count
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .eq('school_id', user.school_id)
        .eq('is_active', true);

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
      }

      const fees = feesData || [];
      const mpesaTransactions = mpesaData || [];
      const expenses = expensesData || [];
      const students = studentsData || [];

      // Calculate key metrics
      const totalFees = fees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
      const totalPaid = fees.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0);
      const totalMpesaPayments = mpesaTransactions.reduce((sum, txn) => sum + (txn.amount_paid || 0), 0);
      const totalCollected = totalPaid + totalMpesaPayments;
      const outstandingAmount = totalFees - totalCollected;
      const collectionRate = totalFees > 0 ? (totalCollected / totalFees) * 100 : 0;

      // Count defaulters
      const defaultersCount = fees.filter(fee => {
        const outstanding = (fee.amount || 0) - (fee.paid_amount || 0);
        const isPastDue = new Date(fee.due_date) < new Date();
        return outstanding > 0 && isPastDue;
      }).length;

      const keyMetrics = {
        totalRevenue: totalFees,
        totalCollected,
        outstandingAmount,
        totalMpesaPayments,
        collectionRate: Math.round(collectionRate * 100) / 100,
        totalStudents: students.length,
        defaultersCount
      };

      // Generate fee collection data by class
      const classData = new Map<string, { collected: number; expected: number }>();
      
      fees.forEach(fee => {
        const className = fee.classes?.name || 'Unknown Class';
        
        if (!classData.has(className)) {
          classData.set(className, { collected: 0, expected: 0 });
        }
        
        const data = classData.get(className)!;
        data.collected += fee.paid_amount || 0;
        data.expected += fee.amount || 0;
      });

      const feeCollectionData = Array.from(classData.entries()).map(([className, data]) => ({
        class: className,
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

      // Generate expense breakdown with colors and percentages
      const expenseCategories = new Map<string, number>();
      expenses.forEach(expense => {
        const category = expense.category || 'Other';
        expenseCategories.set(category, (expenseCategories.get(category) || 0) + (expense.amount || 0));
      });

      const totalExpenses = Array.from(expenseCategories.values()).reduce((sum, amount) => sum + amount, 0);
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

      const expenseBreakdown = Array.from(expenseCategories.entries()).map(([category, amount], index) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100 * 100) / 100 : 0,
        color: colors[index % colors.length]
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
            student_name: fee.students?.name || 'Unknown Student',
            admission_number: fee.students?.admission_number || 'N/A',
            class_name: fee.classes?.name || 'Unknown Class',
            outstanding_amount: (fee.amount || 0) - (fee.paid_amount || 0),
            days_overdue: daysPastDue
          };
        })
        .sort((a, b) => b.outstanding_amount - a.outstanding_amount)
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
