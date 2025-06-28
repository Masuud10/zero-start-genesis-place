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

  static async createManualFeeRecord(data: {
    school_id: string;
    billing_type: 'setup_fee' | 'subscription_fee';
    amount: number;
    description: string;
    due_date: string;
  }): Promise<{ success: boolean; recordId?: string; error?: any }> {
    try {
      console.log('📊 BillingManagementService: Creating manual fee record:', data);

      // For subscription fees, calculate based on student count
      let finalAmount = data.amount;
      let studentCount = 0;

      if (data.billing_type === 'subscription_fee') {
        // Get student count for the school
        const { data: students, error: studentsError } = await supabase
          .from('students')
          .select('id')
          .eq('school_id', data.school_id);

        if (studentsError) {
          console.error('Error fetching student count:', studentsError);
          throw studentsError;
        }

        studentCount = students?.length || 0;
        
        // Calculate final amount (amount is per-student rate)
        finalAmount = studentCount * data.amount;
      }

      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber();

      // Create the billing record
      const { data: record, error } = await supabase
        .from('school_billing_records')
        .insert({
          school_id: data.school_id,
          billing_type: data.billing_type,
          amount: finalAmount,
          currency: 'KES',
          student_count: data.billing_type === 'subscription_fee' ? studentCount : null,
          billing_period_start: data.billing_type === 'subscription_fee' ? 
            new Date().toISOString().split('T')[0] : null,
          billing_period_end: data.billing_type === 'subscription_fee' ? 
            new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0] : null,
          status: 'pending',
          invoice_number: invoiceNumber,
          description: data.description,
          due_date: data.due_date,
          created_by: 'manual_entry',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating manual fee record:', error);
        throw error;
      }

      console.log('📊 BillingManagementService: Manual fee record created successfully');
      return { success: true, recordId: record.id };

    } catch (error: any) {
      console.error('📊 BillingManagementService: Error creating manual fee record:', error);
      return { success: false, error };
    }
  }

  private static async generateInvoiceNumber(): Promise<string> {
    try {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      
      // Get count of records for this month
      const { data: records, error } = await supabase
        .from('school_billing_records')
        .select('id')
        .gte('created_at', `${year}-${month}-01`)
        .lt('created_at', `${year}-${month === '12' ? year + 1 : year}-${month === '12' ? '01' : String(parseInt(month) + 1).padStart(2, '0')}-01`);

      if (error) throw error;

      const sequence = String((records?.length || 0) + 1).padStart(4, '0');
      return `EF-${year}${month}-${sequence}`;
    } catch (error) {
      console.error('Error generating invoice number:', error);
      // Fallback to timestamp-based number
      return `EF-${Date.now()}`;
    }
  }
}
