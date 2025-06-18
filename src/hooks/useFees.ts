
import { useState, useEffect, useCallback } from 'react';
import { useSchoolScopedData } from './useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Fee {
  id: string;
  school_id: string;
  fee_name: string;
  amount: number;
  term_id?: string;
  class_id?: string;
  due_date: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface StudentFee {
  id: string;
  school_id: string;
  student_id: string;
  fee_id: string;
  status: 'paid' | 'unpaid' | 'partial';
  amount_paid: number;
  due_date: string;
  created_at: string;
  updated_at: string;
  fee?: Fee;
  student?: {
    id: string;
    name: string;
    admission_number: string;
  };
}

export const useFees = () => {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isSystemAdmin, schoolId } = useSchoolScopedData();
  const { toast } = useToast();

  const fetchFees = useCallback(async () => {
    if (!schoolId && !isSystemAdmin) {
      setFees([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('fees').select('*');

      if (!isSystemAdmin && schoolId) {
        query = query.eq('school_id', schoolId);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setFees(data || []);
      setError(null);
    } catch (err: any) {
      const message = err?.message || 'Failed to fetch fees';
      setError(message);
      setFees([]);
      toast({
        title: "Fees Fetch Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isSystemAdmin, schoolId, toast]);

  const createFee = async (feeData: {
    fee_name: string;
    amount: number;
    term_id?: string;
    class_id?: string;
    due_date: string;
    description?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('fees')
        .insert({
          ...feeData,
          school_id: schoolId,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Fee Created",
        description: `Fee ${feeData.fee_name} has been created and assigned to students.`,
      });

      fetchFees();
      return { data, error: null };
    } catch (err: any) {
      const message = err?.message || 'Failed to create fee';
      toast({
        title: "Create Error",
        description: message,
        variant: "destructive",
      });
      return { data: null, error: message };
    }
  };

  const updateFee = async (id: string, updates: Partial<Fee>) => {
    try {
      const { data, error } = await supabase
        .from('fees')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Fee Updated",
        description: "Fee has been updated successfully.",
      });

      fetchFees();
      return { data, error: null };
    } catch (err: any) {
      const message = err?.message || 'Failed to update fee';
      toast({
        title: "Update Error",
        description: message,
        variant: "destructive",
      });
      return { data: null, error: message };
    }
  };

  const deleteFee = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fees')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Fee Deleted",
        description: "Fee has been deleted successfully.",
      });

      fetchFees();
      return { error: null };
    } catch (err: any) {
      const message = err?.message || 'Failed to delete fee';
      toast({
        title: "Delete Error",
        description: message,
        variant: "destructive",
      });
      return { error: message };
    }
  };

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  return {
    fees,
    loading,
    error,
    createFee,
    updateFee,
    deleteFee,
    refetch: fetchFees
  };
};

export const useStudentFees = (studentId?: string) => {
  const [studentFees, setStudentFees] = useState<StudentFee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isSystemAdmin, schoolId } = useSchoolScopedData();
  const { toast } = useToast();

  const fetchStudentFees = useCallback(async () => {
    if (!schoolId && !isSystemAdmin) {
      setStudentFees([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('student_fees')
        .select(`
          *,
          fee:fees(id, fee_name, amount, due_date, description),
          student:students(id, name, admission_number)
        `);

      if (!isSystemAdmin && schoolId) {
        query = query.eq('school_id', schoolId);
      }

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setStudentFees(data || []);
      setError(null);
    } catch (err: any) {
      const message = err?.message || 'Failed to fetch student fees';
      setError(message);
      setStudentFees([]);
      toast({
        title: "Student Fees Fetch Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isSystemAdmin, schoolId, studentId, toast]);

  const updateStudentFeePayment = async (
    id: string, 
    amountPaid: number, 
    status: 'paid' | 'unpaid' | 'partial'
  ) => {
    try {
      const { data, error } = await supabase
        .from('student_fees')
        .update({ 
          amount_paid: amountPaid, 
          status,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Payment Updated",
        description: "Student fee payment has been updated successfully.",
      });

      fetchStudentFees();
      return { data, error: null };
    } catch (err: any) {
      const message = err?.message || 'Failed to update payment';
      toast({
        title: "Update Error",
        description: message,
        variant: "destructive",
      });
      return { data: null, error: message };
    }
  };

  useEffect(() => {
    fetchStudentFees();
  }, [fetchStudentFees]);

  return {
    studentFees,
    loading,
    error,
    updateStudentFeePayment,
    refetch: fetchStudentFees
  };
};
