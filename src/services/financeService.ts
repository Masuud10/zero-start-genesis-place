
import { DataServiceCore } from './core/dataServiceCore';
import { MultiTenantUtils } from '@/utils/multiTenantUtils';
import { supabase } from '@/integrations/supabase/client';

interface DatabaseFeeInsert {
  student_id: string;
  school_id?: string;
  amount: number;
  due_date: string;
  term: string;
  category?: 'tuition' | 'transport' | 'meals' | 'activities' | 'other';
  status?: 'pending' | 'paid' | 'partial' | 'overdue';
  paid_amount?: number;
  paid_date?: string;
  payment_method?: 'mpesa' | 'cash' | 'bank_transfer' | 'card' | 'cheque';
  mpesa_code?: string;
  academic_year?: string;
  installment_number?: number;
  late_fee_amount?: number;
  discount_amount?: number;
}

interface DatabaseTransactionInsert {
  school_id: string;
  student_id?: string;
  fee_id?: string;
  transaction_type: 'payment' | 'refund' | 'adjustment' | 'late_fee';
  amount: number;
  payment_method?: 'cash' | 'mpesa' | 'bank_transfer' | 'card' | 'cheque';
  reference_number?: string;
  mpesa_code?: string;
  bank_reference?: string;
  description?: string;
  processed_by?: string;
  processed_at?: string;
  academic_year?: string;
  term?: string;
}

export interface FinancialData {
  id: string;
  student_id: string;
  school_id: string;
  amount: number;
  due_date: string;
  term: string;
  category: 'tuition' | 'transport' | 'meals' | 'activities' | 'other';
  status: 'pending' | 'paid' | 'partial' | 'overdue';
  paid_amount: number;
  paid_date?: string;
  payment_method?: 'mpesa' | 'cash' | 'bank_transfer' | 'card' | 'cheque';
  mpesa_code?: string;
  academic_year: string;
  installment_number: number;
  late_fee_amount: number;
  discount_amount: number;
  created_at: string;
  updated_at: string;
}

export class FinanceService {
  static async createFee(feeData: Partial<FinancialData>) {
    const dbData: DatabaseFeeInsert = {
      student_id: feeData.student_id!,
      school_id: feeData.school_id,
      amount: feeData.amount!,
      due_date: feeData.due_date!,
      term: feeData.term!,
      category: feeData.category,
      status: feeData.status,
      paid_amount: feeData.paid_amount,
      paid_date: feeData.paid_date,
      payment_method: feeData.payment_method,
      mpesa_code: feeData.mpesa_code,
      academic_year: feeData.academic_year,
      installment_number: feeData.installment_number,
      late_fee_amount: feeData.late_fee_amount,
      discount_amount: feeData.discount_amount
    };

    return DataServiceCore.createRecord('fees', dbData);
  }

  static async updateFee(id: string, updates: Partial<FinancialData>) {
    return DataServiceCore.updateRecord('fees', id, updates);
  }

  static async recordPayment(transactionData: any) {
    try {
      const scopedData = await MultiTenantUtils.ensureSchoolScope(transactionData);
      
      if (!scopedData.school_id) {
        throw new Error('School ID is required for payment transactions');
      }
      
      const dbData: DatabaseTransactionInsert = {
        school_id: scopedData.school_id,
        student_id: scopedData.student_id,
        fee_id: scopedData.fee_id,
        transaction_type: scopedData.transaction_type,
        amount: scopedData.amount,
        payment_method: scopedData.payment_method,
        reference_number: scopedData.reference_number,
        mpesa_code: scopedData.mpesa_code,
        bank_reference: scopedData.bank_reference,
        description: scopedData.description,
        processed_by: scopedData.processed_by,
        processed_at: scopedData.processed_at,
        academic_year: scopedData.academic_year,
        term: scopedData.term
      };

      const { data, error } = await supabase
        .from('financial_transactions')
        .insert(dbData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error recording payment:', error);
      return { data: null, error };
    }
  }

  static async getFees(filters?: Record<string, any>) {
    return DataServiceCore.fetchRecords<FinancialData>('fees', filters);
  }
}
