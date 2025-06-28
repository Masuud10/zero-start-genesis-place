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
    student_count?: number;
    total_billing_amount?: number;
    outstanding_balance?: number;
  };
}

export interface BillingStats {
  total_schools: number;
  total_amount_expected: number;
  total_paid: number;
  outstanding_balance: number;
  total_revenue: number;
  pending_payments: number;
  active_subscriptions: number;
}

export interface PaymentHistory {
  id: string;
  school_id: string;
  billing_record_id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  reference_number?: string;
  description: string;
}

export interface SchoolBillingSummary {
  school_id: string;
  school_name: string;
  student_count: number;
  setup_fee_amount: number;
  setup_fee_status: string;
  monthly_subscription_amount: number;
  total_billing_amount: number;
  total_paid: number;
  outstanding_balance: number;
  last_payment_date?: string;
}

export class BillingManagementService {
  static async getAllBillingRecords(filters?: {
    school_name?: string;
    status?: string;
    month?: string;
    year?: string;
  }): Promise<{ data: BillingRecord[] | null; error: any }> {
    try {
      console.log('📊 BillingManagementService: Fetching all billing records with filters:', filters);

      let query = supabase
        .from('school_billing_records')
        .select(`
          *,
          school:schools(
            id, 
            name,
            (select count(*) from students where school_id = schools.id) as student_count
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.month && filters?.year) {
        const startDate = `${filters.year}-${filters.month.padStart(2, '0')}-01`;
        const endDate = `${filters.year}-${filters.month.padStart(2, '0')}-31`;
        query = query.gte('created_at', startDate).lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching billing records:', error);
        throw error;
      }

      // Type assertion and calculate totals for each school
      const typedData = data as BillingRecord[];
      
      // Enhance data with calculations
      const enhancedData = typedData.map(record => {
        if (record.school) {
          const schoolRecords = typedData.filter(r => r.school_id === record.school_id);
          const totalBilling = schoolRecords.reduce((sum, r) => sum + Number(r.amount), 0);
          const totalPaid = schoolRecords.filter(r => r.status === 'paid').reduce((sum, r) => sum + Number(r.amount), 0);
          
          record.school.total_billing_amount = totalBilling;
          record.school.outstanding_balance = totalBilling - totalPaid;
        }
        return record;
      });

      // Filter by school name if provided
      const filteredData = filters?.school_name 
        ? enhancedData.filter(record => 
            record.school?.name.toLowerCase().includes(filters.school_name!.toLowerCase())
          )
        : enhancedData;

      console.log('📊 BillingManagementService: Billing records fetched successfully');
      return { data: filteredData || [], error: null };

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
          school:schools(
            id, 
            name,
            (select count(*) from students where school_id = schools.id) as student_count
          )
        `)
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching school billing records:', error);
        throw error;
      }

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
      console.log('📊 BillingManagementService: Calculating enhanced billing stats');

      // Get all billing records
      const { data: records, error: recordsError } = await supabase
        .from('school_billing_records')
        .select('*');

      if (recordsError) {
        console.error('Error fetching records for stats:', recordsError);
        throw recordsError;
      }

      // Get active subscriptions count
      const { data: activeSubscriptions, error: subscriptionsError } = await supabase
        .from('school_billing_records')
        .select('school_id')
        .eq('billing_type', 'subscription_fee')
        .neq('status', 'cancelled');

      if (subscriptionsError) {
        console.error('Error fetching active subscriptions:', subscriptionsError);
        throw subscriptionsError;
      }

      const stats: BillingStats = {
        total_schools: 0,
        total_amount_expected: 0,
        total_paid: 0,
        outstanding_balance: 0,
        total_revenue: 0,
        pending_payments: 0,
        active_subscriptions: 0
      };

      if (records) {
        // Calculate basic stats
        const uniqueSchools = new Set(records.map(r => r.school_id));
        stats.total_schools = uniqueSchools.size;

        records.forEach(record => {
          const amount = Number(record.amount);
          stats.total_amount_expected += amount;

          if (record.status === 'paid') {
            stats.total_paid += amount;
            stats.total_revenue += amount;
          } else if (record.status === 'pending') {
            stats.outstanding_balance += amount;
            stats.pending_payments += amount;
          } else if (record.status === 'overdue') {
            stats.outstanding_balance += amount;
          }
        });

        // Count active subscriptions (unique schools with active subscription fees)
        if (activeSubscriptions) {
          const uniqueActiveSchools = new Set(activeSubscriptions.map(s => s.school_id));
          stats.active_subscriptions = uniqueActiveSchools.size;
        }
      }

      console.log('📊 BillingManagementService: Enhanced billing stats calculated');
      return { data: stats, error: null };

    } catch (error: any) {
      console.error('📊 BillingManagementService: Error calculating billing stats:', error);
      return { data: null, error };
    }
  }

  static async getSchoolBillingSummaries(): Promise<{ data: SchoolBillingSummary[] | null; error: any }> {
    try {
      console.log('📊 BillingManagementService: Fetching school billing summaries');

      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select(`
          id,
          name,
          (select count(*) from students where school_id = schools.id) as student_count
        `)
        .order('name');

      if (schoolsError) {
        console.error('Error fetching schools:', schoolsError);
        throw schoolsError;
      }

      const summaries: SchoolBillingSummary[] = [];

      for (const school of schoolsData || []) {
        // Get billing records for this school
        const { data: billingRecords, error: billingError } = await supabase
          .from('school_billing_records')
          .select('*')
          .eq('school_id', school.id);

        if (billingError) {
          console.error(`Error fetching billing for school ${school.id}:`, billingError);
          continue;
        }

        // Calculate summary
        const setupFeeRecord = billingRecords?.find(r => r.billing_type === 'setup_fee');
        const subscriptionRecords = billingRecords?.filter(r => r.billing_type === 'subscription_fee') || [];
        
        const totalBilling = billingRecords?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;
        const totalPaid = billingRecords?.filter(r => r.status === 'paid').reduce((sum, r) => sum + Number(r.amount), 0) || 0;
        const outstandingBalance = totalBilling - totalPaid;

        // Get last payment date
        const paidRecords = billingRecords?.filter(r => r.status === 'paid' && r.paid_date) || [];
        const lastPaymentDate = paidRecords.length > 0 
          ? paidRecords.sort((a, b) => new Date(b.paid_date!).getTime() - new Date(a.paid_date!).getTime())[0].paid_date
          : undefined;

        summaries.push({
          school_id: school.id,
          school_name: school.name,
          student_count: school.student_count || 0,
          setup_fee_amount: setupFeeRecord ? Number(setupFeeRecord.amount) : 0,
          setup_fee_status: setupFeeRecord?.status || 'not_created',
          monthly_subscription_amount: subscriptionRecords.length > 0 
            ? subscriptionRecords.reduce((sum, r) => sum + Number(r.amount), 0) / subscriptionRecords.length 
            : 0,
          total_billing_amount: totalBilling,
          total_paid: totalPaid,
          outstanding_balance: outstandingBalance,
          last_payment_date: lastPaymentDate
        });
      }

      console.log('📊 BillingManagementService: School billing summaries calculated');
      return { data: summaries, error: null };

    } catch (error: any) {
      console.error('📊 BillingManagementService: Error fetching school billing summaries:', error);
      return { data: null, error };
    }
  }

  static async getPaymentHistory(schoolId?: string): Promise<{ data: PaymentHistory[] | null; error: any }> {
    try {
      console.log('📊 BillingManagementService: Fetching payment history for school:', schoolId);

      let query = supabase
        .from('school_billing_records')
        .select('*')
        .eq('status', 'paid')
        .not('paid_date', 'is', null)
        .order('paid_date', { ascending: false });

      if (schoolId) {
        query = query.eq('school_id', schoolId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching payment history:', error);
        throw error;
      }

      // Transform to PaymentHistory format
      const paymentHistory: PaymentHistory[] = (data || []).map(record => ({
        id: record.id,
        school_id: record.school_id,
        billing_record_id: record.id,
        amount: Number(record.amount),
        payment_method: record.payment_method || 'manual',
        payment_date: record.paid_date!,
        reference_number: record.invoice_number,
        description: record.description
      }));

      console.log('📊 BillingManagementService: Payment history fetched successfully');
      return { data: paymentHistory, error: null };

    } catch (error: any) {
      console.error('📊 BillingManagementService: Error fetching payment history:', error);
      return { data: null, error };
    }
  }

  static async generateInvoiceData(recordId: string): Promise<{ data: any | null; error: any }> {
    try {
      console.log('📊 BillingManagementService: Generating invoice data for record:', recordId);

      const { data: record, error } = await supabase
        .from('school_billing_records')
        .select(`
          *,
          school:schools(
            id, name, email, phone, address, logo_url,
            principal_name, principal_contact,
            (select count(*) from students where school_id = schools.id) as student_count
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
        school: {
          ...record.school,
          student_count: record.school?.student_count || 0
        },
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

      console.log('📊 BillingManagementService: Invoice data generated successfully');
      return { data: invoiceData, error: null };

    } catch (error: any) {
      console.error('📊 BillingManagementService: Error generating invoice data:', error);
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
        .select(`
          id, 
          name, 
          email, 
          phone, 
          address, 
          created_at, 
          status,
          (select count(*) from students where school_id = schools.id) as student_count
        `)
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
