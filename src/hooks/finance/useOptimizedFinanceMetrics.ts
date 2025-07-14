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
  const { user } = useAuth();

  const fetchOptimizedMetrics = useCallback(async () => {
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
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setLoadingTimeout(false);

      console.log('💰 Starting ultra-optimized finance metrics fetch for school:', user.school_id);

      // Ultra-fast timeout control
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.error('💰 Finance metrics query timed out');
        setLoadingTimeout(true);
      }, 6000); // Increased to 6 seconds for better reliability

      // Ultra-optimized parallel queries with minimal data fetching
      const [feesResult, studentsResult] = await Promise.allSettled([
        // Get fees summary data only - no need to fetch 1000 rows
        supabase
          .from('fees')
          .select('amount, paid_amount, status')
          .eq('school_id', user.school_id)
          .limit(100) // Reduced from 1000 to 100 for faster response
          .abortSignal(controller.signal),

        // Get student count using count query
        supabase
          .from('students')
          .select('id', { count: 'exact', head: true })
          .eq('school_id', user.school_id)
          .eq('is_active', true)
          .abortSignal(controller.signal)
      ]);

      clearTimeout(timeoutId);

      // Process results safely
      const feesData = feesResult.status === 'fulfilled' ? feesResult.value.data : [];
      const studentCount = studentsResult.status === 'fulfilled' ? (studentsResult.value.count || 0) : 0;

      // Calculate metrics efficiently
      const totalRevenue = feesData.reduce((sum, fee) => sum + (parseFloat(String(fee.amount || 0))), 0);
      const totalCollected = feesData.reduce((sum, fee) => sum + (parseFloat(String(fee.paid_amount || 0))), 0);
      const outstandingAmount = Math.max(0, totalRevenue - totalCollected);
      const totalMpesaPayments = 0; // Placeholder - mpesa table not available
      const collectionRate = totalRevenue > 0 ? Math.round((totalCollected / totalRevenue) * 100) : 0;
      const defaultersCount = feesData.filter(fee => 
        parseFloat(String(fee.amount || 0)) > parseFloat(String(fee.paid_amount || 0))
      ).length;

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

    } catch (err: unknown) {
      console.error('\u274c Finance metrics error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch finance metrics';
      setError(new Error(errorMessage));
      setLoadingTimeout(false);
    } finally {
      setIsLoading(false);
    }
  }, [user?.school_id]);

  useEffect(() => {
    fetchOptimizedMetrics();
  }, [fetchOptimizedMetrics]);

  return { 
    metrics, 
    isLoading: isLoading && !loadingTimeout, 
    error, 
    loadingTimeout,
    refetch: fetchOptimizedMetrics 
  };
};