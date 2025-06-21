
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface StudentFee {
  id: string;
  student_id: string;
  school_id: string;
  fee_structure_id?: string;
  class_id?: string;
  amount: number;
  amount_paid: number;
  status: 'paid' | 'unpaid' | 'partial' | 'overdue';
  due_date: string;
  academic_year: string;
  term: string;
  installment_plan: any;
  discount_amount: number;
  discount_type: 'none' | 'percentage' | 'fixed';
  late_fee_applied: number;
  payment_method?: string;
  payment_date?: string;
  receipt_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  student?: {
    name: string;
    admission_number: string;
  };
  class?: {
    name: string;
  };
}

interface PaymentData {
  amount: number;
  payment_method: string;
  reference_number?: string;
  mpesa_code?: string;
  bank_reference?: string;
}

export const useStudentFees = () => {
  const [studentFees, setStudentFees] = useState<StudentFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchStudentFees = async () => {
    if (!user?.school_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('student_fees')
        .select(`
          *,
          student:students(name, admission_number),
          class:classes(name)
        `)
        .eq('school_id', user.school_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map data to match StudentFee interface
      const mappedData = (data || []).map(item => ({
        ...item,
        student: item.student && typeof item.student === 'object' && 'name' in item.student 
          ? { name: item.student.name, admission_number: item.student.admission_number }
          : undefined,
        class: item.class && typeof item.class === 'object' && 'name' in item.class
          ? { name: item.class.name }
          : undefined
      })) as StudentFee[];
      
      setStudentFees(mappedData);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to fetch student fees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createStudentFee = async (feeData: Partial<StudentFee>) => {
    if (!user?.school_id) return { error: 'No school associated with user' };

    try {
      const { data, error } = await supabase
        .from('student_fees')
        .insert({
          ...feeData,
          school_id: user.school_id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student fee created successfully",
      });

      fetchStudentFees(); // Refresh data
      return { data, error: null };
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Failed to create student fee: ${err.message}`,
        variant: "destructive",
      });
      return { error: err.message };
    }
  };

  const recordPayment = async (studentFeeId: string, paymentData: PaymentData) => {
    try {
      const { data, error } = await supabase.rpc('record_fee_payment', {
        p_student_fee_id: studentFeeId,
        p_amount: paymentData.amount,
        p_payment_method: paymentData.payment_method,
        p_reference_number: paymentData.reference_number,
        p_mpesa_code: paymentData.mpesa_code,
        p_bank_reference: paymentData.bank_reference,
      });

      if (error) throw error;

      // Handle the response data properly
      const result = data as any;
      if (result?.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Payment Recorded",
        description: `Payment of ${paymentData.amount} recorded successfully. Receipt: ${result?.transaction_id || 'Generated'}`,
      });

      fetchStudentFees(); // Refresh data
      return { data: result, error: null };
    } catch (err: any) {
      toast({
        title: "Payment Error",
        description: `Failed to record payment: ${err.message}`,
        variant: "destructive",
      });
      return { error: err.message };
    }
  };

  const assignFeeToClass = async (classId: string, feeData: {
    amount: number;
    due_date: string;
    academic_year: string;
    term: string;
    fee_structure_id?: string;
  }) => {
    if (!user?.school_id) return { error: 'No school associated with user' };

    try {
      // Get all students in the class
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .eq('class_id', classId)
        .eq('school_id', user.school_id)
        .eq('is_active', true);

      if (studentsError) throw studentsError;

      if (!students?.length) {
        throw new Error('No active students found in this class');
      }

      // Create student fee records for all students
      const studentFeeRecords = students.map(student => ({
        student_id: student.id,
        class_id: classId,
        school_id: user.school_id,
        amount: feeData.amount,
        amount_paid: 0,
        status: 'unpaid' as const,
        due_date: feeData.due_date,
        academic_year: feeData.academic_year,
        term: feeData.term,
        fee_structure_id: feeData.fee_structure_id,
        installment_plan: {},
        discount_amount: 0,
        discount_type: 'none' as const,
        late_fee_applied: 0,
      }));

      const { error: insertError } = await supabase
        .from('student_fees')
        .insert(studentFeeRecords);

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: `Fee assigned to ${students.length} students in the class`,
      });

      fetchStudentFees(); // Refresh data
      return { error: null };
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Failed to assign fee to class: ${err.message}`,
        variant: "destructive",
      });
      return { error: err.message };
    }
  };

  const updateStudentFee = async (id: string, updates: Partial<StudentFee>) => {
    try {
      const { error } = await supabase
        .from('student_fees')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student fee updated successfully",
      });

      fetchStudentFees(); // Refresh data
      return { error: null };
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Failed to update student fee: ${err.message}`,
        variant: "destructive",
      });
      return { error: err.message };
    }
  };

  const applyBulkDiscount = async (studentFeeIds: string[], discount: {
    type: 'percentage' | 'fixed',
    amount: number
  }) => {
    try {
      const { error } = await supabase
        .from('student_fees')
        .update({
          discount_type: discount.type,
          discount_amount: discount.amount
        })
        .in('id', studentFeeIds);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Discount applied to ${studentFeeIds.length} fees`,
      });

      fetchStudentFees(); // Refresh data
      return { error: null };
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Failed to apply bulk discount: ${err.message}`,
        variant: "destructive",
      });
      return { error: err.message };
    }
  };

  useEffect(() => {
    fetchStudentFees();
  }, [user?.school_id]);

  return {
    studentFees,
    loading,
    error,
    refetch: fetchStudentFees,
    createStudentFee,
    recordPayment,
    assignFeeToClass,
    updateStudentFee,
    applyBulkDiscount,
  };
};
