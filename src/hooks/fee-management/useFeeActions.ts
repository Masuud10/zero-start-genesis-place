
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FeeData, PaymentData } from './types';

export const useFeeActions = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const assignFeeToClass = async (classId: string, feeData: FeeData) => {
    try {
      // Convert FeeData to a plain JSON object for RPC call
      const feeDataJson = {
        amount: feeData.amount,
        due_date: feeData.due_date,
        academic_year: feeData.academic_year,
        term: feeData.term,
        category: feeData.category
      };

      const { data, error } = await supabase.rpc('assign_fee_to_class', {
        p_class_id: classId,
        p_fee_data: feeDataJson
      });

      if (error) throw error;

      if (data && typeof data === 'object' && 'success' in data && data.success) {
        toast({
          title: "Success",
          description: (typeof data === 'object' && 'message' in data && typeof data.message === 'string') 
            ? data.message 
            : "Fee assigned successfully",
        });
        return true;
      } else {
        const errorMessage = (typeof data === 'object' && 'error' in data && typeof data.error === 'string') 
          ? data.error 
          : 'Failed to assign fee';
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const assignFeeToStudent = async (studentId: string, feeData: FeeData, students: any[]) => {
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) throw new Error('Student not found');

      const { error } = await supabase
        .from('fees')
        .insert({
          school_id: user?.school_id,
          student_id: studentId,
          class_id: student.class_id,
          amount: feeData.amount,
          due_date: feeData.due_date,
          academic_year: feeData.academic_year,
          term: feeData.term,
          category: feeData.category,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fee assigned to student successfully",
      });
      return true;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const recordPayment = async (feeId: string, paymentData: PaymentData) => {
    try {
      const { data, error } = await supabase.rpc('record_fee_payment', {
        p_student_fee_id: feeId,
        p_amount: paymentData.amount,
        p_payment_method: paymentData.payment_method,
        p_mpesa_code: paymentData.mpesa_code,
        p_reference_number: paymentData.reference_number
      });

      if (error) throw error;

      if (data && typeof data === 'object' && 'success' in data && data.success) {
        toast({
          title: "Success",
          description: "Payment recorded successfully",
        });
        return true;
      } else {
        const errorMessage = (typeof data === 'object' && 'error' in data && typeof data.error === 'string') 
          ? data.error 
          : 'Failed to record payment';
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    assignFeeToClass,
    assignFeeToStudent,
    recordPayment
  };
};
