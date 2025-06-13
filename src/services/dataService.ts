
import { supabase } from '@/integrations/supabase/client';
import { MultiTenantUtils } from '@/utils/multiTenantUtils';

export interface StudentData {
  id: string;
  name: string;
  admission_number: string;
  class_id: string;
  school_id: string;
  parent_id?: string;
  roll_number?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  parent_contact?: string;
  emergency_contact?: string;
  medical_notes?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GradeData {
  id: string;
  student_id: string;
  subject_id: string;
  class_id: string;
  score: number;
  max_score: number;
  percentage: number;
  position?: number;
  term: string;
  exam_type: string;
  submitted_by: string;
  submitted_at: string;
  status: 'draft' | 'submitted' | 'approved' | 'released';
  reviewed_by?: string;
  reviewed_at?: string;
  comments?: string;
  is_released: boolean;
  is_immutable: boolean;
  created_at: string;
  updated_at: string;
}

export interface AttendanceData {
  id: string;
  student_id: string;
  class_id: string;
  school_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  session: 'morning' | 'afternoon' | 'full_day';
  remarks?: string;
  submitted_by: string;
  submitted_at: string;
  academic_year: string;
  term: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialData {
  id: string;
  student_id: string;
  school_id: string;
  amount: number;
  due_date: string;
  term: string;
  category: 'tuition' | 'transport' | 'meals' | 'activities' | 'other';
  status: 'pending' | 'paid' | 'overdue';
  paid_amount: number;
  paid_date?: string;
  payment_method?: 'mpesa' | 'cash' | 'bank_transfer' | 'card' | 'cheque';
  mpesa_code?: string;
  academic_year: string;
  installment_number: number;
  late_fee_amount: number;
  discount_amount: number;
  created_at: string;
  updated_at: string;
}

export class DataService {
  // Student Management
  static async createStudent(studentData: Partial<StudentData>) {
    try {
      const scopedData = await MultiTenantUtils.ensureSchoolScope(studentData);
      const { data, error } = await supabase
        .from('students')
        .insert(scopedData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating student:', error);
      return { data: null, error };
    }
  }

  static async updateStudent(id: string, updates: Partial<StudentData>) {
    try {
      const { data, error } = await supabase
        .from('students')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating student:', error);
      return { data: null, error };
    }
  }

  static async deleteStudent(id: string) {
    try {
      const { error } = await supabase
        .from('students')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting student:', error);
      return { error };
    }
  }

  // Grade Management
  static async createGrade(gradeData: Partial<GradeData>) {
    try {
      const { data, error } = await supabase
        .from('grades')
        .insert(gradeData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating grade:', error);
      return { data: null, error };
    }
  }

  static async updateGrade(id: string, updates: Partial<GradeData>) {
    try {
      const { data, error } = await supabase
        .from('grades')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating grade:', error);
      return { data: null, error };
    }
  }

  // Attendance Management
  static async recordAttendance(attendanceData: Partial<AttendanceData>) {
    try {
      const scopedData = await MultiTenantUtils.ensureSchoolScope(attendanceData);
      const { data, error } = await supabase
        .from('attendance')
        .insert(scopedData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error recording attendance:', error);
      return { data: null, error };
    }
  }

  static async updateAttendance(id: string, updates: Partial<AttendanceData>) {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating attendance:', error);
      return { data: null, error };
    }
  }

  // Financial Management
  static async createFee(feeData: Partial<FinancialData>) {
    try {
      const scopedData = await MultiTenantUtils.ensureSchoolScope(feeData);
      const { data, error } = await supabase
        .from('fees')
        .insert(scopedData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating fee:', error);
      return { data: null, error };
    }
  }

  static async updateFee(id: string, updates: Partial<FinancialData>) {
    try {
      const { data, error } = await supabase
        .from('fees')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating fee:', error);
      return { data: null, error };
    }
  }

  static async recordPayment(transactionData: any) {
    try {
      const scopedData = await MultiTenantUtils.ensureSchoolScope(transactionData);
      const { data, error } = await supabase
        .from('financial_transactions')
        .insert(scopedData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error recording payment:', error);
      return { data: null, error };
    }
  }

  // Reporting
  static async generateStudentReport(studentId: string, academicYear: string, term: string) {
    try {
      const query = supabase
        .from('students')
        .select(`
          *,
          grades:grades(
            subject_id,
            score,
            max_score,
            percentage,
            position,
            exam_type,
            subjects:subjects(name, code)
          ),
          attendance:attendance(
            date,
            status,
            session
          ),
          fees:fees(
            amount,
            paid_amount,
            status,
            category,
            due_date
          )
        `)
        .eq('id', studentId);

      if (!await MultiTenantUtils.isSystemAdmin()) {
        const scope = await MultiTenantUtils.getCurrentUserScope();
        query.eq('school_id', scope.schoolId);
      }

      const { data, error } = await query.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error generating student report:', error);
      return { data: null, error };
    }
  }

  static async generateClassReport(classId: string, academicYear: string, term: string) {
    try {
      const query = supabase
        .from('classes')
        .select(`
          *,
          students:students(
            id,
            name,
            admission_number,
            grades:grades(score, max_score, percentage, subject_id),
            attendance:attendance(status, date)
          )
        `)
        .eq('id', classId);

      if (!await MultiTenantUtils.isSystemAdmin()) {
        const scope = await MultiTenantUtils.getCurrentUserScope();
        query.eq('school_id', scope.schoolId);
      }

      const { data, error } = await query.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error generating class report:', error);
      return { data: null, error };
    }
  }

  static async generateFinancialReport(schoolId?: string, academicYear?: string) {
    try {
      let query = supabase
        .from('financial_transactions')
        .select(`
          *,
          students:students(name, admission_number),
          fees:fees(amount, category, term)
        `);

      if (schoolId) {
        query = query.eq('school_id', schoolId);
      } else if (!await MultiTenantUtils.isSystemAdmin()) {
        const scope = await MultiTenantUtils.getCurrentUserScope();
        query = query.eq('school_id', scope.schoolId);
      }

      if (academicYear) {
        query = query.eq('academic_year', academicYear);
      }

      const { data, error } = await query.order('processed_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error generating financial report:', error);
      return { data: null, error };
    }
  }
}
