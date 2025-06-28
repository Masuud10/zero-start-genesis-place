
import { supabase } from '@/integrations/supabase/client';

export interface BillingRecord {
  id: string;
  school_id: string;
  billing_type: 'setup_fee' | 'subscription_fee';
  amount: number;
  currency: string;
  billing_period_start?: string;
  billing_period_end?: string;
  student_count?: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  invoice_number: string;
  description: string;
  due_date: string;
  paid_date?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  school?: {
    id: string;
    name: string;
  };
}

export interface BillingStats {
  total_schools: number;
  total_amount_expected: number;
  total_paid: number;
  outstanding_balance: number;
}

export class BillingManagementService {
  static async getAllBillingRecords(): Promise<{ data: BillingRecord[] | null; error: any }> {
    try {
      console.log('📊 BillingManagementService: Fetching all billing records');

      const { data, error } = await supabase
        .from('school_billing_records')
        .select(`
          *,
          school:schools(id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching billing records:', error);
        throw error;
      }

      // Type assertion to ensure proper typing
      const typedData = data as BillingRecord[];

      console.log('📊 BillingManagementService: Billing records fetched successfully');
      return { data: typedData || [], error: null };

    } catch (error: any) {
      console.error('📊 BillingManagementService: Error fetching billing records:', error);
      return { data: null, error };
    }
  }

  static async getSchoolBillingRecords(schoolId: string): Promise<{ data: BillingRecord[] | null; error: any }> {
    try {
      console.log('📊 BillingManagementService: Fetching billing records for school:', schoolId);

      const { data, error } = await supabase
        .from('school_billing_records')
        .select(`
          *,
          school:schools(id, name)
        `)
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching school billing records:', error);
        throw error;
      }

      // Type assertion to ensure proper typing
      const typedData = data as BillingRecord[];

      console.log('📊 BillingManagementService: School billing records fetched successfully');
      return { data: typedData || [], error: null };

    } catch (error: any) {
      console.error('📊 BillingManagementService: Error fetching school billing records:', error);
      return { data: null, error };
    }
  }

  static async getBillingStats(): Promise<{ data: BillingStats | null; error: any }> {
    try {
      console.log('📊 BillingManagementService: Calculating billing stats');

      const { data: records, error } = await supabase
        .from('school_billing_records')
        .select('*');

      if (error) {
        console.error('Error fetching records for stats:', error);
        throw error;
      }

      const stats: BillingStats = {
        total_schools: 0,
        total_amount_expected: 0,
        total_paid: 0,
        outstanding_balance: 0
      };

      if (records) {
        // Calculate stats
        const uniqueSchools = new Set(records.map(r => r.school_id));
        stats.total_schools = uniqueSchools.size;

        records.forEach(record => {
          stats.total_amount_expected += Number(record.amount);
          if (record.status === 'paid') {
            stats.total_paid += Number(record.amount);
          } else if (record.status === 'pending' || record.status === 'overdue') {
            stats.outstanding_balance += Number(record.amount);
          }
        });
      }

      console.log('📊 BillingManagementService: Billing stats calculated');
      return { data: stats, error: null };

    } catch (error: any) {
      console.error('📊 BillingManagementService: Error calculating billing stats:', error);
      return { data: null, error };
    }
  }

  static async updateBillingStatus(recordId: string, status: string, paymentMethod?: string): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('📊 BillingManagementService: Updating billing status:', recordId, status);

      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'paid') {
        updateData.paid_date = new Date().toISOString();
        if (paymentMethod) {
          updateData.payment_method = paymentMethod;
        }
      }

      const { error } = await supabase
        .from('school_billing_records')
        .update(updateData)
        .eq('id', recordId);

      if (error) {
        console.error('Error updating billing status:', error);
        throw error;
      }

      console.log('📊 BillingManagementService: Billing status updated successfully');
      return { success: true };

    } catch (error: any) {
      console.error('📊 BillingManagementService: Error updating billing status:', error);
      return { success: false, error };
    }
  }

  static async createSetupFee(schoolId: string): Promise<{ success: boolean; recordId?: string; error?: any }> {
    try {
      console.log('📊 BillingManagementService: Creating setup fee for school:', schoolId);

      const { data, error } = await supabase.rpc('create_setup_fee_record', {
        p_school_id: schoolId
      });

      if (error) {
        console.error('Error creating setup fee:', error);
        throw error;
      }

      console.log('📊 BillingManagementService: Setup fee created successfully');
      return { success: true, recordId: data };

    } catch (error: any) {
      console.error('📊 BillingManagementService: Error creating setup fee:', error);
      return { success: false, error };
    }
  }

  static async createMonthlySubscriptions(): Promise<{ success: boolean; recordsCreated: number; error?: any }> {
    try {
      console.log('📊 BillingManagementService: Creating monthly subscription fees');

      const { data, error } = await supabase.rpc('create_monthly_subscription_fees');

      if (error) {
        console.error('Error creating subscription fees:', error);
        throw error;
      }

      console.log('📊 BillingManagementService: Monthly subscription fees created');
      return { success: true, recordsCreated: data || 0 };

    } catch (error: any) {
      console.error('📊 BillingManagementService: Error creating subscription fees:', error);
      return { success: false, recordsCreated: 0, error };
    }
  }

  static async calculateSubscriptionFee(schoolId: string): Promise<{ data: any | null; error: any }> {
    try {
      console.log('📊 BillingManagementService: Calculating subscription fee for school:', schoolId);

      const { data, error } = await supabase.rpc('calculate_school_subscription_fee', {
        p_school_id: schoolId
      });

      if (error) {
        console.error('Error calculating subscription fee:', error);
        throw error;
      }

      console.log('📊 BillingManagementService: Subscription fee calculated');
      return { data, error: null };

    } catch (error: any) {
      console.error('📊 BillingManagementService: Error calculating subscription fee:', error);
      return { data: null, error };
    }
  }

  static async getAllSchools(): Promise<{ data: any[] | null; error: any }> {
    try {
      console.log('📊 BillingManagementService: Fetching all schools');

      const { data, error } = await supabase
        .from('schools')
        .select('id, name, email, phone, address, created_at, status')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching schools:', error);
        throw error;
      }

      console.log('📊 BillingManagementService: Schools fetched successfully');
      return { data: data || [], error: null };

    } catch (error: any) {
      console.error('📊 BillingManagementService: Error fetching schools:', error);
      return { data: null, error };
    }
  }

  static async updateBillingRecord(recordId: string, updates: Partial<BillingRecord>): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('📊 BillingManagementService: Updating billing record:', recordId);

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('school_billing_records')
        .update(updateData)
        .eq('id', recordId);

      if (error) {
        console.error('Error updating billing record:', error);
        throw error;
      }

      console.log('📊 BillingManagementService: Billing record updated successfully');
      return { success: true };

    } catch (error: any) {
      console.error('📊 BillingManagementService: Error updating billing record:', error);
      return { success: false, error };
    }
  }
}
