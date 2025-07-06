import { supabase } from '@/integrations/supabase/client';

export interface ManualFeeRecord {
  school_id: string;
  billing_type: 'setup_fee' | 'subscription_fee' | 'custom_fee';
  amount: number;
  description: string;
  due_date: string;
}

export interface SubscriptionFeeCalculation {
  student_count: number;
  per_student_rate: number;
  calculated_amount: number;
}

export interface BillingServiceResult<T = unknown> {
  data: T | null;
  error?: string;
}

export interface BillingOperationResult {
  success: boolean;
  error?: string;
}

export class BillingManagementService {
  static async calculateSubscriptionFee(schoolId: string): Promise<BillingServiceResult<SubscriptionFeeCalculation>> {
    try {
      // Get student count for the school
      const { data: students, error: studentError } = await supabase
        .from('students')
        .select('id', { count: 'exact' })
        .eq('school_id', schoolId)
        .eq('is_active', true);

      if (studentError) throw studentError;

      const studentCount = students?.length || 0;
      const perStudentRate = 50; // KES 50 per student
      const calculatedAmount = studentCount * perStudentRate;

      return {
        data: {
          student_count: studentCount,
          per_student_rate: perStudentRate,
          calculated_amount: calculatedAmount
        }
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { data: null, error: errorMessage };
    }
  }

  static async createManualFeeRecord(feeData: ManualFeeRecord): Promise<BillingOperationResult> {
    try {
      const { error } = await supabase
        .from('school_billing_records')
        .insert({
          school_id: feeData.school_id,
          billing_type: feeData.billing_type,
          amount: feeData.amount,
          description: feeData.description,
          due_date: feeData.due_date,
          status: 'pending'
        });

      if (error) throw error;

      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, error: errorMessage };
    }
  }
}
