
import { supabase } from '@/integrations/supabase/client';

export interface AssignTeacherParams {
  teacherId: string;
  classId: string;
  subjectId?: string;
}

export interface EnrollStudentParams {
  studentId: string;
  classId: string;
  academicYear?: string;
}

export interface LinkParentParams {
  parentId: string;
  studentId: string;
  relationshipType?: string;
  isPrimaryContact?: boolean;
}

export const RelationshipService = {
  // Teacher-Class relationships
  async assignTeacherToClass(params: AssignTeacherParams) {
    const { data, error } = await supabase
      .from('teacher_classes')
      .insert({
        teacher_id: params.teacherId,
        class_id: params.classId,
        subject_id: params.subjectId || null
      })
      .select()
      .single();

    return { data, error };
  },

  async removeTeacherFromClass(teacherId: string, classId: string, subjectId?: string) {
    let query = supabase
      .from('teacher_classes')
      .delete()
      .eq('teacher_id', teacherId)
      .eq('class_id', classId);

    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }

    const { error } = await query;
    return { error };
  },

  async getTeachersForClass(classId: string) {
    const { data, error } = await supabase
      .from('teacher_classes')
      .select(`
        *,
        teacher:profiles!teacher_id(id, name, email),
        subject:subjects(id, name, code)
      `)
      .eq('class_id', classId);

    return { data: data || [], error };
  },

  // Student-Class relationships
  async enrollStudent(params: EnrollStudentParams) {
    const { data, error } = await supabase
      .from('student_classes')
      .insert({
        student_id: params.studentId,
        class_id: params.classId,
        academic_year: params.academicYear || new Date().getFullYear().toString(),
        enrollment_date: new Date().toISOString().split('T')[0],
        is_active: true
      })
      .select()
      .single();

    return { data, error };
  },

  async removeStudentFromClass(studentId: string, classId: string) {
    const { error } = await supabase
      .from('student_classes')
      .update({ is_active: false })
      .eq('student_id', studentId)
      .eq('class_id', classId);

    return { error };
  },

  async getStudentsForClass(classId: string) {
    const { data, error } = await supabase
      .from('student_classes')
      .select(`
        *,
        student:students(id, name, admission_number, roll_number)
      `)
      .eq('class_id', classId)
      .eq('is_active', true);

    return { data: data || [], error };
  },

  // Parent-Student relationships
  async linkParentToStudent(params: LinkParentParams) {
    const { data, error } = await supabase
      .from('parent_students')
      .insert({
        parent_id: params.parentId,
        student_id: params.studentId,
        relationship_type: params.relationshipType || 'parent',
        is_primary_contact: params.isPrimaryContact || false
      })
      .select()
      .single();

    return { data, error };
  },

  async unlinkParentFromStudent(parentId: string, studentId: string) {
    const { error } = await supabase
      .from('parent_students')
      .delete()
      .eq('parent_id', parentId)
      .eq('student_id', studentId);

    return { error };
  },

  async getParentsForStudent(studentId: string) {
    const { data, error } = await supabase
      .from('parent_students')
      .select(`
        *,
        parent:profiles!parent_id(id, name, email)
      `)
      .eq('student_id', studentId);

    return { data: data || [], error };
  }
};
