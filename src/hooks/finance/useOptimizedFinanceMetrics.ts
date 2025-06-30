
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface OptimizedFinanceMetrics {
  totalRevenue: number;
  totalCollected: number;
  outstandingAmount: number;
  totalMpesaPayments: number;
  collectionRate: number;
  totalStudents: number;
  defaultersCount: number;
}

export const useOptimizedFinanceMetrics = () => {
  const [metrics, setMetrics] = useState<OptimizedFinanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchOptimizedMetrics = async () => {
    if (!user?.school_id) {
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

      // Use Promise.all for parallel queries with optimized selects
      const [feesResult, studentsResult, mpesaResult] = await Promise.all([
        // Optimized fees query - only get necessary aggregated data
        supabase
          .from('fees')
          .select('amount, paid_amount, due_date')
          .eq('school_id', user.school_id)
          .not('amount', 'is', null)
          .limit(500), // Limit to recent records

        // Optimized students count - use count instead of fetching all records
        supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', user.school_id)
          .eq('is_active', true),

        // Optimized MPESA query - only sum amounts
        supabase
          .from('financial_transactions')
          .select('amount')
          .eq('school_id', user.school_id)
          .eq('payment_method', 'mpesa')
          .not('amount', 'is', null)
          .limit(200) // Limit to recent transactions
      ]);

      // Process results with safe defaults
      const fees = feesResult.data || [];
      const studentsCount = studentsResult.count || 0;
      const mpesaTransactions = mpesaResult.data || [];

      // Calculate metrics efficiently
      let totalFees = 0;
      let totalPaid = 0;
      let defaultersCount = 0;
      const today = new Date();

      fees.forEach(fee => {
        const amount = Number(fee.amount || 0);
        const paidAmount = Number(fee.paid_amount || 0);
        
        totalFees += amount;
        totalPaid += paidAmount;
        
        // Count defaulters efficiently
        if (fee.due_date && amount > paidAmount) {
          const dueDate = new Date(fee.due_date);
          if (dueDate < today) {
            defaultersCount++;
          }
        }
      });

      const totalMpesaPayments = mpesaTransactions.reduce((sum, txn) => {
        return sum + (Number(txn.amount) || 0);
      }, 0);

      const outstandingAmount = Math.max(0, totalFees - totalPaid);
      const collectionRate = totalFees > 0 ? Math.round((totalPaid / totalFees) * 100) : 0;

      setMetrics({
        totalRevenue: totalFees,
        totalCollected: totalPaid,
        outstandingAmount,
        totalMpesaPayments,
        collectionRate: Math.min(100, Math.max(0, collectionRate)),
        totalStudents: studentsCount,
        defaultersCount
      });

    } catch (err: any) {
      console.error('Optimized finance metrics error:', err);
      setError(err);
      // Set safe defaults on error
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
    if (user?.school_id) {
      fetchOptimizedMetrics();
    } else {
      setIsLoading(false);
    }
  }, [user?.school_id]);

  return {
    metrics,
    isLoading,
    error,
    refetch: fetchOptimizedMetrics
  };
};
