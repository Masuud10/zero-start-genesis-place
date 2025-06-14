
import { supabase } from '@/integrations/supabase/client';
import { MultiTenantUtils } from '@/utils/multiTenantUtils';

export class ReportService {
  static async generateStudentReport(studentId: string, academicYear: string, term: string) {
    try {
      const scope = await MultiTenantUtils.getCurrentUserScope();
      
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
      const scope = await MultiTenantUtils.getCurrentUserScope();
      
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
      const scope = await MultiTenantUtils.getCurrentUserScope();
      
      let query = supabase
        .from('financial_transactions')
        .select(`
          *,
          students:students(name, admission_number),
          fees:fees(amount, category, term)
        `);

      if (schoolId) {
        query = query.eq('school_id', schoolId);
      } else if (!scope.isSystemAdmin) {
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
