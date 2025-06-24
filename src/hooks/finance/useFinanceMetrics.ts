
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FinanceMetrics {
  totalRevenue: number;
  totalCollected: number;
  outstandingAmount: number;
  totalMpesaPayments: number;
  collectionRate: number;
  totalStudents: number;
  defaultersCount: number;
}

export const useFinanceMetrics = () => {
  const [metrics, setMetrics] = useState<FinanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchMetrics = async () => {
    if (!user?.school_id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch fees data
      const { data: feesData, error: feesError } = await supabase
        .from('fees')
        .select('*')
        .eq('school_id', user.school_id);

      if (feesError) throw feesError;

      // Fetch students count
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .eq('school_id', user.school_id)
        .eq('is_active', true);

      if (studentsError) throw studentsError;

      // Fetch MPESA transactions
      const { data: mpesaData, error: mpesaError } = await supabase
        .from('mpesa_transactions')
        .select('*')
        .eq('school_id', user.school_id)
        .eq('transaction_status', 'Success');

      if (mpesaError) throw mpesaError;

      // Calculate metrics with proper type casting
      const totalFees = feesData?.reduce((sum, fee) => {
        const amount = typeof fee.amount === 'number' ? fee.amount : Number(fee.amount || 0);
        return sum + amount;
      }, 0) || 0;

      const totalPaid = feesData?.reduce((sum, fee) => {
        const paidAmount = typeof fee.paid_amount === 'number' ? fee.paid_amount : Number(fee.paid_amount || 0);
        return sum + paidAmount;
      }, 0) || 0;

      const outstandingAmount = totalFees - totalPaid;
      
      const totalMpesaPayments = mpesaData?.reduce((sum, txn) => {
        const amount = typeof txn.amount_paid === 'number' ? txn.amount_paid : Number(txn.amount_paid || 0);
        return sum + amount;
      }, 0) || 0;

      const collectionRate = totalFees > 0 ? Math.round((totalPaid / totalFees) * 100) : 0;
      const totalStudents = studentsData?.length || 0;

      // Find defaulters
      const today = new Date();
      const defaultersList = feesData?.filter(fee => {
        const dueDate = new Date(fee.due_date);
        const isPastDue = dueDate < today;
        const feeAmount = typeof fee.amount === 'number' ? fee.amount : Number(fee.amount || 0);
        const paidAmount = typeof fee.paid_amount === 'number' ? fee.paid_amount : Number(fee.paid_amount || 0);
        const hasOutstanding = feeAmount > paidAmount;
        return isPastDue && hasOutstanding;
      }) || [];

      setMetrics({
        totalRevenue: totalFees,
        totalCollected: totalPaid,
        outstandingAmount,
        totalMpesaPayments,
        collectionRate,
        totalStudents,
        defaultersCount: defaultersList.length
      });

    } catch (err: any) {
      console.error('Error fetching finance metrics:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [user?.school_id]);

  return {
    metrics,
    isLoading,
    error,
    refetch: fetchMetrics
  };
};
