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
      // Query the fees table which exists in the database
      const { data, error } = await supabase
        .from('fees')
        .select(`
          *,
          student:students(name, admission_number),
          class:classes(name)
        `)
        .eq('school_id', user.school_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map the fees data to match StudentFee interface
      const mappedData = (data || []).map(item => {
        const studentData = item.student && typeof item.student === 'object' && item.student !== null && 'name' in item.student
          ? { name: (item.student as any).name, admission_number: (item.student as any).admission_number }
          : undefined;
          
        const classData = item.class && typeof item.class === 'object' && item.class !== null && 'name' in item.class
          ? { name: (item.class as any).name }
          : undefined;
          
        return {
          id: item.id,
          student_id: item.student_id || '',
          school_id: item.school_id || '',
          fee_structure_id: undefined,
          class_id: item.class_id,
          amount: item.amount || 0,
          amount_paid: item.paid_amount || 0,
          status: item.status === 'paid' ? 'paid' : 
                 item.status === 'partial' ? 'partial' : 
                 item.status === 'overdue' ? 'overdue' : 'unpaid',
          due_date: item.due_date || '',
          academic_year: item.academic_year || '',
          term: item.term || '',
          installment_plan: {},
          discount_amount: item.discount_amount || 0,
          discount_type: 'none' as const,
          late_fee_applied: item.late_fee_amount || 0,
          payment_method: item.payment_method,
          payment_date: item.paid_date,
          receipt_number: undefined,
          notes: undefined,
          created_at: item.created_at || '',
          updated_at: item.updated_at || '',
          student: studentData,
          class: classData
        };
      }) as StudentFee[];
      
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
      // Map StudentFee data to fees table structure
      const { data, error } = await supabase
        .from('fees')
        .insert({
          student_id: feeData.student_id,
          school_id: user.school_id,
          class_id: feeData.class_id,
          amount: feeData.amount,
          paid_amount: feeData.amount_paid || 0,
          status: feeData.status === 'paid' ? 'paid' : 
                 feeData.status === 'partial' ? 'partial' : 'pending',
          due_date: feeData.due_date,
          academic_year: feeData.academic_year,
          term: feeData.term,
          discount_amount: feeData.discount_amount || 0,
          late_fee_amount: feeData.late_fee_applied || 0,
          payment_method: feeData.payment_method,
          paid_date: feeData.payment_date,
          category: 'Tuition', // Default category
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

      // Create fee records for all students using fees table
      const feeRecords = students.map(student => ({
        student_id: student.id,
        class_id: classId,
        school_id: user.school_id,
        amount: feeData.amount,
        paid_amount: 0,
        status: 'pending',
        due_date: feeData.due_date,
        academic_year: feeData.academic_year,
        term: feeData.term,
        category: 'Tuition',
        discount_amount: 0,
        late_fee_amount: 0,
      }));

      const { error: insertError } = await supabase
        .from('fees')
        .insert(feeRecords);

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
      // Map updates to fees table structure
      const updateData: any = {};
      
      if (updates.amount !== undefined) updateData.amount = updates.amount;
      if (updates.amount_paid !== undefined) updateData.paid_amount = updates.amount_paid;
      if (updates.status !== undefined) {
        updateData.status = updates.status === 'paid' ? 'paid' : 
                           updates.status === 'partial' ? 'partial' : 'pending';
      }
      if (updates.due_date !== undefined) updateData.due_date = updates.due_date;
      if (updates.payment_method !== undefined) updateData.payment_method = updates.payment_method;
      if (updates.payment_date !== undefined) updateData.paid_date = updates.payment_date;

      const { error } = await supabase
        .from('fees')
        .update(updateData)
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
        .from('fees')
        .update({
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
