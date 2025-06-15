
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FinanceOfficerAnalyticsFilters {
  term: string;
  class: string;
}

export const fetchAnalyticsData = async (schoolId: string, filters: FinanceOfficerAnalyticsFilters) => {
  // For now, we ignore filters until they are implemented properly.
  // We'll fetch data for the whole school.
  
  // 1. Fetch fees and related student data in separate queries to avoid join issues
  const { data: feesData, error: feesError } = await supabase
    .from('fees')
    .select('amount, paid_amount, due_date, mpesa_code, student_id')
    .eq('school_id', schoolId);
  if (feesError) throw new Error(`Fetching fees: ${feesError.message}`);

  const studentIds = feesData.map(f => f.student_id).filter((id): id is string => id !== null && id !== undefined);
  
  let studentsMap: Record<string, { id: string; name: string; classes: { name: string } | null }> = {};
  if (studentIds.length > 0) {
    // Using !inner join hint to resolve ambiguity between students.class_id and student_classes join table.
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, name, classes!inner(name)')
      .in('id', studentIds);
    if (studentsError) throw new Error(`Fetching students: ${studentsError.message}`);
    
    studentsMap = students.reduce((acc, s) => {
      acc[s.id] = { id: s.id, name: s.name, classes: s.classes as { name: string } | null };
      return acc;
    }, {});
  }

  const fees = feesData.map(f => ({ ...f, students: f.student_id ? studentsMap[f.student_id] : null }));

  // 2. Fetch financial transactions
  const { data: transactions, error: txError } = await supabase
    .from('financial_transactions')
    .select('amount, payment_method, created_at, student_id')
    .eq('school_id', schoolId)
    .eq('transaction_type', 'payment');
  if (txError) throw new Error(`Fetching transactions: ${txError.message}`);

  // 3. Fetch expenses
  const { data: expenses, error: expensesError } = await supabase
    .from('expenses')
    .select('amount, category')
    .eq('school_id', schoolId);
  if (expensesError) throw new Error(`Fetching expenses: ${expensesError.message}`);

  // --- Process Data ---

  // Key Metrics
  const totalCollected = fees.reduce((sum, f) => sum + (f.paid_amount || 0), 0);
  const totalExpected = fees.reduce((sum, f) => sum + (f.amount || 0), 0);
  const outstanding = totalExpected - totalCollected;
  const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;
  const mpesaTransactions = fees.filter(f => f.mpesa_code).length;

  // Fee Collection by Class
  const feeCollectionByClassMap = fees.reduce((acc, fee) => {
    const studentData = fee.students;
    const className = studentData?.classes?.name || 'Unassigned';
    if (!acc[className]) {
      acc[className] = { class: className, collected: 0, expected: 0, defaulters: new Set() };
    }
    acc[className].expected += fee.amount || 0;
    acc[className].collected += fee.paid_amount || 0;
    if ((fee.amount || 0) - (fee.paid_amount || 0) > 0 && studentData?.id) {
        acc[className].defaulters.add(studentData.id);
    }
    return acc;
  }, {} as Record<string, { class: string; collected: number; expected: number; defaulters: Set<string> }>);
  const feeCollectionByClass = Object.values(feeCollectionByClassMap).map(item => ({...item, defaulters: item.defaulters.size}));

  // Daily Transactions
  const dailyTransactionsMap = transactions.reduce((acc, tx) => {
    const date = new Date(tx.created_at).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { date, amount: 0, transactions: 0 };
    }
    acc[date].amount += tx.amount || 0;
    acc[date].transactions += 1;
    return acc;
  }, {} as Record<string, { date: string; amount: number; transactions: number }>);
  const dailyTransactions = Object.values(dailyTransactionsMap).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Expense Breakdown
  const expenseBreakdownMap = expenses.reduce((acc, expense) => {
    const category = expense.category || 'Other';
    if (!acc[category]) {
      acc[category] = { category, amount: 0 };
    }
    acc[category].amount += Number(expense.amount) || 0;
    return acc;
  }, {} as Record<string, { category: string; amount: number }>);
  const totalExpenses = Object.values(expenseBreakdownMap).reduce((sum, item) => sum + item.amount, 0);
  const expenseBreakdown = Object.values(expenseBreakdownMap).map(item => ({...item, name: item.category, value: item.amount, percentage: totalExpenses > 0 ? parseFloat(((item.amount / totalExpenses) * 100).toFixed(1)) : 0}));

  // Defaulters List
  const defaultersMap = fees.reduce((acc, fee) => {
    const balance = (fee.amount || 0) - (fee.paid_amount || 0);
    const studentData = fee.students;
    if (balance > 0 && studentData) {
      if (!acc[studentData.id]) {
        acc[studentData.id] = { 
          student: studentData.name, 
          class: studentData.classes?.name || 'Unassigned', 
          amount: 0, 
          days: 0 // days overdue logic is complex without term dates, setting to 0
        };
      }
      acc[studentData.id].amount += balance;
    }
    return acc;
  }, {} as Record<string, {student: string, class: string, amount: number, days: number}>);
  const defaultersList = Object.values(defaultersMap).sort((a,b) => b.amount - a.amount).slice(0, 5);

  const netProfit = totalCollected - totalExpenses;

  return {
    keyMetrics: { totalCollected, collectionRate, outstanding, mpesaTransactions, defaulterCount: Object.keys(defaultersMap).length, totalExpenses, netProfit },
    feeCollectionData: feeCollectionByClass,
    dailyTransactions,
    expenseBreakdown,
    defaultersList
  };
};


export const useFinanceOfficerAnalytics = (filters: FinanceOfficerAnalyticsFilters) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['financeOfficerAnalytics', user?.school_id, filters],
    queryFn: () => fetchAnalyticsData(user!.school_id!, filters),
    enabled: !!user?.school_id,
  });
};
