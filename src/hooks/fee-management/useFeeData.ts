
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FeeRecord } from './types';
import { transformFeeRecord } from './utils/dataTransformers';

export const useFeeData = () => {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchFees = async () => {
    if (!user?.school_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching fees for school:', user.school_id);

      const { data, error: fetchError } = await supabase
        .from('fees')
        .select(`
          *,
          students!fees_student_id_fkey(name, admission_number),
          classes!fees_class_id_fkey(name)
        `)
        .eq('school_id', user.school_id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Supabase error fetching fees:', fetchError);
        throw new Error(`Failed to fetch fees: ${fetchError.message}`);
      }

      console.log('✅ Fees data fetched:', data?.length || 0, 'records');
      
      const transformedData: FeeRecord[] = (data || []).map((item, index) => {
        try {
          return transformFeeRecord(item);
        } catch (transformError) {
          console.error(`Error transforming fee record ${index}:`, transformError);
          // Return a basic structure if transformation fails
          return {
            id: item.id,
            studentId: item.student_id || '',
            amount: item.amount || 0,
            dueDate: item.due_date || new Date().toISOString(),
            term: item.term || '',
            category: item.category || 'Unknown',
            status: (item.status as 'pending' | 'paid' | 'partial' | 'overdue') || 'pending',
            paidAmount: item.paid_amount || 0,
            studentName: item.students?.name || 'Unknown Student',
            admissionNumber: item.students?.admission_number || 'N/A',
            className: item.classes?.name || 'Unknown Class',
            academicYear: item.academic_year || new Date().getFullYear().toString(),
            paymentMethod: item.payment_method,
            paidDate: item.paid_date,
            createdAt: item.created_at || new Date().toISOString(),
            classId: item.class_id,
          };
        }
      });
      
      setFees(transformedData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching fees:', err);
      setError(err.message || 'Failed to fetch student fees');
      setFees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, [user?.school_id]);

  return {
    fees,
    loading,
    error,
    refetch: fetchFees
  };
};
