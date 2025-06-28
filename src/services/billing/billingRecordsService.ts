
import { supabase } from '@/integrations/supabase/client';
import { BillingRecord, BillingFilters } from './types';

export class BillingRecordsService {
  static async getAllBillingRecords(filters?: BillingFilters): Promise<{ data: BillingRecord[]; error: any }> {
    try {
      console.log('📊 BillingRecordsService: Fetching billing records with filters:', filters);

      let query = supabase
        .from('school_billing_records')
        .select(`
          *,
          school:schools(id, name)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.school_name) {
        // We'll need to filter by school name after the query since we can't do complex joins
        const schoolsQuery = await supabase
          .from('schools')
          .select('id')
          .ilike('name', `%${filters.school_name}%`);
        
        if (schoolsQuery.data && schoolsQuery.data.length > 0) {
          const schoolIds = schoolsQuery.data.map(s => s.id);
          query = query.in('school_id', schoolIds);
        } else {
          // No schools match the name filter, return empty result
          return { data: [], error: null };
        }
      }

      if (filters?.month) {
        query = query.gte('created_at', `2024-${filters.month.padStart(2, '0')}-01`)
                    .lt('created_at', `2024-${(parseInt(filters.month) + 1).toString().padStart(2, '0')}-01`);
      }

      if (filters?.year) {
        query = query.gte('created_at', `${filters.year}-01-01`)
                    .lt('created_at', `${parseInt(filters.year) + 1}-01-01`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching billing records:', error);
        return { data: [], error };
      }

      if (!data || data.length === 0) {
        console.log('📊 BillingRecordsService: No billing records found');
        return { data: [], error: null };
      }

      // Fetch student counts for each school
      const schoolIds = [...new Set(data.map(record => record.school_id).filter(Boolean))];
      console.log('📊 BillingRecordsService: Fetching student counts for schools:', schoolIds);
      
      const studentCounts = await this.getStudentCounts(schoolIds);

      // Merge student counts with billing records and ensure proper typing
      const recordsWithStudentCounts = data.map(record => ({
        ...record,
        billing_type: record.billing_type as 'setup_fee' | 'subscription_fee',
        school: record.school ? {
          ...record.school,
          student_count: studentCounts[record.school_id] || 0
        } : undefined
      })) as BillingRecord[];

      console.log('✅ BillingRecordsService: Billing records fetched successfully, count:', recordsWithStudentCounts.length);
      return { data: recordsWithStudentCounts, error: null };

    } catch (error: any) {
      console.error('❌ BillingRecordsService: Critical error fetching billing records:', error);
      return { data: [], error };
    }
  }

  static async getSchoolBillingRecords(schoolId: string): Promise<{ data: BillingRecord[]; error: any }> {
    try {
      console.log('📊 BillingRecordsService: Fetching billing records for school:', schoolId);

      if (!schoolId) {
        console.error('❌ School ID is required');
        return { data: [], error: 'School ID is required' };
      }

      const { data, error } = await supabase
        .from('school_billing_records')
        .select(`
          *,
          school:schools(id, name)
        `)
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching school billing records:', error);
        return { data: [], error };
      }

      if (!data) {
        console.log('📊 BillingRecordsService: No billing records found for school:', schoolId);
        return { data: [], error: null };
      }

      // Get student count for this school
      const studentCounts = await this.getStudentCounts([schoolId]);
      
      // Merge student count with records and ensure proper typing
      const recordsWithStudentCount = data.map(record => ({
        ...record,
        billing_type: record.billing_type as 'setup_fee' | 'subscription_fee',
        school: record.school ? {
          ...record.school,
          student_count: studentCounts[schoolId] || 0
        } : undefined
      })) as BillingRecord[];

      console.log('✅ BillingRecordsService: School billing records fetched successfully, count:', recordsWithStudentCount.length);
      return { data: recordsWithStudentCount, error: null };

    } catch (error: any) {
      console.error('❌ BillingRecordsService: Critical error fetching school billing records:', error);
      return { data: [], error };
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
      console.log('📊 BillingRecordsService: Fetching student counts for schools:', schoolIds);

      const { data, error } = await supabase
        .from('students')
        .select('school_id')
        .in('school_id', schoolIds);

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

      console.log('✅ BillingRecordsService: Student counts fetched:', counts);
      return counts;
    } catch (error) {
      console.error('❌ Error in getStudentCounts:', error);
      return {};
    }
  }
}
