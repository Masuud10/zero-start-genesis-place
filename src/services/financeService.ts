
import { DataServiceCore } from './core/dataServiceCore';

interface DatabaseFinancialInsert {
  student_id?: string;
  school_id: string;
  amount: number;
  due_date: string;
  term: string;
  category?: string;
  status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
  academic_year?: string;
  paid_amount?: number;
  paid_date?: string;
  payment_method?: string;
  mpesa_code?: string;
  discount_amount?: number;
  late_fee_amount?: number;
  installment_number?: number;
}

export interface FinancialData {
  id: string;
  student_id?: string;
  school_id: string;
  amount: number;
  paid_amount: number;
  due_date: string;
  paid_date?: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  category: string;
  term: string;
  academic_year: string;
  payment_method?: string;
  mpesa_code?: string;
  discount_amount: number;
  late_fee_amount: number;
  installment_number: number;
  created_at: string;
  updated_at: string;
}

export class FinanceService {
  static async createFee(feeData: Partial<FinancialData>) {
    const dbData: DatabaseFinancialInsert = {
      student_id: feeData.student_id,
      school_id: feeData.school_id!,
      amount: feeData.amount!,
      due_date: feeData.due_date!,
      term: feeData.term!,
      category: feeData.category,
      status: feeData.status,
      academic_year: feeData.academic_year,
      paid_amount: feeData.paid_amount,
      paid_date: feeData.paid_date,
      payment_method: feeData.payment_method,
      mpesa_code: feeData.mpesa_code,
      discount_amount: feeData.discount_amount,
      late_fee_amount: feeData.late_fee_amount,
      installment_number: feeData.installment_number
    };

    return DataServiceCore.createRecord('fees', dbData);
  }

  static async updateFee(id: string, updates: Partial<FinancialData>) {
    return DataServiceCore.updateRecord('fees', id, updates);
  }

  static async getFees(filters?: Record<string, any>) {
    return DataServiceCore.fetchRecords<FinancialData>('fees', filters);
  }

  static async recordPayment(transactionData: any) {
    return DataServiceCore.createRecord('financial_transactions', transactionData);
  }
}
