
import { supabase } from '@/integrations/supabase/client';
import { School } from './types';

export class SchoolsService {
  static async getAllSchools(): Promise<{ data: School[] | null; error: any }> {
    try {
      console.log('📊 SchoolsService: Fetching all schools');

      const { data, error } = await supabase
        .from('schools')
        .select('id, name, email, phone, address')
        .order('name');

      if (error) {
        console.error('Error fetching schools:', error);
        throw error;
      }

      // Get student counts for all schools
      const schoolIds = data?.map(school => school.id) || [];
      const studentCounts = await this.getStudentCounts(schoolIds);

      // Merge student counts with school data
      const schoolsWithStudentCounts = (data || []).map(school => ({
        ...school,
        student_count: studentCounts[school.id] || 0
      }));

      console.log('📊 SchoolsService: Schools fetched successfully');
      return { data: schoolsWithStudentCounts, error: null };

    } catch (error: any) {
      console.error('📊 SchoolsService: Error fetching schools:', error);
      return { data: null, error };
    }
  }

  static async getSchoolBillingSummaries(): Promise<{ data: any[] | null; error: any }> {
    try {
      console.log('📊 SchoolsService: Fetching school billing summaries');

      // Get all schools
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name')
        .order('name');

      if (schoolsError) {
        console.error('Error fetching schools:', schoolsError);
        throw schoolsError;
      }

      // Get billing records for all schools
      const { data: billingRecords, error: billingError } = await supabase
        .from('school_billing_records')
        .select('*');

      if (billingError) {
        console.error('Error fetching billing records:', billingError);
        throw billingError;
      }

      // Calculate summaries for each school
      const summaries = (schools || []).map(school => {
        const schoolRecords = billingRecords?.filter(r => r.school_id === school.id) || [];
        
        const totalBilling = schoolRecords.reduce((sum, record) => sum + Number(record.amount), 0);
        const totalPaid = schoolRecords.filter(r => r.status === 'paid').reduce((sum, record) => sum + Number(record.amount), 0);
        const outstandingBalance = totalBilling - totalPaid;

        return {
          school_id: school.id,
          school_name: school.name,
          total_billing_amount: totalBilling,
          total_paid_amount: totalPaid,
          outstanding_balance: outstandingBalance,
          record_count: schoolRecords.length
        };
      });

      console.log('📊 SchoolsService: School billing summaries calculated');
      return { data: summaries, error: null };

    } catch (error: any) {
      console.error('📊 SchoolsService: Error fetching school billing summaries:', error);
      return { data: null, error };
    }
  }

  private static async getStudentCounts(schoolIds: string[]): Promise<Record<string, number>> {
    if (schoolIds.length === 0) return {};

    try {
      const { data, error } = await supabase
        .from('students')
        .select('school_id')
        .in('school_id', schoolIds);

      if (error) {
        console.error('Error fetching student counts:', error);
        return {};
      }

      // Count students per school
      const counts: Record<string, number> = {};
      schoolIds.forEach(id => counts[id] = 0);
      
      data?.forEach(student => {
        if (counts[student.school_id] !== undefined) {
          counts[student.school_id]++;
        }
      });

      return counts;
    } catch (error) {
      console.error('Error in getStudentCounts:', error);
      return {};
    }
  }
}
