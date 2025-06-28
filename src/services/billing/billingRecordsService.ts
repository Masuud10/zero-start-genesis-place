import { supabase } from '@/integrations/supabase/client';
import { BillingRecord, BillingFilters } from './types';

export class BillingRecordsService {
  static async getAllBillingRecords(filters?: BillingFilters): Promise<{ data: BillingRecord[]; error: any }> {
    try {
      console.log('📊 BillingRecordsService: Starting getAllBillingRecords with filters:', filters);

      // Test connection first with timeout
      const connectionTest = await this.testConnection();
      if (!connectionTest) {
        console.error('❌ Database connection failed');
        return { data: [], error: 'Database connection failed. Please check your network connection and try again.' };
      }

      let query = supabase
        .from('school_billing_records')
        .select(`
          *,
          school:schools(id, name)
        `)
        .order('created_at', { ascending: false })
        .limit(1000);

      // Apply filters with proper validation
      if (filters?.status && filters.status !== 'all' && filters.status.trim() !== '') {
        query = query.eq('status', filters.status);
      }

      if (filters?.school_name && filters.school_name.trim() !== '') {
        const schoolsQuery = await supabase
          .from('schools')
          .select('id')
          .ilike('name', `%${filters.school_name}%`)
          .limit(100);
        
        if (schoolsQuery.error) {
          console.error('❌ Error filtering schools:', schoolsQuery.error);
          return { data: [], error: 'Error filtering schools. Please try again.' };
        }
        
        if (schoolsQuery.data && schoolsQuery.data.length > 0) {
          const schoolIds = schoolsQuery.data.map(s => s.id);
          query = query.in('school_id', schoolIds);
        } else {
          console.log('📊 No schools match the name filter');
          return { data: [], error: null };
        }
      }

      if (filters?.month && filters.month.trim() !== '') {
        const monthNum = parseInt(filters.month);
        if (monthNum >= 1 && monthNum <= 12) {
          query = query.gte('created_at', `2024-${monthNum.toString().padStart(2, '0')}-01`)
                      .lt('created_at', `2024-${(monthNum + 1).toString().padStart(2, '0')}-01`);
        }
      }

      if (filters?.year && filters.year.trim() !== '') {
        const yearNum = parseInt(filters.year);
        if (yearNum > 2020 && yearNum < 2030) {
          query = query.gte('created_at', `${yearNum}-01-01`)
                      .lt('created_at', `${yearNum + 1}-01-01`);
        }
      }

      console.log('📊 BillingRecordsService: Executing query...');
      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching billing records:', error);
        return { data: [], error: 'Failed to fetch billing records. Please try again.' };
      }

      if (!data || data.length === 0) {
        console.log('📊 BillingRecordsService: No billing records found');
        return { data: [], error: null };
      }

      // Fetch student counts for each school
      const schoolIds = [...new Set(data.map(record => record.school_id).filter(Boolean))];
      console.log('📊 BillingRecordsService: Fetching student counts for schools:', schoolIds.length);
      
      const studentCounts = await this.getStudentCounts(schoolIds);

      // Process and type the records properly
      const recordsWithStudentCounts = data.map(record => ({
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
      return { data: [], error: 'An unexpected error occurred while fetching billing records. Please try again.' };
    }
  }

  static async getSchoolBillingRecords(schoolId: string): Promise<{ data: BillingRecord[]; error: any }> {
    try {
      console.log('📊 BillingRecordsService: Fetching records for school:', schoolId);

      if (!schoolId || schoolId.trim() === '') {
        console.error('❌ School ID is required');
        return { data: [], error: 'School ID is required' };
      }

      // Test connection first
      const connectionTest = await this.testConnection();
      if (!connectionTest) {
        return { data: [], error: 'Database connection failed' };
      }

      const { data, error } = await supabase
        .from('school_billing_records')
        .select(`
          *,
          school:schools(id, name)
        `)
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) {
        console.error('❌ Error fetching school billing records:', error);
        return { data: [], error: `Database error: ${error.message}` };
      }

      if (!data) {
        console.log('📊 BillingRecordsService: No billing records found for school:', schoolId);
        return { data: [], error: null };
      }

      // Get student count for this school
      const studentCounts = await this.getStudentCounts([schoolId]);
      
      // Process records with proper typing
      const recordsWithStudentCount = data.map(record => ({
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

      const { error } = await supabase
        .from('school_billing_records')
        .update(updateData)
        .eq('id', recordId);

      if (error) {
        console.error('❌ Error updating billing status:', error);
        return { success: false, error };
      }

      console.log('✅ BillingRecordsService: Billing status updated successfully');
      return { success: true };

    } catch (error: any) {
      console.error('❌ BillingRecordsService: Critical error updating billing status:', error);
      return { success: false, error };
    }
  }

  static async updateBillingRecord(recordId: string, updates: any): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('📊 BillingRecordsService: Updating billing record:', recordId);

      if (!recordId) {
        return { success: false, error: 'Record ID is required' };
      }

      const { error } = await supabase
        .from('school_billing_records')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', recordId);

      if (error) {
        console.error('❌ Error updating billing record:', error);
        return { success: false, error };
      }

      console.log('✅ BillingRecordsService: Billing record updated successfully');
      return { success: true };

    } catch (error: any) {
      console.error('❌ BillingRecordsService: Critical error updating billing record:', error);
      return { success: false, error };
    }
  }

  private static async getStudentCounts(schoolIds: string[]): Promise<Record<string, number>> {
    if (schoolIds.length === 0) return {};

    try {
      console.log('📊 BillingRecordsService: Fetching student counts for', schoolIds.length, 'schools');

      const { data, error } = await supabase
        .from('students')
        .select('school_id')
        .in('school_id', schoolIds)
        .limit(10000);

      if (error) {
        console.error('❌ Error fetching student counts:', error);
        return {};
      }

      // Count students per school
      const counts: Record<string, number> = {};
      schoolIds.forEach(id => counts[id] = 0);
      
      if (data) {
        data.forEach(student => {
          if (counts[student.school_id] !== undefined) {
            counts[student.school_id]++;
          }
        });
      }

      console.log('✅ BillingRecordsService: Student counts calculated');
      return counts;
    } catch (error) {
      console.error('❌ Error in getStudentCounts:', error);
      return {};
    }
  }

  // Enhanced connection test with better error handling
  static async testConnection(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const { error } = await supabase
        .from('schools')
        .select('id')
        .limit(1)
        .abortSignal(controller.signal);
        
      clearTimeout(timeoutId);
      
      if (error) {
        console.error('❌ Database connection test failed:', error);
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
