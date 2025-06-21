import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FeeRecord {
  id: string;
  student_id: string;
  class_id: string;
  amount: number;
  paid_amount: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  due_date: string;
  academic_year: string;
  term: string;
  category: string;
  student?: {
    name: string;
    admission_number: string;
  };
  class?: {
    name: string;
  };
}

interface MPESATransaction {
  id: string;
  transaction_id: string;
  mpesa_receipt_number: string;
  phone_number: string;
  amount_paid: number;
  transaction_date: string;
  transaction_status: string;
  student?: {
    name: string;
    admission_number: string;
  };
  class?: {
    name: string;
  };
}

interface ClassSummary {
  class_id: string;
  class_name: string;
  total_amount: number;
  paid_amount: number;
  balance: number;
  student_count: number;
  // Legacy aliases for backward compatibility
  total_fees?: number;
  collected?: number;
  outstanding?: number;
}

interface FeeStructure {
  id: string;
  name: string;
  academic_year: string;
  term: string;
  is_active: boolean;
  created_at: string;
  items?: {
    id: string;
    name: string;
    amount: number;
    category: string;
  }[];
}

export const useFeeManagement = () => {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [mpesaTransactions, setMpesaTransactions] = useState<MPESATransaction[]>([]);
  const [classSummaries, setClassSummaries] = useState<ClassSummary[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFees = async () => {
    if (!user?.school_id) return;

    try {
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
      
      // Transform the data to match our interface with proper null safety
      const transformedData: FeeRecord[] = (data || []).map(fee => ({
        id: fee.id,
        student_id: fee.student_id || '',
        class_id: fee.class_id || '',
        amount: fee.amount || 0,
        paid_amount: fee.paid_amount || 0,
        status: (['pending', 'partial', 'paid', 'overdue'].includes(fee.status) 
          ? fee.status 
          : 'pending') as 'pending' | 'partial' | 'paid' | 'overdue',
        due_date: fee.due_date || '',
        academic_year: fee.academic_year || '',
        term: fee.term || '',
        category: fee.category || '',
        student: (fee.student && fee.student !== null && typeof fee.student === 'object' && 'name' in fee.student)
          ? { 
              name: String(fee.student.name || ''), 
              admission_number: String(fee.student.admission_number || '') 
            }
          : undefined,
        class: (fee.class && fee.class !== null && typeof fee.class === 'object' && 'name' in fee.class)
          ? { name: String(fee.class.name || '') }
          : undefined
      }));
      
      setFees(transformedData);
    } catch (err: any) {
      console.error('Error fetching fees:', err);
      setError(err.message);
    }
  };

  const fetchMPESATransactions = async () => {
    if (!user?.school_id) return;

    try {
      const { data, error } = await supabase
        .from('mpesa_transactions')
        .select(`
          *,
          student:students(name, admission_number),
          class:classes(name)
        `)
        .eq('school_id', user.school_id)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      
      // Transform the data with proper null safety
      const transformedData: MPESATransaction[] = (data || []).map(transaction => ({
        id: transaction.id,
        transaction_id: transaction.transaction_id || '',
        mpesa_receipt_number: transaction.mpesa_receipt_number || '',
        phone_number: transaction.phone_number || '',
        amount_paid: transaction.amount_paid || 0,
        transaction_date: transaction.transaction_date || '',
        transaction_status: transaction.transaction_status || '',
        student: (transaction.student && transaction.student !== null && typeof transaction.student === 'object' && 'name' in transaction.student)
          ? { 
              name: String(transaction.student.name || ''), 
              admission_number: String(transaction.student.admission_number || '') 
            }
          : undefined,
        class: (transaction.class && transaction.class !== null && typeof transaction.class === 'object' && 'name' in transaction.class)
          ? { name: String(transaction.class.name || '') }
          : undefined
      }));
      
      setMpesaTransactions(transformedData);
    } catch (err: any) {
      console.error('Error fetching MPESA transactions:', err);
    }
  };

  const fetchClassSummaries = async () => {
    if (!user?.school_id) return;

    try {
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id, name')
        .eq('school_id', user.school_id);

      if (classError) throw classError;

      const summaries: ClassSummary[] = [];
      
      for (const cls of classData || []) {
        const { data: feeData, error: feeError } = await supabase
          .from('fees')
          .select('amount, paid_amount, student_id')
          .eq('class_id', cls.id)
          .eq('school_id', user.school_id);

        if (feeError) continue;

        const totalAmount = feeData?.reduce((sum, fee) => sum + (fee.amount || 0), 0) || 0;
        const paidAmount = feeData?.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0) || 0;
        const studentCount = new Set(feeData?.map(fee => fee.student_id).filter(Boolean)).size;
        const balance = totalAmount - paidAmount;

        const summary: ClassSummary = {
          class_id: cls.id,
          class_name: cls.name,
          total_amount: totalAmount,
          paid_amount: paidAmount,
          balance: balance,
          student_count: studentCount,
          // Add legacy aliases for backward compatibility
          total_fees: totalAmount,
          collected: paidAmount,
          outstanding: balance
        };

        summaries.push(summary);
      }

      setClassSummaries(summaries);
    } catch (err: any) {
      console.error('Error fetching class summaries:', err);
    }
  };

  const fetchFeeStructures = async () => {
    if (!user?.school_id) return;

    try {
      const { data, error } = await supabase
        .from('fee_structures')
        .select(`
          *,
          items:fee_structure_items(*)
        `)
        .eq('school_id', user.school_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeeStructures(data || []);
    } catch (err: any) {
      console.error('Error fetching fee structures:', err);
    }
  };

  const fetchClasses = async () => {
    if (!user?.school_id) return;

    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('school_id', user.school_id);

      if (error) throw error;
      setClasses(data || []);
    } catch (err: any) {
      console.error('Error fetching classes:', err);
    }
  };

  const fetchStudents = async () => {
    if (!user?.school_id) return;

    try {
      const { data, error } = await supabase
        .from('students')
        .select('*, class:classes(name)')
        .eq('school_id', user.school_id)
        .eq('is_active', true);

      if (error) throw error;
      setStudents(data || []);
    } catch (err: any) {
      console.error('Error fetching students:', err);
    }
  };

  const assignFeeToClass = async (classId: string, feeData: {
    amount: number;
    due_date: string;
    academic_year: string;
    term: string;
    category: string;
  }) => {
    try {
      const { data, error } = await supabase.rpc('assign_fee_to_class', {
        p_class_id: classId,
        p_fee_data: feeData
      });

      if (error) throw error;

      // Handle the response safely
      if (data && typeof data === 'object' && 'success' in data && data.success) {
        toast({
          title: "Success",
          description: (typeof data === 'object' && 'message' in data && typeof data.message === 'string') 
            ? data.message 
            : "Fee assigned successfully",
        });
        await fetchFees();
        await fetchClassSummaries();
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
    }
  };

  const assignFeeToStudent = async (studentId: string, feeData: {
    amount: number;
    due_date: string;
    academic_year: string;
    term: string;
    category: string;
  }) => {
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
      await fetchFees();
      await fetchClassSummaries();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const recordPayment = async (feeId: string, paymentData: {
    amount: number;
    payment_method: string;
    mpesa_code?: string;
    reference_number?: string;
  }) => {
    try {
      const { data, error } = await supabase.rpc('record_fee_payment', {
        p_student_fee_id: feeId,
        p_amount: paymentData.amount,
        p_payment_method: paymentData.payment_method,
        p_mpesa_code: paymentData.mpesa_code,
        p_reference_number: paymentData.reference_number
      });

      if (error) throw error;

      // Handle the response safely
      if (data && typeof data === 'object' && 'success' in data && data.success) {
        toast({
          title: "Success",
          description: "Payment recorded successfully",
        });
        await fetchFees();
        await fetchMPESATransactions();
        await fetchClassSummaries();
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
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      if (user?.school_id) {
        setLoading(true);
        await Promise.all([
          fetchFees(),
          fetchMPESATransactions(),
          fetchClassSummaries(),
          fetchFeeStructures(),
          fetchClasses(),
          fetchStudents()
        ]);
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user?.school_id]);

  return {
    fees,
    mpesaTransactions,
    classSummaries,
    feeStructures,
    classFeesSummary: classSummaries, // Alias for backward compatibility
    classes,
    students,
    loading,
    error,
    assignFeeToClass,
    assignFeeToStudent,
    recordPayment,
    refetch: () => {
      fetchFees();
      fetchMPESATransactions();
      fetchClassSummaries();
      fetchFeeStructures();
    }
  };
};
