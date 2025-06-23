
import { supabase } from '@/integrations/supabase/client';
import { SubjectAssignment, CreateAssignmentData } from '@/types/subject';

export class SubjectAssignmentService {
  static async createAssignment(data: CreateAssignmentData, schoolId: string): Promise<SubjectAssignment> {
    const payload = {
      subject_id: data.subject_id,
      teacher_id: data.teacher_id,
      class_id: data.class_id,
      school_id: schoolId,
      assigned_by: (await supabase.auth.getUser()).data.user?.id,
      assigned_at: new Date().toISOString(),
      is_active: true
    };

    console.log('Creating subject assignment with payload:', payload);

    const { data: assignment, error } = await supabase
      .from('subject_teacher_assignments')
      .insert(payload)
      .select(`
        *,
        subject:subjects(id, name, code),
        teacher:profiles!subject_teacher_assignments_teacher_id_fkey(id, name, email),
        class:classes(id, name)
      `)
      .single();

    if (error) {
      console.error('Assignment creation error:', error);
      
      if (error.code === '23505') {
        throw new Error('This teacher is already assigned to this subject and class');
      }
      if (error.code === '23503') {
        throw new Error('Invalid reference - check that subject, teacher, and class exist');
      }
      
      throw new Error(error.message || 'Failed to create assignment');
    }

    console.log('Assignment created successfully:', assignment);
    return assignment;
  }

  static async getAssignments(schoolId: string, classId?: string): Promise<SubjectAssignment[]> {
    if (!schoolId) {
      throw new Error('School ID is required');
    }

    try {
      let query = supabase
        .from('subject_teacher_assignments')
        .select(`
          *,
          subject:subjects(id, name, code),
          teacher:profiles!subject_teacher_assignments_teacher_id_fkey(id, name, email),
          class:classes(id, name)
        `)
        .eq('school_id', schoolId)
        .eq('is_active', true);

      if (classId && classId !== 'all') {
        query = query.eq('class_id', classId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching assignments:', error);
        throw new Error(error.message || 'Failed to fetch assignments');
      }

      console.log('Assignments fetched successfully:', data?.length || 0);
      return data || [];

    } catch (error: any) {
      console.error('SubjectAssignmentService.getAssignments error:', error);
      throw error;
    }
  }

  static async removeAssignment(assignmentId: string): Promise<void> {
    const { error } = await supabase
      .from('subject_teacher_assignments')
      .update({ is_active: false })
      .eq('id', assignmentId);

    if (error) {
      console.error('Assignment removal error:', error);
      throw new Error(error.message || 'Failed to remove assignment');
    }

    console.log('Assignment removed successfully');
  }
}
