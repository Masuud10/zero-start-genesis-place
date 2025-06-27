
import { supabase } from '@/integrations/supabase/client';
import { SubjectAssignment, CreateAssignmentData } from '@/types/subject';

export class SubjectAssignmentService {
  static async createAssignment(data: CreateAssignmentData, schoolId: string): Promise<SubjectAssignment> {
    console.log('SubjectAssignmentService.createAssignment called with:', { data, schoolId });

    if (!schoolId) {
      throw new Error('School ID is required for assignment creation');
    }

    // Get current user context
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User authentication required');
    }

    try {
      // Check if assignment already exists
      const { data: existing, error: checkError } = await supabase
        .from('subject_teacher_assignments')
        .select('id')
        .eq('school_id', schoolId)
        .eq('subject_id', data.subject_id)
        .eq('teacher_id', data.teacher_id)
        .eq('class_id', data.class_id)
        .eq('is_active', true)
        .maybeSingle();

      if (checkError) {
        throw new Error(`Failed to check existing assignments: ${checkError.message}`);
      }

      if (existing) {
        throw new Error('This teacher is already assigned to this subject for this class');
      }

      // Create the assignment
      const { data: assignment, error } = await supabase
        .from('subject_teacher_assignments')
        .insert({
          school_id: schoolId,
          subject_id: data.subject_id,
          teacher_id: data.teacher_id,
          class_id: data.class_id,
          assigned_by: user.id,
          is_active: true
        })
        .select(`
          *,
          subject:subjects(id, name, code),
          teacher:profiles!subject_teacher_assignments_teacher_id_fkey(id, name, email),
          class:classes(id, name)
        `)
        .single();

      if (error) {
        console.error('SubjectAssignmentService: Database error:', error);
        throw new Error(`Failed to create assignment: ${error.message}`);
      }

      if (!assignment) {
        throw new Error('Assignment was not created - no data returned');
      }

      console.log('SubjectAssignmentService: Assignment created successfully');
      return assignment;

    } catch (error: any) {
      console.error('SubjectAssignmentService.createAssignment error:', error);
      throw error;
    }
  }

  static async getAssignments(schoolId: string, classId?: string): Promise<SubjectAssignment[]> {
    console.log('SubjectAssignmentService.getAssignments called with:', { schoolId, classId });

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

      const { data, error } = await query.order('assigned_at', { ascending: false });

      if (error) {
        console.error('SubjectAssignmentService: Error fetching assignments:', error);
        throw new Error(`Failed to fetch assignments: ${error.message}`);
      }

      console.log('SubjectAssignmentService: Assignments fetched successfully:', data?.length || 0);
      return data || [];

    } catch (error: any) {
      console.error('SubjectAssignmentService.getAssignments error:', error);
      throw error;
    }
  }

  static async removeAssignment(assignmentId: string): Promise<void> {
    console.log('SubjectAssignmentService.removeAssignment called with:', assignmentId);

    try {
      const { error } = await supabase
        .from('subject_teacher_assignments')
        .update({ is_active: false })
        .eq('id', assignmentId);

      if (error) {
        console.error('SubjectAssignmentService: Error removing assignment:', error);
        throw new Error(`Failed to remove assignment: ${error.message}`);
      }

      console.log('SubjectAssignmentService: Assignment removed successfully');

    } catch (error: any) {
      console.error('SubjectAssignmentService.removeAssignment error:', error);
      throw error;
    }
  }
}
