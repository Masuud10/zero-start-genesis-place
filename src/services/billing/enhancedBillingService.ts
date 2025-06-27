import { supabase } from '@/integrations/supabase/client';

export interface BillingSettings {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface SchoolBillingRecord {
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
    location?: string;
  };
}

export interface BillingSummary {
  total_revenue: number;
  pending_amount: number;
  overdue_amount: number;
  setup_fees_total: number;
  subscription_fees_total: number;
  total_schools: number;
  active_subscriptions: number;
  currency: string;
}

export class EnhancedBillingService {
  static async getBillingSettings(): Promise<{ data: BillingSettings[] | null; error: any }> {
    try {
      console.log('📊 EnhancedBillingService: Fetching billing settings');

      const { data, error } = await supabase
        .from('billing_settings')
        .select('*')
        .order('setting_key');

      if (error) {
        console.error('Error fetching billing settings:', error);
        throw error;
      }

      console.log('📊 EnhancedBillingService: Billing settings fetched successfully');
      return { data: data || [], error: null };

    } catch (error: any) {
      console.error('📊 EnhancedBillingService: Error fetching billing settings:', error);
      return { data: null, error };
    }
  }

  static async updateBillingSettings(settingKey: string, settingValue: any): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('📊 EnhancedBillingService: Updating billing setting:', settingKey);

      const { error } = await supabase
        .from('billing_settings')
        .update({ 
          setting_value: settingValue,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', settingKey);

      if (error) {
        console.error('Error updating billing setting:', error);
        throw error;
      }

      console.log('📊 EnhancedBillingService: Billing setting updated successfully');
      return { success: true };

    } catch (error: any) {
      console.error('📊 EnhancedBillingService: Error updating billing setting:', error);
      return { success: false, error };
    }
  }

  static async getSchoolBillingRecords(filters?: {
    school_id?: string;
    status?: string;
    billing_type?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<{ data: SchoolBillingRecord[] | null; error: any }> {
    try {
      console.log('📊 EnhancedBillingService: Fetching school billing records');

      let query = supabase
        .from('school_billing_records')
        .select(`
          *,
          school:schools(id, name, location)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.school_id) {
        query = query.eq('school_id', filters.school_id);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.billing_type) {
        query = query.eq('billing_type', filters.billing_type);
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching billing records:', error);
        throw error;
      }

      // Type assertion to ensure proper typing
      const typedData = data as SchoolBillingRecord[];

      console.log('📊 EnhancedBillingService: Billing records fetched successfully');
      return { data: typedData || [], error: null };

    } catch (error: any) {
      console.error('📊 EnhancedBillingService: Error fetching billing records:', error);
      return { data: null, error };
    }
  }

  static async getBillingSummary(): Promise<{ data: BillingSummary | null; error: any }> {
    try {
      console.log('📊 EnhancedBillingService: Calculating billing summary');

      const { data: records, error } = await supabase
        .from('school_billing_records')
        .select('*');

      if (error) {
        console.error('Error fetching records for summary:', error);
        throw error;
      }

      const summary: BillingSummary = {
        total_revenue: 0,
        pending_amount: 0,
        overdue_amount: 0,
        setup_fees_total: 0,
        subscription_fees_total: 0,
        total_schools: 0,
        active_subscriptions: 0,
        currency: 'KES'
      };

      if (records) {
        // Calculate totals
        records.forEach(record => {
          if (record.status === 'paid') {
            summary.total_revenue += Number(record.amount);
          } else if (record.status === 'pending') {
            summary.pending_amount += Number(record.amount);
          } else if (record.status === 'overdue') {
            summary.overdue_amount += Number(record.amount);
          }

          if (record.billing_type === 'setup_fee') {
            summary.setup_fees_total += Number(record.amount);
          } else if (record.billing_type === 'subscription_fee') {
            summary.subscription_fees_total += Number(record.amount);
            if (record.status !== 'cancelled') {
              summary.active_subscriptions++;
            }
          }
        });

        // Count unique schools
        const uniqueSchools = new Set(records.map(r => r.school_id));
        summary.total_schools = uniqueSchools.size;
      }

      console.log('📊 EnhancedBillingService: Billing summary calculated');
      return { data: summary, error: null };

    } catch (error: any) {
      console.error('📊 EnhancedBillingService: Error calculating billing summary:', error);
      return { data: null, error };
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
      console.log('📊 EnhancedBillingService: Creating manual fee record:', data);

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
        
        // If amount is 0, use default per-student rate (KES 50)
        if (data.amount === 0) {
          finalAmount = studentCount * 50; // KES 50 per student
        } else {
          // Use the manual amount as per-student rate
          finalAmount = studentCount * data.amount;
        }
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
          billing_period_start: data.billing_type === 'subscription_fee' ? new Date().toISOString().split('T')[0] : null,
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

      console.log('📊 EnhancedBillingService: Manual fee record created successfully');
      return { success: true, recordId: record.id };

    } catch (error: any) {
      console.error('📊 EnhancedBillingService: Error creating manual fee record:', error);
      return { success: false, error };
    }
  }

  static async generateInvoiceNumber(): Promise<string> {
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

  static async createSetupFeeForSchool(schoolId: string): Promise<{ success: boolean; recordId?: string; error?: any }> {
    try {
      console.log('📊 EnhancedBillingService: Creating setup fee for school:', schoolId);

      // Check if setup fee already exists for this school
      const { data: existingFee, error: checkError } = await supabase
        .from('school_billing_records')
        .select('id')
        .eq('school_id', schoolId)
        .eq('billing_type', 'setup_fee')
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingFee) {
        return { success: false, error: 'Setup fee already exists for this school' };
      }

      // Call the database function to create setup fee
      const { data, error } = await supabase.rpc('create_setup_fee_record', {
        p_school_id: schoolId
      });

      if (error) {
        console.error('Error creating setup fee:', error);
        throw error;
      }

      console.log('📊 EnhancedBillingService: Setup fee created successfully');
      return { success: true, recordId: data };

    } catch (error: any) {
      console.error('📊 EnhancedBillingService: Error creating setup fee:', error);
      return { success: false, error };
    }
  }

  static async createMonthlySubscriptionFees(): Promise<{ success: boolean; recordsCreated: number; error?: any }> {
    try {
      console.log('📊 EnhancedBillingService: Creating monthly subscription fees');

      const { data, error } = await supabase.rpc('create_monthly_subscription_fees');

      if (error) {
        console.error('Error creating subscription fees:', error);
        throw error;
      }

      console.log('📊 EnhancedBillingService: Monthly subscription fees created');
      return { success: true, recordsCreated: data || 0 };

    } catch (error: any) {
      console.error('📊 EnhancedBillingService: Error creating subscription fees:', error);
      return { success: false, recordsCreated: 0, error };
    }
  }

  static async updateBillingRecordStatus(recordId: string, status: string, paymentMethod?: string): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('📊 EnhancedBillingService: Updating billing record status:', recordId, status);

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
        console.error('Error updating billing record:', error);
        throw error;
      }

      console.log('📊 EnhancedBillingService: Billing record updated successfully');
      return { success: true };

    } catch (error: any) {
      console.error('📊 EnhancedBillingService: Error updating billing record:', error);
      return { success: false, error };
    }
  }

  static async calculateSchoolSubscriptionFee(schoolId: string): Promise<{ data: any | null; error: any }> {
    try {
      console.log('📊 EnhancedBillingService: Calculating subscription fee for school:', schoolId);

      const { data, error } = await supabase.rpc('calculate_school_subscription_fee', {
        p_school_id: schoolId
      });

      if (error) {
        console.error('Error calculating subscription fee:', error);
        throw error;
      }

      console.log('📊 EnhancedBillingService: Subscription fee calculated');
      return { data, error: null };

    } catch (error: any) {
      console.error('📊 EnhancedBillingService: Error calculating subscription fee:', error);
      return { data: null, error };
    }
  }

  static async generateInvoiceData(recordId: string): Promise<{ data: any | null; error: any }> {
    try {
      console.log('📊 EnhancedBillingService: Generating invoice data for record:', recordId);

      const { data: record, error } = await supabase
        .from('school_billing_records')
        .select(`
          *,
          school:schools(
            id, name, email, phone, address, logo_url,
            principal_name, principal_contact
          )
        `)
        .eq('id', recordId)
        .single();

      if (error) {
        console.error('Error fetching billing record for invoice:', error);
        throw error;
      }

      // Format invoice data
      const invoiceData = {
        invoice_number: record.invoice_number,
        invoice_date: record.created_at,
        due_date: record.due_date,
        school: record.school,
        billing_details: {
          type: record.billing_type,
          description: record.description,
          amount: record.amount,
          currency: record.currency,
          student_count: record.student_count,
          billing_period: record.billing_period_start && record.billing_period_end ? {
            start: record.billing_period_start,
            end: record.billing_period_end
          } : null
        },
        payment_info: {
          status: record.status,
          paid_date: record.paid_date,
          payment_method: record.payment_method
        },
        company_info: {
          name: 'EduFam',
          address: 'Nairobi, Kenya',
          email: 'billing@edufam.com',
          phone: '+254-XXX-XXXX'
        }
      };

      console.log('📊 EnhancedBillingService: Invoice data generated successfully');
      return { data: invoiceData, error: null };

    } catch (error: any) {
      console.error('📊 EnhancedBillingService: Error generating invoice data:', error);
      return { data: null, error };
    }
  }
}
