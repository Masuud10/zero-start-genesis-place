
import { supabase } from '@/integrations/supabase/client';

interface UserScope {
  isSystemAdmin: boolean;
  schoolId: string | null;
}

export class ReportService {
  static async generateStudentReport(scope: UserScope, studentId: string, academicYear: string, term: string) {
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

      if (!scope.isSystemAdmin) {
        if (!scope.schoolId) {
          return { data: null, error: new Error("User's school context is required for this report.") };
        }
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

  static async generateClassReport(scope: UserScope, classId: string, academicYear: string, term: string) {
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

      if (!scope.isSystemAdmin) {
        if (!scope.schoolId) {
          return { data: null, error: new Error("User's school context is required for this report.") };
        }
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

  static async generateFinancialReport(scope: UserScope, schoolId?: string, academicYear?: string) {
    try {
      let query = supabase
        .from('financial_transactions')
        .select(`
          *,
          students:students(name, admission_number),
          fees:fees(amount, category, term)
        `);

      if (scope.isSystemAdmin) {
        // System admin can filter by a specific school or get all.
        if (schoolId) {
          query = query.eq('school_id', schoolId);
        }
      } else {
        // Non-system admin is always scoped to their own school.
        if (!scope.schoolId) {
          return { data: null, error: new Error("User's school context is required for this report.") };
        }
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
