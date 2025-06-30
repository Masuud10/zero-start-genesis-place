
import { DataServiceCore } from './core/dataServiceCore';
import { validateUuid, safeUuidOrNull } from '@/utils/uuidValidation';

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
    // Validate required UUIDs
    const schoolValidation = validateUuid(feeData.school_id);
    if (!schoolValidation.isValid) {
      throw new Error(`Invalid school ID: ${schoolValidation.error}`);
    }

    const studentId = safeUuidOrNull(feeData.student_id);
    if (feeData.student_id && !studentId) {
      throw new Error('Invalid student ID provided');
    }

    const dbData: DatabaseFinancialInsert = {
      student_id: studentId || undefined,
      school_id: schoolValidation.sanitizedValue!,
      amount: Number(feeData.amount) || 0,
      due_date: feeData.due_date!,
      term: feeData.term!,
      category: feeData.category,
      status: feeData.status,
      academic_year: feeData.academic_year,
      paid_amount: Number(feeData.paid_amount) || 0,
      paid_date: feeData.paid_date,
      payment_method: feeData.payment_method,
      mpesa_code: feeData.mpesa_code,
      discount_amount: Number(feeData.discount_amount) || 0,
      late_fee_amount: Number(feeData.late_fee_amount) || 0,
      installment_number: Number(feeData.installment_number) || 1
    };

    return DataServiceCore.createRecord('fees', dbData);
  }

  static async updateFee(id: string, updates: Partial<FinancialData>) {
    // Validate fee ID
    const idValidation = validateUuid(id);
    if (!idValidation.isValid) {
      throw new Error(`Invalid fee ID: ${idValidation.error}`);
    }

    // Validate any UUID fields in updates
    if (updates.school_id) {
      const schoolValidation = validateUuid(updates.school_id);
      if (!schoolValidation.isValid) {
        throw new Error(`Invalid school ID: ${schoolValidation.error}`);
      }
      updates.school_id = schoolValidation.sanitizedValue;
    }

    if (updates.student_id) {
      const studentId = safeUuidOrNull(updates.student_id);
      if (!studentId) {
        throw new Error('Invalid student ID provided');
      }
      updates.student_id = studentId;
    }

    return DataServiceCore.updateRecord('fees', idValidation.sanitizedValue!, updates);
  }

  static async getFees(filters?: Record<string, any>) {
    // Validate any UUID filters
    if (filters?.school_id) {
      const schoolValidation = validateUuid(filters.school_id);
      if (!schoolValidation.isValid) {
        throw new Error(`Invalid school ID filter: ${schoolValidation.error}`);
      }
      filters.school_id = schoolValidation.sanitizedValue;
    }

    if (filters?.student_id) {
      const studentId = safeUuidOrNull(filters.student_id);
      if (!studentId) {
        delete filters.student_id; // Remove invalid student ID filter
      } else {
        filters.student_id = studentId;
      }
    }

    return DataServiceCore.fetchRecords<FinancialData>('fees', filters);
  }

  static async recordPayment(transactionData: any) {
    // Validate UUIDs in transaction data
    if (transactionData.school_id) {
      const schoolValidation = validateUuid(transactionData.school_id);
      if (!schoolValidation.isValid) {
        throw new Error(`Invalid school ID: ${schoolValidation.error}`);
      }
      transactionData.school_id = schoolValidation.sanitizedValue;
    }

    if (transactionData.student_id) {
      const studentId = safeUuidOrNull(transactionData.student_id);
      if (!studentId) {
        delete transactionData.student_id; // Remove invalid student ID
      } else {
        transactionData.student_id = studentId;
      }
    }

    if (transactionData.fee_id) {
      const feeId = safeUuidOrNull(transactionData.fee_id);
      if (!feeId) {
        delete transactionData.fee_id; // Remove invalid fee ID
      } else {
        transactionData.fee_id = feeId;
      }
    }

    return DataServiceCore.createRecord('financial_transactions', transactionData);
  }
}
