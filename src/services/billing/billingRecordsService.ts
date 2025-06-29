
import { supabase } from '@/integrations/supabase/client';
import { BillingRecord, BillingFilters } from './types';

export class BillingRecordsService {
  private static readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private static readonly CONNECTION_TIMEOUT = 5000; // 5 seconds

  static async getAllBillingRecords(filters?: BillingFilters): Promise<{ data: BillingRecord[]; error: any }> {
    try {
      console.log('📊 BillingRecordsService: Starting getAllBillingRecords with filters:', filters);

      // Test connection first
      const connectionTest = await this.testConnectionWithTimeout();
      if (!connectionTest) {
        console.error('❌ Database connection failed');
        return { data: [], error: 'Database connection failed. Please check your network connection and try again.' };
      }

      const limit = 50;
      let query = supabase
        .from('school_billing_records')
        .select(`
          *,
          school:schools(id, name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Apply filters with proper validation
      if (filters?.status && filters.status !== 'all' && filters.status.trim() !== '') {
        query = query.eq('status', filters.status);
      }

      if (filters?.school_name && filters.school_name.trim() !== '') {
        const schoolsQuery = await this.executeWithTimeout(
          supabase
            .from('schools')
            .select('id')
            .ilike('name', `%${filters.school_name}%`)
            .limit(20),
          10000
        );
        
        if (schoolsQuery.error) {
          console.error('❌ Error filtering schools:', schoolsQuery.error);
          return { data: [], error: 'Error filtering schools. Please try again.' };
        }
        
        if (schoolsQuery.data && Array.isArray(schoolsQuery.data) && schoolsQuery.data.length > 0) {
          const schoolIds = schoolsQuery.data.map((s: any) => s.id);
          query = query.in('school_id', schoolIds);
        } else {
          console.log('📊 No schools match the name filter');
          return { data: [], error: null };
        }
      }

      console.log('📊 BillingRecordsService: Executing query...');
      const result = await this.executeWithTimeout(query, this.DEFAULT_TIMEOUT);

      if (result.error) {
        console.error('❌ Error fetching billing records:', result.error);
        return { data: [], error: `Database query failed: ${result.error.message}` };
      }

      if (!result.data || !Array.isArray(result.data)) {
        console.log('📊 BillingRecordsService: No billing records found');
        return { data: [], error: null };
      }

      // Get student counts for schools
      const schoolIds = [...new Set(result.data.map((record: any) => record.school_id).filter(Boolean))];
      const studentCounts = await this.getStudentCountsBatch(schoolIds);

      // Process records with proper typing
      const recordsWithStudentCounts = result.data.map((record: any) => ({
        ...record,
        billing_type: record.billing_type as 'setup_fee' | 'subscription_fee',
        school: record.school ? {
          ...record.school,
          student_count: studentCounts[record.school_id] || 0
        } : undefined
      })) as BillingRecord[];

      console.log('✅ BillingRecordsService: Successfully fetched', recordsWithStudentCounts.length, 'records');
      return { data: recordsWithStudentCounts, error: null };

    } catch (error: any) {
      console.error('❌ BillingRecordsService: Critical error:', error);
      if (error.name === 'AbortError') {
        return { data: [], error: 'Request timed out. Please try again.' };
      }
      return { data: [], error: `Service error: ${error.message || 'Unknown error occurred'}` };
    }
  }

  static async getSchoolBillingRecords(schoolId: string): Promise<{ data: BillingRecord[]; error: any }> {
    try {
      console.log('📊 BillingRecordsService: Fetching records for school:', schoolId);

      if (!schoolId || schoolId.trim() === '') {
        console.error('❌ School ID is required');
        return { data: [], error: 'School ID is required' };
      }

      const query = supabase
        .from('school_billing_records')
        .select(`
          *,
          school:schools(id, name)
        `)
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false })
        .limit(50);

      const result = await this.executeWithTimeout(query, this.DEFAULT_TIMEOUT);

      if (result.error) {
        console.error('❌ Error fetching school billing records:', result.error);
        return { data: [], error: `Database error: ${result.error.message}` };
      }

      if (!result.data || !Array.isArray(result.data)) {
        console.log('📊 BillingRecordsService: No billing records found for school:', schoolId);
        return { data: [], error: null };
      }

      // Get student count for this school
      const studentCounts = await this.getStudentCountsBatch([schoolId]);
      
      // Process records with proper typing
      const recordsWithStudentCount = result.data.map((record: any) => ({
        ...record,
        billing_type: record.billing_type as 'setup_fee' | 'subscription_fee',
        school: record.school ? {
          ...record.school,
          student_count: studentCounts[schoolId] || 0
        } : undefined
      })) as BillingRecord[];

      console.log('✅ BillingRecordsService: Successfully fetched', recordsWithStudentCount.length, 'school records');
      return { data: recordsWithStudentCount, error: null };

    } catch (error: any) {
      console.error('❌ BillingRecordsService: Critical error fetching school records:', error);
      if (error.name === 'AbortError') {
        return { data: [], error: 'Request timed out. Please try again.' };
      }
      return { data: [], error: `Service error: ${error.message || 'Unknown error'}` };
    }
  }

  static async updateBillingStatus(recordId: string, status: string, paymentMethod?: string): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('📊 BillingRecordsService: Updating billing status:', recordId, status);

      if (!recordId) {
        return { success: false, error: 'Record ID is required' };
      }

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

      const query = supabase
        .from('school_billing_records')
        .update(updateData)
        .eq('id', recordId);

      const result = await this.executeWithTimeout(query, this.DEFAULT_TIMEOUT);

      if (result.error) {
        console.error('❌ Error updating billing status:', result.error);
        return { success: false, error: result.error };
      }

      console.log('✅ BillingRecordsService: Billing status updated successfully');
      return { success: true };

    } catch (error: any) {
      console.error('❌ BillingRecordsService: Critical error updating billing status:', error);
      if (error.name === 'AbortError') {
        return { success: false, error: 'Update request timed out. Please try again.' };
      }
      return { success: false, error };
    }
  }

  static async updateBillingRecord(recordId: string, updates: any): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('📊 BillingRecordsService: Updating billing record:', recordId);

      if (!recordId) {
        return { success: false, error: 'Record ID is required' };
      }

      const query = supabase
        .from('school_billing_records')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', recordId);

      const result = await this.executeWithTimeout(query, this.DEFAULT_TIMEOUT);

      if (result.error) {
        console.error('❌ Error updating billing record:', result.error);
        return { success: false, error: result.error };
      }

      console.log('✅ BillingRecordsService: Billing record updated successfully');
      return { success: true };

    } catch (error: any) {
      console.error('❌ BillingRecordsService: Critical error updating billing record:', error);
      if (error.name === 'AbortError') {
        return { success: false, error: 'Update request timed out. Please try again.' };
      }
      return { success: false, error };
    }
  }

  private static async getStudentCountsBatch(schoolIds: string[]): Promise<Record<string, number>> {
    if (schoolIds.length === 0) return {};

    try {
      console.log('📊 BillingRecordsService: Fetching student counts for', schoolIds.length, 'schools');

      const query = supabase
        .from('students')
        .select('school_id')
        .in('school_id', schoolIds)
        .limit(2000);

      const result = await this.executeWithTimeout(query, 10000);

      if (result.error) {
        console.error('❌ Error fetching student counts:', result.error);
        return {};
      }

      // Count students per school efficiently
      const counts: Record<string, number> = {};
      schoolIds.forEach(id => counts[id] = 0);
      
      if (result.data && Array.isArray(result.data)) {
        result.data.forEach((student: any) => {
          if (counts[student.school_id] !== undefined) {
            counts[student.school_id]++;
          }
        });
      }

      console.log('✅ BillingRecordsService: Student counts calculated');
      return counts;
    } catch (error) {
      if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
        console.error('❌ Student count query timed out');
      } else {
        console.error('❌ Error in getStudentCountsBatch:', error);
      }
      return {};
    }
  }

  private static async executeWithTimeout<T>(query: any, timeoutMs: number): Promise<{ data: T | null; error: any }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log(`⏰ Query timeout after ${timeoutMs}ms`);
      controller.abort();
    }, timeoutMs);

    try {
      const result = await query.abortSignal(controller.signal);
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  static async testConnectionWithTimeout(): Promise<boolean> {
    try {
      console.log('🔍 BillingRecordsService: Testing database connection...');
      
      const query = supabase
        .from('schools')
        .select('id')
        .limit(1);
        
      const result = await this.executeWithTimeout(query, this.CONNECTION_TIMEOUT);
      
      if (result.error) {
        console.error('❌ Database connection test failed:', result.error);
        return false;
      }
      
      console.log('✅ Database connection test successful');
      return true;
    } catch (error) {
      if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
        console.error('❌ Database connection test timed out');
      } else {
        console.error('❌ Database connection test error:', error);
      }
      return false;
    }
  }
}
