
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useFeeActions = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const assignFeeToClass = async (classId: string, feeData: any) => {
    if (!user?.school_id) return false;

    try {
      setLoading(true);
      
      // Get all students in the class
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .eq('class_id', classId)
        .eq('school_id', user.school_id);

      if (studentsError) throw studentsError;

      // Create fee records for each student
      const feeRecords = students.map(student => ({
        ...feeData,
        student_id: student.id,
        class_id: classId,
        school_id: user.school_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('fees')
        .insert(feeRecords);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Fee assigned to ${students.length} students in the class`,
      });

      return true;
    } catch (error: any) {
      console.error('Error assigning fee to class:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign fee to class",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const assignFeeToStudent = async (studentId: string, feeData: any, students: any[]) => {
    if (!user?.school_id) return false;

    try {
      setLoading(true);

      const student = students.find(s => s.id === studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      const feeRecord = {
        ...feeData,
        student_id: studentId,
        class_id: student.class_id,
        school_id: user.school_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('fees')
        .insert([feeRecord]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fee assigned to student successfully",
      });

      return true;
    } catch (error: any) {
      console.error('Error assigning fee to student:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign fee to student",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const recordPayment = async (feeId: string, paymentData: any) => {
    if (!user?.school_id) return false;

    try {
      setLoading(true);

      // Update the fee record with payment information
      const { error } = await supabase
        .from('fees')
        .update({
          paid_amount: paymentData.amount,
          payment_method: paymentData.payment_method,
          paid_date: new Date().toISOString(),
          status: paymentData.amount >= paymentData.total_amount ? 'paid' : 'partial',
          mpesa_code: paymentData.mpesa_code,
          updated_at: new Date().toISOString()
        })
        .eq('id', feeId)
        .eq('school_id', user.school_id);

      if (error) throw error;

      // Create a financial transaction record
      const transactionData = {
        school_id: user.school_id,
        fee_id: feeId,
        student_id: paymentData.student_id,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        transaction_type: 'payment',
        reference_number: paymentData.reference_number,
        mpesa_code: paymentData.mpesa_code,
        description: `Fee payment for ${paymentData.category}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: transactionError } = await supabase
        .from('financial_transactions')
        .insert([transactionData]);

      if (transactionError) {
        console.warn('Failed to create financial transaction record:', transactionError);
      }

      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });

      return true;
    } catch (error: any) {
      console.error('Error recording payment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to record payment",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    assignFeeToClass,
    assignFeeToStudent,
    recordPayment,
    loading
  };
};
