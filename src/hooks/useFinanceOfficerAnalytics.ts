
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { validateUuid, validateSchoolAccess } from '@/utils/uuidValidation';

interface FinanceOfficerAnalyticsData {
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
    percentage: number;
  }>;
  dailyTransactions: Array<{
    date: string;
    amount: number;
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
    outstanding_amount: number;
    class_name: string;
    days_overdue: number;
  }>;
}

export const useFinanceOfficerAnalytics = (filters: { term: string; class: string }) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['finance-officer-analytics', user?.school_id, filters],
    queryFn: async (): Promise<FinanceOfficerAnalyticsData> => {
      // Validate user and school access
      if (!user) {
        throw new Error('User authentication required');
      }

      const schoolValidation = validateSchoolAccess(user.school_id);
      if (!schoolValidation.isValid) {
        throw new Error(schoolValidation.error || 'Invalid school access');
      }

      const validSchoolId = schoolValidation.sanitizedValue!;
      console.log('🔍 Finance Analytics: Fetching data for school:', validSchoolId);

      try {
        // Fetch fees data with proper UUID validation
        const { data: feesData, error: feesError } = await supabase
          .from('fees')
          .select(`
            id,
            amount,
            paid_amount,
            due_date,
            status,
            category,
            student_id,
            class_id,
            students!fees_student_id_fkey(name, admission_number),
            classes!fees_class_id_fkey(name)
          `)
          .eq('school_id', validSchoolId)
          .not('amount', 'is', null)
          .not('id', 'is', null);

        if (feesError) {
          console.error('Error fetching fees data:', feesError);
          // Continue with empty data instead of throwing
        }

        // Fetch MPESA transactions with UUID validation
        const { data: mpesaData, error: mpesaError } = await supabase
          .from('mpesa_transactions')
          .select('amount_paid, transaction_date, transaction_status')
          .eq('school_id', validSchoolId)
          .not('amount_paid', 'is', null);

        if (mpesaError) {
          console.warn('MPESA data fetch warning:', mpesaError);
        }

        // Fetch students count
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('id')
          .eq('school_id', validSchoolId)
          .eq('is_active', true)
          .not('id', 'is', null);

        if (studentsError) {
          console.warn('Students count fetch warning:', studentsError);
        }

        // Fetch expenses data
        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select('category, amount, date')
          .eq('school_id', validSchoolId)
          .not('amount', 'is', null);

        if (expensesError) {
          console.warn('Expenses data fetch warning:', expensesError);
        }

        // Process data with safe defaults
        const fees = feesData || [];
        const mpesaTransactions = mpesaData || [];
        const students = studentsData || [];
        const expenses = expensesData || [];

        // Calculate key metrics
        const totalRevenue = fees.reduce((sum, fee) => {
          const amount = Number(fee.amount || 0);
          return !isNaN(amount) ? sum + amount : sum;
        }, 0);

        const totalCollected = fees.reduce((sum, fee) => {
          const paidAmount = Number(fee.paid_amount || 0);
          return !isNaN(paidAmount) ? sum + paidAmount : sum;
        }, 0);

        const outstandingAmount = Math.max(0, totalRevenue - totalCollected);

        const totalMpesaPayments = mpesaTransactions
          .filter(txn => txn.transaction_status === 'Success')
          .reduce((sum, txn) => {
            const amount = Number(txn.amount_paid || 0);
            return !isNaN(amount) ? sum + amount : sum;
          }, 0);

        const collectionRate = totalRevenue > 0 ? Math.round((totalCollected / totalRevenue) * 100) : 0;

        // Calculate defaulters with proper date handling
        const today = new Date();
        const defaultersList = fees
          .filter(fee => {
            if (!fee.due_date || !fee.amount) return false;
            
            try {
              const dueDate = new Date(fee.due_date);
              const isPastDue = dueDate < today;
              const feeAmount = Number(fee.amount || 0);
              const paidAmount = Number(fee.paid_amount || 0);
              const hasOutstanding = feeAmount > paidAmount;
              
              return isPastDue && hasOutstanding && !isNaN(feeAmount) && !isNaN(paidAmount);
            } catch (dateError) {
              console.warn('Invalid date in fee record:', fee.id, dateError);
              return false;
            }
          })
          .map(fee => ({
            student_name: fee.students?.name || 'Unknown Student',
            admission_number: fee.students?.admission_number || 'N/A',
            outstanding_amount: Number(fee.amount || 0) - Number(fee.paid_amount || 0),
            class_name: fee.classes?.name || 'Unknown Class',
            days_overdue: Math.floor((today.getTime() - new Date(fee.due_date!).getTime()) / (1000 * 60 * 60 * 24))
          }));

        // Process fee collection by class
        const classMap = new Map<string, { collected: number; expected: number }>();
        fees.forEach(fee => {
          const className = fee.classes?.name || 'Unknown Class';
          const current = classMap.get(className) || { collected: 0, expected: 0 };
          
          current.expected += Number(fee.amount || 0);
          current.collected += Number(fee.paid_amount || 0);
          
          classMap.set(className, current);
        });

        const feeCollectionData = Array.from(classMap.entries()).map(([className, data]) => ({
          class: className,
          collected: data.collected,
          expected: data.expected,
          percentage: data.expected > 0 ? Math.round((data.collected / data.expected) * 100) : 0
        }));

        // Process daily transactions (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailyMap = new Map<string, number>();
        mpesaTransactions
          .filter(txn => {
            if (!txn.transaction_date) return false;
            const txnDate = new Date(txn.transaction_date);
            return txnDate >= thirtyDaysAgo && txn.transaction_status === 'Success';
          })
          .forEach(txn => {
            const dateKey = new Date(txn.transaction_date!).toISOString().split('T')[0];
            const current = dailyMap.get(dateKey) || 0;
            dailyMap.set(dateKey, current + Number(txn.amount_paid || 0));
          });

        const dailyTransactions = Array.from(dailyMap.entries())
          .map(([date, amount]) => ({ date, amount }))
          .sort((a, b) => a.date.localeCompare(b.date));

        // Process expense breakdown with colors
        const expenseMap = new Map<string, number>();
        expenses.forEach(expense => {
          const category = expense.category || 'Other';
          const current = expenseMap.get(category) || 0;
          expenseMap.set(category, current + Number(expense.amount || 0));
        });

        const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];
        const totalExpenses = Array.from(expenseMap.values()).reduce((sum, amount) => sum + amount, 0);
        const expenseBreakdown = Array.from(expenseMap.entries()).map(([category, amount], index) => ({
          category,
          amount,
          percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
          color: colors[index % colors.length]
        }));

        return {
          keyMetrics: {
            totalRevenue,
            totalCollected,
            outstandingAmount,
            totalMpesaPayments,
            collectionRate: Math.min(100, Math.max(0, collectionRate)),
            totalStudents: students.length,
            defaultersCount: defaultersList.length
          },
          feeCollectionData,
          dailyTransactions,
          expenseBreakdown,
          defaultersList: defaultersList.slice(0, 10) // Limit to top 10
        };

      } catch (error) {
        console.error('Finance analytics error:', error);
        
        // Return safe default data structure on error
        return {
          keyMetrics: {
            totalRevenue: 0,
            totalCollected: 0,
            outstandingAmount: 0,
            totalMpesaPayments: 0,
            collectionRate: 0,
            totalStudents: 0,
            defaultersCount: 0
          },
          feeCollectionData: [],
          dailyTransactions: [],
          expenseBreakdown: [],
          defaultersList: []
        };
      }
    },
    enabled: !!(user?.school_id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on UUID validation errors
      if (error.message.includes('Invalid') || error.message.includes('null')) {
        return false;
      }
      return failureCount < 3;
    },
  });
};
