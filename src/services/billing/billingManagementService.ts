import { supabase } from '@/integrations/supabase/client';
import { BillingRecordsService } from './billingRecordsService';
import { FeeCreationService } from './feeCreationService';

export interface BillingRecord {
  id: string;
  school_id: string;
  billing_type: 'setup_fee' | 'subscription_fee';
  amount: number;
  currency: string;
  status: string;
  due_date: string;
  created_at: string;
  updated_at: string;
  invoice_number?: string;
  description?: string;
  student_count?: number;
  school?: {
    id: string;
    name: string;
    student_count?: number;
    total_billing_amount?: number;
    outstanding_balance?: number;
  };
}

export interface BillingFilters {
  status?: string;
  school_name?: string;
  month?: string;
  year?: string;
}

export class BillingManagementService {
  static async getAllBillingRecords(filters?: BillingFilters): Promise<{ data: BillingRecord[]; error: any }> {
    console.log('📊 BillingManagementService: getAllBillingRecords called with filters:', filters);
    return BillingRecordsService.getAllBillingRecords(filters);
  }

  static async getSchoolBillingRecords(schoolId: string): Promise<{ data: BillingRecord[]; error: any }> {
    console.log('📊 BillingManagementService: getSchoolBillingRecords called for school:', schoolId);
    return BillingRecordsService.getSchoolBillingRecords(schoolId);
  }

  static async getBillingStats(): Promise<{ data: any; error: any }> {
    try {
      console.log('📊 BillingManagementService: Getting billing stats');

      // Test connection first
      const connectionTest = await BillingRecordsService.testConnection();
      if (!connectionTest) {
        return { data: null, error: 'Database connection failed' };
      }

      // Calculate stats manually since RPC function doesn't exist
      const { data: records, error: recordsError } = await supabase
        .from('school_billing_records')
        .select('amount, status, billing_type, school_id')
        .limit(1000);

      if (recordsError) {
        console.error('❌ Error getting billing records for stats:', recordsError);
        return { data: null, error: recordsError.message };
      }

      // Calculate basic stats
      const totalAmount = records?.reduce((sum, record) => sum + Number(record.amount), 0) || 0;
      const paidAmount = records?.filter(r => r.status === 'paid').reduce((sum, record) => sum + Number(record.amount), 0) || 0;
      const pendingAmount = records?.filter(r => r.status === 'pending').reduce((sum, record) => sum + Number(record.amount), 0) || 0;
      const uniqueSchools = new Set(records?.map(r => r.school_id)).size || 0;

      const stats = {
        total_amount: totalAmount,
        paid_amount: paidAmount,
        pending_amount: pendingAmount,
        total_schools: uniqueSchools,
        total_records: records?.length || 0
      };

      console.log('✅ BillingManagementService: Successfully calculated billing stats');
      return { data: stats, error: null };
    } catch (error: any) {
      console.error('❌ BillingManagementService: Critical error getting billing stats:', error);
      return { data: null, error: error.message };
    }
  }

  static async getSchoolBillingSummaries(): Promise<{ data: any[]; error: any }> {
    try {
      console.log('📊 BillingManagementService: Getting school billing summaries');

      // Test connection first
      const connectionTest = await BillingRecordsService.testConnection();
      if (!connectionTest) {
        return { data: [], error: 'Database connection failed' };
      }

      const { data, error } = await supabase
        .from('schools')
        .select(`
          id,
          name,
          created_at,
          school_billing_records (
            amount,
            status,
            billing_type
          )
        `)
        .limit(50);

      if (error) {
        console.error('❌ Error getting school billing summaries:', error);
        return { data: [], error: error.message };
      }

      console.log('✅ BillingManagementService: Successfully fetched school billing summaries');
      return { data: data || [], error: null };

    } catch (error: any) {
      console.error('❌ BillingManagementService: Critical error getting school billing summaries:', error);
      return { data: [], error: error.message };
    }
  }

  static async getPaymentHistory(schoolId?: string): Promise<{ data: any[]; error: any }> {
    try {
      console.log('📊 BillingManagementService: Getting payment history for school:', schoolId);

      let query = supabase
        .from('school_billing_records')
        .select('*')
        .eq('status', 'paid')
        .order('created_at', { ascending: false })
        .limit(100);

      if (schoolId) {
        query = query.eq('school_id', schoolId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error getting payment history:', error);
        return { data: [], error: error.message };
      }

      console.log('✅ BillingManagementService: Successfully fetched payment history');
      return { data: data || [], error: null };

    } catch (error: any) {
      console.error('❌ BillingManagementService: Critical error getting payment history:', error);
      return { data: [], error: error.message };
    }
  }

  static async getAllSchools(): Promise<{ data: any[]; error: any }> {
    try {
      console.log('📊 BillingManagementService: Getting all schools');

      const { data, error } = await supabase
        .from('schools')
        .select('id, name, created_at')
        .order('name')
        .limit(200);

      if (error) {
        console.error('❌ Error getting schools:', error);
        return { data: [], error: error.message };
      }

      console.log('✅ BillingManagementService: Successfully fetched schools');
      return { data: data || [], error: null };

    } catch (error: any) {
      console.error('❌ BillingManagementService: Critical error getting schools:', error);
      return { data: [], error: error.message };
    }
  }

  static async generateInvoiceData(recordId: string): Promise<{ data: any; error: any }> {
    try {
      console.log('📊 BillingManagementService: Generating invoice data for record:', recordId);

      const { data, error } = await supabase
        .from('school_billing_records')
        .select(`
          *,
          school:schools(*)
        `)
        .eq('id', recordId)
        .single();

      if (error) {
        console.error('❌ Error generating invoice data:', error);
        return { data: null, error: error.message };
      }

      console.log('✅ BillingManagementService: Successfully generated invoice data');
      return { data, error: null };

    } catch (error: any) {
      console.error('❌ BillingManagementService: Critical error generating invoice data:', error);
      return { data: null, error: error.message };
    }
  }

  static async updateBillingStatus(recordId: string, status: string, paymentMethod?: string): Promise<{ success: boolean; error?: any }> {
    console.log('📊 BillingManagementService: Updating billing status');
    return BillingRecordsService.updateBillingStatus(recordId, status, paymentMethod);
  }

  static async createSetupFee(schoolId: string): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('📊 BillingManagementService: Creating setup fee for school:', schoolId);

      const { data, error } = await supabase
        .from('school_billing_records')
        .insert({
          school_id: schoolId,
          billing_type: 'setup_fee',
          amount: 5000,
          currency: 'KES',
          status: 'pending',
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          invoice_number: `SF-${Date.now()}`
        });

      if (error) {
        console.error('❌ Error creating setup fee:', error);
        return { success: false, error };
      }

      console.log('✅ BillingManagementService: Setup fee created successfully');
      return { success: true };

    } catch (error: any) {
      console.error('❌ BillingManagementService: Critical error creating setup fee:', error);
      return { success: false, error };
    }
  }

  static async createMonthlySubscriptions(): Promise<{ success: boolean; recordsCreated?: number; error?: any }> {
    try {
      console.log('📊 BillingManagementService: Creating monthly subscriptions');

      // Get all schools
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('id')
        .limit(100);

      if (schoolsError) {
        console.error('❌ Error fetching schools for subscriptions:', schoolsError);
        return { success: false, error: schoolsError };
      }

      if (!schools || schools.length === 0) {
        console.log('📊 No schools found for subscription creation');
        return { success: true, recordsCreated: 0 };
      }

      // Create subscription records for each school
      const subscriptionRecords = schools.map(school => ({
        school_id: school.id,
        billing_type: 'subscription_fee' as const,
        amount: 2500,
        currency: 'KES',
        status: 'pending',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        invoice_number: `SUB-${Date.now()}-${school.id.slice(0, 8)}`
      }));

      const { error: insertError } = await supabase
        .from('school_billing_records')
        .insert(subscriptionRecords);

      if (insertError) {
        console.error('❌ Error creating subscription records:', insertError);
        return { success: false, error: insertError };
      }

      console.log('✅ BillingManagementService: Monthly subscriptions created successfully');
      return { success: true, recordsCreated: subscriptionRecords.length };

    } catch (error: any) {
      console.error('❌ BillingManagementService: Critical error creating monthly subscriptions:', error);
      return { success: false, error };
    }
  }

  static async updateBillingRecord(recordId: string, updates: any): Promise<{ success: boolean; error?: any }> {
    console.log('📊 BillingManagementService: Updating billing record');
    return BillingRecordsService.updateBillingRecord(recordId, updates);
  }

  // Diagnostic method to check if billing data exists
  static async checkBillingDataExists(): Promise<{ hasData: boolean; recordCount: number; error?: any }> {
    try {
      console.log('🔍 BillingManagementService: Checking if billing data exists');

      const { count, error } = await supabase
        .from('school_billing_records')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('❌ Error checking billing data existence:', error);
        return { hasData: false, recordCount: 0, error: error.message };
      }

      const recordCount = count || 0;
      console.log(`📊 BillingManagementService: Found ${recordCount} billing records`);
      
      return { 
        hasData: recordCount > 0, 
        recordCount,
        error: null 
      };

    } catch (error: any) {
      console.error('❌ BillingManagementService: Critical error checking billing data:', error);
      return { hasData: false, recordCount: 0, error: error.message };
    }
  }

  static async calculateSubscriptionFee(schoolId: string): Promise<{ data: any | null; error: any }> {
    console.log('📊 BillingManagementService: Calculating subscription fee');
    return FeeCreationService.calculateSubscriptionFee(schoolId);
  }

  static async createManualFeeRecord(data: any): Promise<{ success: boolean; recordId?: string; error?: any }> {
    console.log('📊 BillingManagementService: Creating manual fee record');
    return FeeCreationService.createManualFeeRecord(data);
  }
}
