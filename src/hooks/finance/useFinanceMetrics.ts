import { useState, useEffect, useCallback } from 'react';
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

  const fetchMetrics = useCallback(async () => {
    // Validate school ID before making queries
    if (!user?.school_id || user.school_id === 'null' || user.school_id === 'undefined') {
      console.warn('No valid school_id available for finance metrics:', user?.school_id);
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

    // Additional UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(user.school_id)) {
      console.error('Invalid UUID format for school ID:', user.school_id);
      setError(new Error('Invalid school ID format'));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching finance metrics for school:', user.school_id);

      // Verify school exists first
      const { data: schoolCheck, error: schoolCheckError } = await supabase
        .from('schools')
        .select('id')
        .eq('id', user.school_id)
        .single();

      if (schoolCheckError || !schoolCheck) {
        console.error('School not found or access denied:', schoolCheckError);
        throw new Error('School not found or access denied');
      }

      // Fetch fees data with proper error handling
      const { data: feesData, error: feesError } = await supabase
        .from('fees')
        .select('amount, paid_amount, due_date, status')
        .eq('school_id', user.school_id);

      if (feesError) {
        console.error('Error fetching fees:', feesError);
        throw feesError;
      }

      // Fetch students count with proper error handling
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .eq('school_id', user.school_id)
        .eq('is_active', true);

      if (studentsError) {
        console.warn('Error fetching students:', studentsError);
        // Don't throw, just log and continue with empty array
      }

      // Fetch MPESA transactions with proper error handling
      const { data: mpesaData, error: mpesaError } = await supabase
        .from('financial_transactions')
        .select('amount')
        .eq('school_id', user.school_id)
        .eq('payment_method', 'mpesa');

      if (mpesaError) {
        console.warn('Error fetching MPESA data:', mpesaError);
        // Don't throw, just log and continue with empty array
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
        const amount = Number(txn.amount || 0);
        return sum + amount;
      }, 0);

      // Fixed: Enhanced collection rate calculation with proper validation
      const collectionRate = totalFees > 0 && !isNaN(totalFees) && !isNaN(totalPaid) 
        ? Math.min(100, Math.round((totalPaid / totalFees) * 100)) 
        : 0;
      const totalStudents = students.length;

      // Find defaulters (fees past due date with outstanding amounts)
      const today = new Date();
      const defaultersList = fees.filter(fee => {
        if (!fee.due_date) return false;
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

      console.log('Finance metrics calculated successfully:', calculatedMetrics);
      setMetrics(calculatedMetrics);

    } catch (err: unknown) {
      console.error('Error fetching finance metrics:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
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
  }, [user?.school_id]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    isLoading,
    error,
    refetch: fetchMetrics
  };
};
