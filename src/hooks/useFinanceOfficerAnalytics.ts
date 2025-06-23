
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';

interface FinanceKeyMetrics {
  totalCollected: number;
  outstandingAmount: number;
  collectionRate: number;
  defaultersCount: number;
}

interface DailyTransaction {
  date: string;
  amount: number;
  count: number;
}

interface ExpenseBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

interface Defaulter {
  student_name: string;
  class_name: string;
  admission_number: string;
  outstanding_amount: number;
  days_overdue: number;
}

interface FeeCollectionData {
  class: string;
  collected: number;
  expected: number;
  collectionRate: number;
}

interface FinanceAnalyticsData {
  keyMetrics: FinanceKeyMetrics;
  dailyTransactions: DailyTransaction[];
  expenseBreakdown: ExpenseBreakdown[];
  defaultersList: Defaulter[];
  feeCollectionData: FeeCollectionData[];
}

export const useFinanceOfficerAnalytics = (filters: { term: string; class: string }) => {
  const { user } = useAuth();
  const { currentSchool } = useSchool();

  return useQuery({
    queryKey: ['finance-officer-analytics', user?.id, currentSchool?.id, filters],
    queryFn: async (): Promise<FinanceAnalyticsData> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const schoolId = currentSchool?.id || user?.school_id;
      if (!schoolId) {
        throw new Error('No school context available');
      }

      console.log('🔍 Fetching finance analytics for school:', schoolId);

      try {
        // Fetch fees data with proper error handling
        const { data: feesData, error: feesError } = await supabase
          .from('fees')
          .select(`
            id,
            amount,
            paid_amount,
            status,
            due_date,
            created_at,
            student_id,
            class_id,
            students!inner(
              id,
              name,
              admission_number
            ),
            classes!inner(
              id,
              name
            )
          `)
          .eq('school_id', schoolId)
          .order('created_at', { ascending: false });

        if (feesError) {
          console.error('❌ Error fetching fees:', feesError);
          throw new Error(`Failed to fetch fees data: ${feesError.message}`);
        }

        console.log('✅ Fees data fetched:', feesData?.length || 0, 'records');

        // Fetch financial transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('financial_transactions')
          .select(`
            id,
            amount,
            transaction_type,
            payment_method,
            created_at,
            student_id,
            students(
              name,
              admission_number
            )
          `)
          .eq('school_id', schoolId)
          .eq('transaction_type', 'payment')
          .order('created_at', { ascending: false })
          .limit(100);

        if (transactionsError) {
          console.warn('⚠️ Error fetching transactions (non-critical):', transactionsError);
        }

        console.log('✅ Transactions data fetched:', transactionsData?.length || 0, 'records');

        // Process fees data safely
        const safeFeesData = feesData || [];
        
        // Calculate key metrics
        const totalCollected = safeFeesData.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0);
        const totalExpected = safeFeesData.reduce((sum, fee) => sum + (fee.amount || 0), 0);
        const outstandingAmount = totalExpected - totalCollected;
        const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

        // Count defaulters (fees with outstanding amounts past due date)
        const currentDate = new Date();
        const defaulters = safeFeesData.filter(fee => {
          const outstanding = (fee.amount || 0) - (fee.paid_amount || 0);
          const dueDate = fee.due_date ? new Date(fee.due_date) : null;
          return outstanding > 0 && dueDate && dueDate < currentDate;
        });

        const keyMetrics: FinanceKeyMetrics = {
          totalCollected,
          outstandingAmount,
          collectionRate,
          defaultersCount: defaulters.length
        };

        // Process daily transactions
        const transactionsByDate = (transactionsData || []).reduce((acc, transaction) => {
          const date = new Date(transaction.created_at).toISOString().split('T')[0];
          if (!acc[date]) {
            acc[date] = { amount: 0, count: 0 };
          }
          acc[date].amount += transaction.amount || 0;
          acc[date].count += 1;
          return acc;
        }, {} as Record<string, { amount: number; count: number }>);

        const dailyTransactions: DailyTransaction[] = Object.entries(transactionsByDate)
          .map(([date, data]) => ({
            date,
            amount: data.amount,
            count: data.count
          }))
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(-30); // Last 30 days

        // Create expense breakdown (mock data since we don't have expense categories)
        const expenseBreakdown: ExpenseBreakdown[] = [
          { category: 'Salaries', amount: totalCollected * 0.6, percentage: 60 },
          { category: 'Utilities', amount: totalCollected * 0.15, percentage: 15 },
          { category: 'Maintenance', amount: totalCollected * 0.1, percentage: 10 },
          { category: 'Supplies', amount: totalCollected * 0.1, percentage: 10 },
          { category: 'Other', amount: totalCollected * 0.05, percentage: 5 }
        ];

        // Create defaulters list
        const defaultersList: Defaulter[] = defaulters
          .map(fee => {
            const student = fee.students as any;
            const classInfo = fee.classes as any;
            const dueDate = fee.due_date ? new Date(fee.due_date) : new Date();
            const daysOverdue = Math.floor((currentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
            
            return {
              student_name: student?.name || 'Unknown Student',
              class_name: classInfo?.name || 'Unknown Class',
              admission_number: student?.admission_number || 'N/A',
              outstanding_amount: (fee.amount || 0) - (fee.paid_amount || 0),
              days_overdue: Math.max(0, daysOverdue)
            };
          })
          .sort((a, b) => b.outstanding_amount - a.outstanding_amount)
          .slice(0, 10);

        // Create fee collection by class
        const feesByClass = safeFeesData.reduce((acc, fee) => {
          const classInfo = fee.classes as any;
          const className = classInfo?.name || 'Unknown Class';
          
          if (!acc[className]) {
            acc[className] = { collected: 0, expected: 0 };
          }
          acc[className].collected += fee.paid_amount || 0;
          acc[className].expected += fee.amount || 0;
          return acc;
        }, {} as Record<string, { collected: number; expected: number }>);

        const feeCollectionData: FeeCollectionData[] = Object.entries(feesByClass)
          .map(([className, data]) => ({
            class: className,
            collected: data.collected,
            expected: data.expected,
            collectionRate: data.expected > 0 ? (data.collected / data.expected) * 100 : 0
          }))
          .sort((a, b) => b.collected - a.collected);

        console.log('✅ Finance analytics processed successfully');

        return {
          keyMetrics,
          dailyTransactions,
          expenseBreakdown,
          defaultersList,
          feeCollectionData
        };

      } catch (error) {
        console.error('❌ Error in finance analytics query:', error);
        throw error;
      }
    },
    enabled: !!user?.id && !!(currentSchool?.id || user?.school_id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false
  });
};
