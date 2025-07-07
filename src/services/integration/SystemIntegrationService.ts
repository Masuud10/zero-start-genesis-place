import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AcademicPeriod {
  id: string;
  year_name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  term_structure: string;
}

export interface AcademicTerm {
  id: string;
  term_name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  academic_year_id: string;
}

export interface ClassWithCurriculum {
  id: string;
  name: string;
  level: string;
  stream?: string;
  curriculum_type: 'CBC' | 'IGCSE' | 'Standard';
  academic_year_id: string;
  is_active: boolean;
}

export interface StudentEnrollment {
  student_id: string;
  class_id: string;
  academic_year_id: string;
  term_id: string;
  enrollment_date: string;
  is_active: boolean;
}

export interface SubjectAssignment {
  subject_id: string;
  class_id: string;
  teacher_id: string;
  academic_year_id: string;
  term_id: string;
  is_active: boolean;
}

export interface ExaminationSchedule {
  id: string;
  name: string;
  type: string;
  term_id: string;
  academic_year_id: string;
  class_ids: string[];
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface FeeStructure {
  id: string;
  name: string;
  class_id: string;
  academic_year_id: string;
  term_id: string;
  amount: number;
  category: string;
  due_date: string;
  is_active: boolean;
}

export class SystemIntegrationService {
  /**
   * Get current academic period information
   */
  static async getCurrentAcademicPeriod(schoolId: string): Promise<{
    year: AcademicPeriod | null;
    term: AcademicTerm | null;
    error?: string;
  }> {
    try {
      // Get current academic year
      const { data: currentYear, error: yearError } = await supabase
        .from('academic_years')
        .select('*')
        .eq('school_id', schoolId)
        .eq('is_current', true)
        .single();

      if (yearError && yearError.code !== 'PGRST116') {
        throw yearError;
      }

      // Get current academic term
      const { data: currentTerm, error: termError } = await supabase
        .from('academic_terms')
        .select('*')
        .eq('school_id', schoolId)
        .eq('is_current', true)
        .single();

      if (termError && termError.code !== 'PGRST116') {
        throw termError;
      }

      return {
        year: currentYear,
        term: currentTerm
      };
    } catch (error: any) {
      return {
        year: null,
        term: null,
        error: error.message
      };
    }
  }

  /**
   * Get available classes for a specific academic period
   */
  static async getAvailableClasses(
    schoolId: string,
    academicYearId?: string
  ): Promise<{ classes: ClassWithCurriculum[]; error?: string }> {
    try {
      let query = supabase
        .from('classes')
        .select('*')
        .eq('school_id', schoolId)
        .eq('is_active', true);

      if (academicYearId) {
        query = query.eq('academic_year_id', academicYearId);
      }

      const { data: classes, error } = await query.order('name');

      if (error) throw error;

      return { classes: classes || [] };
    } catch (error: any) {
      return { classes: [], error: error.message };
    }
  }

  /**
   * Get subjects assigned to a class for the current term
   */
  static async getClassSubjects(
    classId: string,
    termId?: string
  ): Promise<{ subjects: any[]; error?: string }> {
    try {
      let query = supabase
        .from('subject_assignments')
        .select(`
          *,
          subjects (*),
          profiles!subject_assignments_teacher_id_fkey (id, name, email)
        `)
        .eq('class_id', classId)
        .eq('is_active', true);

      if (termId) {
        query = query.eq('term_id', termId);
      }

      const { data: assignments, error } = await query;

      if (error) throw error;

      return { subjects: assignments || [] };
    } catch (error: any) {
      return { subjects: [], error: error.message };
    }
  }

  /**
   * Get students enrolled in a class for the current term
   */
  static async getClassStudents(
    classId: string,
    termId?: string
  ): Promise<{ students: any[]; error?: string }> {
    try {
      let query = supabase
        .from('student_classes')
        .select(`
          *,
          students (*),
          parent_students!parent_students_student_id_fkey (
            profiles!parent_students_parent_id_fkey (id, name, email, phone)
          )
        `)
        .eq('class_id', classId)
        .eq('is_active', true);

      if (termId) {
        query = query.eq('term_id', termId);
      }

      const { data: enrollments, error } = await query;

      if (error) throw error;

      return { students: enrollments || [] };
    } catch (error: any) {
      return { students: [], error: error.message };
    }
  }

  /**
   * Get examinations for a class in the current term
   */
  static async getClassExaminations(
    classId: string,
    termId?: string
  ): Promise<{ examinations: ExaminationSchedule[]; error?: string }> {
    try {
      let query = supabase
        .from('examinations')
        .select('*')
        .contains('classes', [classId])
        .eq('is_active', true);

      if (termId) {
        query = query.eq('term_id', termId);
      }

      const { data: examinations, error } = await query.order('start_date');

      if (error) throw error;

      return { examinations: examinations || [] };
    } catch (error: any) {
      return { examinations: [], error: error.message };
    }
  }

  /**
   * Get fee structure for a class in the current term
   */
  static async getClassFeeStructure(
    classId: string,
    termId?: string
  ): Promise<{ fees: FeeStructure[]; error?: string }> {
    try {
      let query = supabase
        .from('fee_structures')
        .select('*')
        .eq('class_id', classId)
        .eq('is_active', true);

      if (termId) {
        query = query.eq('term_id', termId);
      }

      const { data: fees, error } = await query.order('due_date');

      if (error) throw error;

      return { fees: fees || [] };
    } catch (error: any) {
      return { fees: [], error: error.message };
    }
  }

  /**
   * Enroll a student in a class for the current academic period
   */
  static async enrollStudent(
    studentId: string,
    classId: string,
    academicYearId: string,
    termId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if student is already enrolled in this class for this term
      const { data: existingEnrollment } = await supabase
        .from('student_classes')
        .select('id')
        .eq('student_id', studentId)
        .eq('class_id', classId)
        .eq('academic_year_id', academicYearId)
        .eq('term_id', termId)
        .single();

      if (existingEnrollment) {
        return { success: false, error: 'Student is already enrolled in this class for this term' };
      }

      // Create enrollment record
      const { error } = await supabase
        .from('student_classes')
        .insert({
          student_id: studentId,
          class_id: classId,
          academic_year_id: academicYearId,
          term_id: termId,
          enrollment_date: new Date().toISOString(),
          is_active: true
        });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Assign a subject to a class with a teacher
   */
  static async assignSubjectToClass(
    subjectId: string,
    classId: string,
    teacherId: string,
    academicYearId: string,
    termId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if subject is already assigned to this class for this term
      const { data: existingAssignment } = await supabase
        .from('subject_assignments')
        .select('id')
        .eq('subject_id', subjectId)
        .eq('class_id', classId)
        .eq('academic_year_id', academicYearId)
        .eq('term_id', termId)
        .single();

      if (existingAssignment) {
        return { success: false, error: 'Subject is already assigned to this class for this term' };
      }

      // Create assignment record
      const { error } = await supabase
        .from('subject_assignments')
        .insert({
          subject_id: subjectId,
          class_id: classId,
          teacher_id: teacherId,
          academic_year_id: academicYearId,
          term_id: termId,
          is_active: true
        });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create examination schedule for multiple classes
   */
  static async createExaminationSchedule(
    examinationData: Omit<ExaminationSchedule, 'id'>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('examinations')
        .insert({
          name: examinationData.name,
          type: examinationData.type,
          term_id: examinationData.term_id,
          academic_year_id: examinationData.academic_year_id,
          classes: examinationData.class_ids,
          start_date: examinationData.start_date,
          end_date: examinationData.end_date,
          is_active: true
        });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create fee structure for a class
   */
  static async createFeeStructure(
    feeData: Omit<FeeStructure, 'id'>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('fee_structures')
        .insert({
          name: feeData.name,
          class_id: feeData.class_id,
          academic_year_id: feeData.academic_year_id,
          term_id: feeData.term_id,
          amount: feeData.amount,
          category: feeData.category,
          due_date: feeData.due_date,
          is_active: true
        });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Promote students to the next class level
   */
  static async promoteStudents(
    classId: string,
    nextClassId: string,
    academicYearId: string,
    termId: string,
    studentIds?: string[]
  ): Promise<{ success: boolean; promotedCount: number; error?: string }> {
    try {
      // Get students to promote
      let query = supabase
        .from('student_classes')
        .select('student_id')
        .eq('class_id', classId)
        .eq('is_active', true);

      if (studentIds && studentIds.length > 0) {
        query = query.in('student_id', studentIds);
      }

      const { data: enrollments, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      if (!enrollments || enrollments.length === 0) {
        return { success: false, promotedCount: 0, error: 'No students found to promote' };
      }

      // Deactivate current enrollments
      const { error: deactivateError } = await supabase
        .from('student_classes')
        .update({ is_active: false })
        .eq('class_id', classId)
        .in('student_id', enrollments.map(e => e.student_id));

      if (deactivateError) throw deactivateError;

      // Create new enrollments
      const newEnrollments = enrollments.map(enrollment => ({
        student_id: enrollment.student_id,
        class_id: nextClassId,
        academic_year_id: academicYearId,
        term_id: termId,
        enrollment_date: new Date().toISOString(),
        is_active: true
      }));

      const { error: insertError } = await supabase
        .from('student_classes')
        .insert(newEnrollments);

      if (insertError) throw insertError;

      return { success: true, promotedCount: enrollments.length };
    } catch (error: any) {
      return { success: false, promotedCount: 0, error: error.message };
    }
  }

  /**
   * Get comprehensive student profile with all related data
   */
  static async getStudentProfile(
    studentId: string
  ): Promise<{ profile: any; error?: string }> {
    try {
      const { data: profile, error } = await supabase
        .from('students')
        .select(`
          *,
          classes!student_classes_student_id_fkey (
            *,
            classes (*),
            academic_years (*),
            academic_terms (*)
          ),
          parent_students!parent_students_student_id_fkey (
            profiles!parent_students_parent_id_fkey (*)
          ),
          grades (*),
          attendance (*),
          fees (*),
          certificates (*)
        `)
        .eq('id', studentId)
        .single();

      if (error) throw error;

      return { profile };
    } catch (error: any) {
      return { profile: null, error: error.message };
    }
  }

  /**
   * Get class analytics for the current term
   */
  static async getClassAnalytics(
    classId: string,
    termId: string
  ): Promise<{ analytics: any; error?: string }> {
    try {
      // Get class details
      const { data: classDetails } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();

      // Get student count
      const { count: studentCount } = await supabase
        .from('student_classes')
        .select('*', { count: 'exact' })
        .eq('class_id', classId)
        .eq('term_id', termId)
        .eq('is_active', true);

      // Get average attendance
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('status')
        .eq('class_id', classId)
        .eq('term_id', termId);

      const attendanceRate = attendanceData 
        ? (attendanceData.filter(a => a.status === 'present').length / attendanceData.length) * 100
        : 0;

      // Get average grades
      const { data: gradesData } = await supabase
        .from('grades')
        .select('score')
        .eq('class_id', classId)
        .eq('term_id', termId);

      const averageGrade = gradesData && gradesData.length > 0
        ? gradesData.reduce((sum, grade) => sum + (grade.score || 0), 0) / gradesData.length
        : 0;

      // Get fee collection rate
      const { data: feesData } = await supabase
        .from('fees')
        .select('amount, paid_amount')
        .eq('class_id', classId)
        .eq('term_id', termId);

      const totalFees = feesData?.reduce((sum, fee) => sum + (fee.amount || 0), 0) || 0;
      const totalPaid = feesData?.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0) || 0;
      const collectionRate = totalFees > 0 ? (totalPaid / totalFees) * 100 : 0;

      const analytics = {
        classDetails,
        studentCount: studentCount || 0,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        averageGrade: Math.round(averageGrade * 100) / 100,
        collectionRate: Math.round(collectionRate * 100) / 100,
        totalFees,
        totalPaid
      };

      return { analytics };
    } catch (error: any) {
      return { analytics: null, error: error.message };
    }
  }

  /**
   * Validate data relationships before operations
   */
  static async validateRelationships(
    operation: string,
    data: any
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      switch (operation) {
        case 'student_enrollment':
          // Validate class exists and is active
          const { data: classExists } = await supabase
            .from('classes')
            .select('id')
            .eq('id', data.class_id)
            .eq('is_active', true)
            .single();

          if (!classExists) {
            errors.push('Selected class does not exist or is not active');
          }

          // Validate academic year exists
          const { data: yearExists } = await supabase
            .from('academic_years')
            .select('id')
            .eq('id', data.academic_year_id)
            .single();

          if (!yearExists) {
            errors.push('Selected academic year does not exist');
          }

          // Validate term exists
          const { data: termExists } = await supabase
            .from('academic_terms')
            .select('id')
            .eq('id', data.term_id)
            .single();

          if (!termExists) {
            errors.push('Selected academic term does not exist');
          }
          break;

        case 'subject_assignment':
          // Validate subject exists
          const { data: subjectExists } = await supabase
            .from('subjects')
            .select('id')
            .eq('id', data.subject_id)
            .single();

          if (!subjectExists) {
            errors.push('Selected subject does not exist');
          }

          // Validate teacher exists and has teacher role
          const { data: teacherExists } = await supabase
            .from('profiles')
            .select('id, role')
            .eq('id', data.teacher_id)
            .eq('role', 'teacher')
            .single();

          if (!teacherExists) {
            errors.push('Selected teacher does not exist or is not assigned teacher role');
          }
          break;

        case 'examination_schedule':
          // Validate all classes exist
          if (data.class_ids && data.class_ids.length > 0) {
            const { data: classesExist } = await supabase
              .from('classes')
              .select('id')
              .in('id', data.class_ids);

            if (!classesExist || classesExist.length !== data.class_ids.length) {
              errors.push('One or more selected classes do not exist');
            }
          }
          break;
      }

      return { valid: errors.length === 0, errors };
    } catch (error: any) {
      return { valid: false, errors: [error.message] };
    }
  }
} 