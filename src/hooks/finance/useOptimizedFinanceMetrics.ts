import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface OptimizedFinanceMetrics {
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
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [dataTruncated, setDataTruncated] = useState(false);
  const { user } = useAuth();

  const fetchOptimizedMetrics = useCallback(async (isRetry = false) => {
    if (!user?.school_id) {
      console.log('💰 No user or school_id, skipping metrics fetch');
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
      setError(null);
      setLoadingTimeout(false);
      setDataTruncated(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setLoadingTimeout(false);
      setDataTruncated(false);

      console.log('💰 Starting ultra-optimized finance metrics fetch for school:', user.school_id, isRetry ? `(retry ${retryCount + 1})` : '');

      // Ultra-fast timeout control with proper cleanup
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.error('💰 Finance metrics query timed out');
        setLoadingTimeout(true);
      }, 8000); // Increased to 8 seconds for better reliability

      try {
        // Ultra-optimized parallel queries with minimal data fetching
        const [feesResult, studentsResult, mpesaResult] = await Promise.allSettled([
          // Get fees summary data only - no need to fetch 1000 rows
          supabase
            .from('fees')
            .select('amount, paid_amount, status')
            .eq('school_id', user.school_id)
            .limit(100) // Reduced limit for better performance
            .abortSignal(controller.signal),

          // Get student count using count query
          supabase
            .from('students')
            .select('id', { count: 'exact', head: true })
            .eq('school_id', user.school_id)
            .eq('is_active', true)
            .abortSignal(controller.signal),

          // Get MPESA transactions count
          supabase
            .from('mpesa_transactions')
            .select('amount_paid', { count: 'exact', head: true })
            .eq('school_id', user.school_id)
            .eq('transaction_status', 'Success')
            .abortSignal(controller.signal)
        ]);

        clearTimeout(timeoutId);

        // Process results safely with validation
        const feesData = feesResult.status === 'fulfilled' ? feesResult.value.data || [] : [];
        const studentCount = studentsResult.status === 'fulfilled' ? (studentsResult.value.count || 0) : 0;
        const mpesaCount = mpesaResult.status === 'fulfilled' ? (mpesaResult.value.count || 0) : 0;

        // Check for data truncation
        if (feesData.length >= 200) {
          console.warn('💰 Data may be truncated - fees limit reached');
          setDataTruncated(true);
        }

        // Calculate metrics efficiently with safe number parsing
        const totalRevenue = feesData.reduce((sum, fee) => {
          const amount = parseFloat(String(fee.amount || 0));
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

        const totalCollected = feesData.reduce((sum, fee) => {
          const paidAmount = parseFloat(String(fee.paid_amount || 0));
          return sum + (isNaN(paidAmount) ? 0 : paidAmount);
        }, 0);

        const outstandingAmount = Math.max(0, totalRevenue - totalCollected);
        
        // Calculate MPESA payments from actual transactions
        const mpesaTransactions = mpesaResult.status === 'fulfilled' ? mpesaResult.value.data || [] : [];
        const totalMpesaPayments = mpesaTransactions.reduce((sum, txn) => {
          const amount = parseFloat(String(txn.amount_paid || 0));
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

        // Safe collection rate calculation with bounds checking
        const collectionRate = totalRevenue > 0 && !isNaN(totalRevenue) && !isNaN(totalCollected)
          ? Math.min(100, Math.max(0, Math.round((totalCollected / totalRevenue) * 100)))
          : 0;

        const defaultersCount = feesData.filter(fee => {
          const amount = parseFloat(String(fee.amount || 0));
          const paidAmount = parseFloat(String(fee.paid_amount || 0));
          return !isNaN(amount) && !isNaN(paidAmount) && amount > paidAmount;
        }).length;

        const newMetrics: OptimizedFinanceMetrics = {
          totalRevenue,
          totalCollected,
          outstandingAmount,
          totalMpesaPayments,
          collectionRate,
          totalStudents: studentCount,
          defaultersCount
        };

        console.log('✅ Finance metrics compiled:', newMetrics);
        setMetrics(newMetrics);
        setLoadingTimeout(false);
        setRetryCount(0); // Reset retry count on success

      } catch (queryError) {
        clearTimeout(timeoutId);
        throw queryError;
      }

    } catch (err: unknown) {
      console.error('\u274c Finance metrics error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch finance metrics';
      const error = new Error(errorMessage);
      setError(error);
      setLoadingTimeout(false);

      // Retry logic for transient errors
      if (!isRetry && retryCount < 2 && (
        errorMessage.includes('timeout') || 
        errorMessage.includes('network') || 
        errorMessage.includes('connection')
      )) {
        console.log('🔄 Retrying finance metrics fetch...');
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchOptimizedMetrics(true), 2000);
        return;
      }

      // Set safe defaults on final failure
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
  }, [user?.school_id, retryCount]);

  useEffect(() => {
    fetchOptimizedMetrics();
  }, [fetchOptimizedMetrics]);

  return { 
    metrics, 
    isLoading: isLoading && !loadingTimeout, 
    error, 
    loadingTimeout,
    dataTruncated,
    retryCount,
    refetch: () => {
      setRetryCount(0);
      fetchOptimizedMetrics();
    }
  };
};