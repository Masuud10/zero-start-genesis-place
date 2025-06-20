
import { supabase } from '@/integrations/supabase/client';
import { Subject, SubjectCreationData, SubjectAssignment, CreateAssignmentData } from '@/types/subject';

export class SubjectService {
  static async createSubject(data: SubjectCreationData, schoolId: string): Promise<Subject> {
    // Validate required fields
    if (!data.name?.trim()) {
      throw new Error('Subject name is required');
    }
    
    if (!data.code?.trim()) {
      throw new Error('Subject code is required');
    }

    // Check for duplicate code
    const { data: existing } = await supabase
      .from('subjects')
      .select('id')
      .eq('school_id', schoolId)
      .eq('code', data.code.toUpperCase())
      .maybeSingle();

    if (existing) {
      throw new Error(`Subject with code "${data.code}" already exists`);
    }

    // Validate class and teacher if provided
    if (data.class_id) {
      const { data: classData } = await supabase
        .from('classes')
        .select('id')
        .eq('id', data.class_id)
        .eq('school_id', schoolId)
        .maybeSingle();

      if (!classData) {
        throw new Error('Selected class does not exist or does not belong to your school');
      }
    }

    if (data.teacher_id) {
      const { data: teacherData } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.teacher_id)
        .eq('school_id', schoolId)
        .eq('role', 'teacher')
        .maybeSingle();

      if (!teacherData) {
        throw new Error('Selected teacher does not exist or does not belong to your school');
      }
    }

    const payload = {
      name: data.name.trim(),
      code: data.code.trim().toUpperCase(),
      class_id: data.class_id || null,
      teacher_id: data.teacher_id || null,
      curriculum: data.curriculum || 'cbc',
      category: data.category || 'core',
      credit_hours: data.credit_hours || 1,
      description: data.description?.trim() || null,
      school_id: schoolId,
      is_active: true
    };

    const { data: subject, error } = await supabase
      .from('subjects')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Subject creation error:', error);
      throw new Error(error.message || 'Failed to create subject');
    }

    return subject;
  }

  static async getSubjects(schoolId: string, classId?: string): Promise<Subject[]> {
    let query = supabase
      .from('subjects')
      .select('*')
      .eq('school_id', schoolId)
      .eq('is_active', true);

    if (classId && classId !== 'all') {
      query = query.eq('class_id', classId);
    }

    const { data, error } = await query.order('name');

    if (error) {
      console.error('Error fetching subjects:', error);
      throw new Error(error.message || 'Failed to fetch subjects');
    }

    return data || [];
  }

  static async createAssignment(data: CreateAssignmentData, schoolId: string): Promise<SubjectAssignment> {
    // Check for existing assignment
    const { data: existing } = await supabase
      .from('subject_teacher_assignments')
      .select('id')
      .eq('school_id', schoolId)
      .eq('subject_id', data.subject_id)
      .eq('teacher_id', data.teacher_id)
      .eq('class_id', data.class_id)
      .eq('is_active', true)
      .maybeSingle();

    if (existing) {
      throw new Error('This teacher is already assigned to this subject for this class');
    }

    const payload = {
      ...data,
      school_id: schoolId,
      is_active: true
    };

    const { data: assignment, error } = await supabase
      .from('subject_teacher_assignments')
      .insert(payload)
      .select(`
        *,
        subjects(id, name, code),
        classes(id, name)
      `)
      .single();

    if (error) {
      console.error('Assignment creation error:', error);
      throw new Error(error.message || 'Failed to create assignment');
    }

    // Fetch teacher data separately
    const { data: teacher } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq('id', data.teacher_id)
      .single();

    return {
      ...assignment,
      subject: assignment.subjects,
      class: assignment.classes,
      teacher: teacher || undefined
    };
  }

  static async getAssignments(schoolId: string, classId?: string): Promise<SubjectAssignment[]> {
    let query = supabase
      .from('subject_teacher_assignments')
      .select(`
        *,
        subjects(id, name, code),
        classes(id, name)
      `)
      .eq('school_id', schoolId)
      .eq('is_active', true);

    if (classId) {
      query = query.eq('class_id', classId);
    }

    const { data: assignments, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assignments:', error);
      throw new Error(error.message || 'Failed to fetch assignments');
    }

    if (!assignments) return [];

    // Fetch teacher data for all assignments
    const teacherIds = assignments.map(a => a.teacher_id).filter(Boolean);
    const { data: teachers } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', teacherIds);

    return assignments.map(assignment => ({
      ...assignment,
      subject: assignment.subjects,
      class: assignment.classes,
      teacher: teachers?.find(t => t.id === assignment.teacher_id)
    }));
  }

  static async removeAssignment(assignmentId: string): Promise<void> {
    const { error } = await supabase
      .from('subject_teacher_assignments')
      .update({ is_active: false })
      .eq('id', assignmentId);

    if (error) {
      console.error('Error removing assignment:', error);
      throw new Error(error.message || 'Failed to remove assignment');
    }
  }
}
