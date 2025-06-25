
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
      console.log('No school_id available for finance metrics');
      setMetrics({
        totalRevenue: 0,
        totalCollected: 0,
        outstandingAmount: 0,
        totalMpesaPayments: 0,
        collectionRate: 0,
        totalStudents: 0,
        defaultersCount: 0
      });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching finance metrics for school:', user.school_id);

      // Fetch fees data with error handling
      const { data: feesData, error: feesError } = await supabase
        .from('fees')
        .select('amount, paid_amount, due_date, status')
        .eq('school_id', user.school_id);

      if (feesError) {
        console.error('Error fetching fees:', feesError);
        // Continue with empty data rather than failing completely
      }

      // Fetch students count with error handling
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .eq('school_id', user.school_id)
        .eq('is_active', true);

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
      }

      // Fetch MPESA transactions with error handling
      const { data: mpesaData, error: mpesaError } = await supabase
        .from('mpesa_transactions')
        .select('amount_paid')
        .eq('school_id', user.school_id)
        .eq('transaction_status', 'Success');

      if (mpesaError) {
        console.error('Error fetching MPESA data:', mpesaError);
      }

      // Calculate metrics with safe defaults
      const fees = feesData || [];
      const students = studentsData || [];
      const mpesaTransactions = mpesaData || [];

      const totalFees = fees.reduce((sum, fee) => {
        const amount = Number(fee.amount || 0);
        return sum + amount;
      }, 0);

      const totalPaid = fees.reduce((sum, fee) => {
        const paidAmount = Number(fee.paid_amount || 0);
        return sum + paidAmount;
      }, 0);

      const outstandingAmount = totalFees - totalPaid;
      
      const totalMpesaPayments = mpesaTransactions.reduce((sum, txn) => {
        const amount = Number(txn.amount_paid || 0);
        return sum + amount;
      }, 0);

      const collectionRate = totalFees > 0 ? Math.round((totalPaid / totalFees) * 100) : 0;
      const totalStudents = students.length;

      // Find defaulters
      const today = new Date();
      const defaultersList = fees.filter(fee => {
        const dueDate = new Date(fee.due_date);
        const isPastDue = dueDate < today;
        const feeAmount = Number(fee.amount || 0);
        const paidAmount = Number(fee.paid_amount || 0);
        const hasOutstanding = feeAmount > paidAmount;
        return isPastDue && hasOutstanding;
      });

      const calculatedMetrics = {
        totalRevenue: totalFees,
        totalCollected: totalPaid,
        outstandingAmount,
        totalMpesaPayments,
        collectionRate,
        totalStudents,
        defaultersCount: defaultersList.length
      };

      console.log('Finance metrics calculated:', calculatedMetrics);
      setMetrics(calculatedMetrics);

    } catch (err: any) {
      console.error('Error fetching finance metrics:', err);
      setError(err);
      // Set default metrics even on error
      setMetrics({
        totalRevenue: 0,
        totalCollected: 0,
        outstandingAmount: 0,
        totalMpesaPayments: 0,
        collectionRate: 0,
        totalStudents: 0,
        defaultersCount: 0
      });
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
