
import { supabase } from '@/integrations/supabase/client';
import { CreateFeeRecordData } from './types';

export class FeeCreationService {
  static async createSetupFee(schoolId: string): Promise<{ success: boolean; recordId?: string; error?: any }> {
    try {
      console.log('📊 FeeCreationService: Creating setup fee for school:', schoolId);

      // Check if setup fee already exists
      const { data: existingFee, error: checkError } = await supabase
        .from('school_billing_records')
        .select('id')
        .eq('school_id', schoolId)
        .eq('billing_type', 'setup_fee')
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing setup fee:', checkError);
        throw checkError;
      }

      if (existingFee) {
        return { success: false, error: 'Setup fee already exists for this school' };
      }

      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber();

      // Create setup fee record
      const { data: record, error } = await supabase
        .from('school_billing_records')
        .insert({
          school_id: schoolId,
          billing_type: 'setup_fee',
          amount: 5000, // Default setup fee amount
          currency: 'KES',
          status: 'pending',
          invoice_number: invoiceNumber,
          description: 'One-time school setup fee',
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating setup fee:', error);
        throw error;
      }

      console.log('📊 FeeCreationService: Setup fee created successfully');
      return { success: true, recordId: record.id };

    } catch (error: any) {
      console.error('📊 FeeCreationService: Error creating setup fee:', error);
      return { success: false, error };
    }
  }

  static async createMonthlySubscriptions(): Promise<{ success: boolean; recordsCreated: number; error?: any }> {
    try {
      console.log('📊 FeeCreationService: Creating monthly subscription fees');

      // Get all active schools
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name')
        .eq('status', 'active');

      if (schoolsError) {
        console.error('Error fetching schools:', schoolsError);
        throw schoolsError;
      }

      if (!schools || schools.length === 0) {
        return { success: true, recordsCreated: 0 };
      }

      let recordsCreated = 0;
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM format

      for (const school of schools) {
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

        // Get student count for calculation
        const { data: students } = await supabase
          .from('students')
          .select('id')
          .eq('school_id', school.id);

        const studentCount = students?.length || 0;
        const amount = studentCount * 50; // KES 50 per student

        if (amount > 0) {
          const invoiceNumber = await this.generateInvoiceNumber();

          await supabase
            .from('school_billing_records')
            .insert({
              school_id: school.id,
              billing_type: 'subscription_fee',
              amount: amount,
              currency: 'KES',
              student_count: studentCount,
              billing_period_start: `${currentMonth}-01`,
              billing_period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
              status: 'pending',
              invoice_number: invoiceNumber,
              description: `Monthly subscription fee - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} (${studentCount} students)`,
              due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days from now
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          recordsCreated++;
        }
      }

      console.log('📊 FeeCreationService: Monthly subscription fees created');
      return { success: true, recordsCreated };

    } catch (error: any) {
      console.error('📊 FeeCreationService: Error creating subscription fees:', error);
      return { success: false, recordsCreated: 0, error };
    }
  }

  static async createManualFeeRecord(data: CreateFeeRecordData): Promise<{ success: boolean; recordId?: string; error?: any }> {
    try {
      console.log('📊 FeeCreationService: Creating manual fee record:', data);

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
        
        // If amount is the per-student rate, multiply by student count
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

      console.log('📊 FeeCreationService: Manual fee record created successfully');
      return { success: true, recordId: record.id };

    } catch (error: any) {
      console.error('📊 FeeCreationService: Error creating manual fee record:', error);
      return { success: false, error };
    }
  }

  static async calculateSubscriptionFee(schoolId: string): Promise<{ data: any | null; error: any }> {
    try {
      console.log('📊 FeeCreationService: Calculating subscription fee for school:', schoolId);

      // Get student count
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .eq('school_id', schoolId);

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
        throw studentsError;
      }

      const studentCount = students?.length || 0;
      const perStudentRate = 50; // KES 50 per student
      const calculatedAmount = studentCount * perStudentRate;

      const result = {
        student_count: studentCount,
        per_student_rate: perStudentRate,
        calculated_amount: calculatedAmount,
        currency: 'KES'
      };

      console.log('📊 FeeCreationService: Subscription fee calculated');
      return { data: result, error: null };

    } catch (error: any) {
      console.error('📊 FeeCreationService: Error calculating subscription fee:', error);
      return { data: null, error };
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
