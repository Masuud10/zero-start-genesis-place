
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
  total_revenue: number;
  pending_payments: number;
  active_subscriptions: number;
  total_amount_expected: number;
  outstanding_balance: number;
}

export interface School {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
  student_count?: number;
}

export class BillingManagementService {
  static async getAllBillingRecords(filters?: {
    status?: string;
    school_name?: string;
    month?: string;
    year?: string;
  }): Promise<{ data: BillingRecord[]; error?: any }> {
    try {
      console.log('📊 BillingManagementService: Fetching all billing records with filters:', filters);

      let query = supabase
        .from('school_billing_records')
        .select(`
          *,
          school:schools(
            id, 
            name
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.school_name) {
        // We'll filter by school name after fetching since we can't do complex joins
        // This is a limitation we'll handle on the client side
      }

      if (filters?.month && filters?.year) {
        const startDate = `${filters.year}-${filters.month.padStart(2, '0')}-01`;
        const endDate = `${filters.year}-${filters.month.padStart(2, '0')}-31`;
        query = query.gte('due_date', startDate).lte('due_date', endDate);
      } else if (filters?.year) {
        query = query.gte('due_date', `${filters.year}-01-01`).lte('due_date', `${filters.year}-12-31`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching billing records:', error);
        throw error;
      }

      let records = data as BillingRecord[] || [];

      // Get student counts for each school separately
      const schoolIds = [...new Set(records.map(r => r.school_id))];
      const studentCounts: Record<string, number> = {};

      for (const schoolId of schoolIds) {
        const { count } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', schoolId);
        studentCounts[schoolId] = count || 0;
      }

      // Add student counts to records
      records = records.map(record => ({
        ...record,
        student_count: studentCounts[record.school_id] || 0,
        school: record.school ? {
          ...record.school,
          student_count: studentCounts[record.school_id] || 0
        } : undefined
      }));

      // Apply school name filter if provided
      if (filters?.school_name) {
        records = records.filter(record => 
          record.school?.name?.toLowerCase().includes(filters.school_name!.toLowerCase())
        );
      }

      console.log('📊 BillingManagementService: Billing records fetched successfully', records.length);
      return { data: records };

    } catch (error: any) {
      console.error('📊 BillingManagementService: Error fetching billing records:', error);
      return { data: [], error };
    }
  }

  static async getSchoolBillingRecords(schoolId: string): Promise<{ data: BillingRecord[]; error?: any }> {
    try {
      console.log('📊 BillingManagementService: Fetching billing records for school:', schoolId);

      const { data, error } = await supabase
        .from('school_billing_records')
        .select(`
          *,
          school:schools(
            id, 
            name
          )
        `)
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching school billing records:', error);
        throw error;
      }

      let records = data as BillingRecord[] || [];

      // Get student count for this school
      const { count } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId);

      const studentCount = count || 0;

      // Add student count to records
      records = records.map(record => ({
        ...record,
        student_count: studentCount,
        school: record.school ? {
          ...record.school,
          student_count: studentCount
        } : undefined
      }));

      console.log('📊 BillingManagementService: School billing records fetched successfully');
      return { data: records };

    } catch (error: any) {
      console.error('📊 BillingManagementService: Error fetching school billing records:', error);
      return { data: [], error };
    }
  }

  static async getBillingStats(): Promise<{ data: BillingStats; error?: any }> {
    try {
      console.log('📊 BillingManagementService: Fetching billing statistics');

      const { data: records, error } = await supabase
        .from('school_billing_records')
        .select('*');

      if (error) {
        console.error('Error fetching billing records for stats:', error);
        throw error;
      }

      const stats: BillingStats = {
        total_schools: 0,
        total_revenue: 0,
        pending_payments: 0,
        active_subscriptions: 0,
        total_amount_expected: 0,
        outstanding_balance: 0
      };

      if (records && records.length > 0) {
        // Calculate stats from records
        const uniqueSchools = new Set(records.map(r => r.school_id));
        stats.total_schools = uniqueSchools.size;

        records.forEach(record => {
          const amount = Number(record.amount) || 0;
          stats.total_amount_expected += amount;

          if (record.status === 'paid') {
            stats.total_revenue += amount;
          } else if (record.status === 'pending') {
            stats.pending_payments += amount;
          }

          if (record.billing_type === 'subscription_fee' && record.status !== 'cancelled') {
            stats.active_subscriptions++;
          }
        });

        stats.outstanding_balance = stats.total_amount_expected - stats.total_revenue;
      }

      console.log('📊 BillingManagementService: Billing statistics calculated successfully');
      return { data: stats };

    } catch (error: any) {
      console.error('📊 BillingManagementService: Error fetching billing statistics:', error);
      return { data: { total_schools: 0, total_revenue: 0, pending_payments: 0, active_subscriptions: 0, total_amount_expected: 0, outstanding_balance: 0 }, error };
    }
  }

  static async getSchoolBillingSummaries(): Promise<{ data: any[]; error?: any }> {
    try {
      console.log('📊 BillingManagementService: Fetching school billing summaries');

      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name')
        .order('name');

      if (schoolsError) {
        throw schoolsError;
      }

      const summaries = [];

      for (const school of schools || []) {
        // Get student count
        const { count: studentCount } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', school.id);

        // Get billing records
        const { data: billingRecords } = await supabase
          .from('school_billing_records')
          .select('*')
          .eq('school_id', school.id);

        const totalBilling = billingRecords?.reduce((sum, record) => sum + Number(record.amount), 0) || 0;
        const totalPaid = billingRecords?.filter(r => r.status === 'paid').reduce((sum, record) => sum + Number(record.amount), 0) || 0;
        const outstandingBalance = totalBilling - totalPaid;

        summaries.push({
          school_id: school.id,
          school_name: school.name,
          student_count: studentCount || 0,
          total_billing_amount: totalBilling,
          total_paid_amount: totalPaid,
          outstanding_balance: outstandingBalance,
          billing_records_count: billingRecords?.length || 0
        });
      }

      console.log('📊 BillingManagementService: School billing summaries fetched successfully');
      return { data: summaries };

    } catch (error: any) {
      console.error('📊 BillingManagementService: Error fetching school billing summaries:', error);
      return { data: [], error };
    }
  }

  static async getPaymentHistory(schoolId?: string): Promise<{ data: any[]; error?: any }> {
    try {
      console.log('📊 BillingManagementService: Fetching payment history for school:', schoolId);

      let query = supabase
        .from('school_billing_records')
        .select(`
          *,
          school:schools(id, name)
        `)
        .eq('status', 'paid')
        .order('paid_date', { ascending: false });

      if (schoolId) {
        query = query.eq('school_id', schoolId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching payment history:', error);
        throw error;
      }

      console.log('📊 BillingManagementService: Payment history fetched successfully');
      return { data: data || [] };

    } catch (error: any) {
      console.error('📊 BillingManagementService: Error fetching payment history:', error);
      return { data: [], error };
    }
  }

  static async getAllSchools(): Promise<{ data: School[]; error?: any }> {
    try {
      console.log('📊 BillingManagementService: Fetching all schools');

      const { data: schools, error } = await supabase
        .from('schools')
        .select('id, name, email, phone, address, logo_url')
        .order('name');

      if (error) {
        console.error('Error fetching schools:', error);
        throw error;
      }

      // Get student counts for all schools
      const schoolsWithCounts = [];
      
      for (const school of schools || []) {
        const { count } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', school.id);

        schoolsWithCounts.push({
          ...school,
          student_count: count || 0
        });
      }

      console.log('📊 BillingManagementService: Schools fetched successfully');
      return { data: schoolsWithCounts };

    } catch (error: any) {
      console.error('📊 BillingManagementService: Error fetching schools:', error);
      return { data: [], error };
    }
  }

  static async generateInvoiceData(recordId: string): Promise<{ data: any; error?: any }> {
    try {
      console.log('📊 BillingManagementService: Generating invoice data for record:', recordId);

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

      // Get student count for this school
      const { count: studentCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', record.school_id);

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
          student_count: studentCount || 0,
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
      return { data: invoiceData };

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

  static async createSetupFee(schoolId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📊 BillingManagementService: Creating setup fee for school:', schoolId);

      // Check if setup fee already exists for this school
      const { data: existingFee, error: checkError } = await supabase
        .from('school_billing_records')
        .select('id')
        .eq('school_id', schoolId)
        .eq('billing_type', 'setup_fee')
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (existingFee) {
        return { success: false, error: 'Setup fee already exists for this school' };
      }

      // Generate invoice number
      const invoiceNumber = `EF-${Date.now()}`;

      // Create the setup fee record
      const { error } = await supabase
        .from('school_billing_records')
        .insert({
          school_id: schoolId,
          billing_type: 'setup_fee',
          amount: 5000, // Default setup fee amount
          currency: 'KES',
          status: 'pending',
          invoice_number: invoiceNumber,
          description: 'One-time setup fee for school onboarding',
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating setup fee:', error);
        throw error;
      }

      console.log('📊 BillingManagementService: Setup fee created successfully');
      return { success: true };

    } catch (error: any) {
      console.error('📊 BillingManagementService: Error creating setup fee:', error);
      return { success: false, error: error.message };
    }
  }

  static async createMonthlySubscriptions(): Promise<{ recordsCreated: number; error?: any }> {
    try {
      console.log('📊 BillingManagementService: Creating monthly subscription fees');

      // Get all active schools
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('id')
        .eq('status', 'active');

      if (schoolsError) {
        throw schoolsError;
      }

      let recordsCreated = 0;
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM format

      for (const school of schools || []) {
        // Check if subscription already exists for this month
        const { data: existingSubscription } = await supabase
          .from('school_billing_records')
          .select('id')
          .eq('school_id', school.id)
          .eq('billing_type', 'subscription_fee')
          .gte('created_at', `${currentMonth}-01`)
          .lt('created_at', `${currentMonth}-31`)
          .maybeSingle();

        if (existingSubscription) {
          continue; // Skip if already exists
        }

        // Get student count
        const { count: studentCount } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', school.id);

        const amount = (studentCount || 0) * 50; // KES 50 per student

        if (amount > 0) {
          // Create subscription record
          const invoiceNumber = `EF-${Date.now()}-${school.id.substring(0, 8)}`;

          const { error } = await supabase
            .from('school_billing_records')
            .insert({
              school_id: school.id,
              billing_type: 'subscription_fee',
              amount: amount,
              currency: 'KES',
              student_count: studentCount || 0,
              billing_period_start: `${currentMonth}-01`,
              billing_period_end: `${currentMonth}-31`,
              status: 'pending',
              invoice_number: invoiceNumber,
              description: `Monthly subscription fee for ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} (${studentCount} students)`,
              due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days from now
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (!error) {
            recordsCreated++;
          }
        }
      }

      console.log('📊 BillingManagementService: Monthly subscription fees created');
      return { recordsCreated };

    } catch (error: any) {
      console.error('📊 BillingManagementService: Error creating subscription fees:', error);
      return { recordsCreated: 0, error };
    }
  }

  static async updateBillingRecord(recordId: string, updates: any): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('📊 BillingManagementService: Updating billing record:', recordId, updates);

      const { error } = await supabase
        .from('school_billing_records')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
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

  static async calculateSubscriptionFee(schoolId: string): Promise<{ data: any; error?: any }> {
    try {
      console.log('📊 BillingManagementService: Calculating subscription fee for school:', schoolId);

      // Get student count
      const { count: studentCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId);

      const perStudentRate = 50; // KES 50 per student
      const calculatedAmount = (studentCount || 0) * perStudentRate;

      const result = {
        student_count: studentCount || 0,
        per_student_rate: perStudentRate,
        calculated_amount: calculatedAmount,
        currency: 'KES'
      };

      console.log('📊 BillingManagementService: Subscription fee calculated');
      return { data: result };

    } catch (error: any) {
      console.error('📊 BillingManagementService: Error calculating subscription fee:', error);
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
      console.log('📊 BillingManagementService: Creating manual fee record:', data);

      // Get student count for the school
      const { count: studentCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', data.school_id);

      // For subscription fees, calculate based on student count and per-student rate
      let finalAmount = data.amount;
      if (data.billing_type === 'subscription_fee') {
        finalAmount = (studentCount || 0) * data.amount; // amount is per-student rate
      }

      // Generate invoice number
      const invoiceNumber = `EF-${Date.now()}-${data.school_id.substring(0, 8)}`;

      // Create the billing record
      const { data: record, error } = await supabase
        .from('school_billing_records')
        .insert({
          school_id: data.school_id,
          billing_type: data.billing_type,
          amount: finalAmount,
          currency: 'KES',
          student_count: data.billing_type === 'subscription_fee' ? (studentCount || 0) : null,
          billing_period_start: data.billing_type === 'subscription_fee' ? new Date().toISOString().split('T')[0] : null,
          billing_period_end: data.billing_type === 'subscription_fee' ? 
            new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0] : null,
          status: 'pending',
          invoice_number: invoiceNumber,
          description: data.description,
          due_date: data.due_date,
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
}
