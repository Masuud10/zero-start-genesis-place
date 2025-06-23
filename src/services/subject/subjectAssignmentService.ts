
import { supabase } from '@/integrations/supabase/client';
import { SubjectAssignment, CreateAssignmentData } from '@/types/subject';

export class SubjectAssignmentService {
  static async createAssignment(data: CreateAssignmentData, schoolId: string): Promise<SubjectAssignment> {
    console.log('SubjectAssignmentService.createAssignment called with:', { data, schoolId });

    if (!schoolId) {
      throw new Error('School ID is required');
    }

    // Validate required fields
    if (!data.subject_id || !data.teacher_id || !data.class_id) {
      throw new Error('Subject, teacher, and class are all required');
    }

    try {
      // Check for existing assignment
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
        console.error('Error checking for existing assignment:', checkError);
        throw new Error('Failed to validate assignment: ' + checkError.message);
      }

      if (existing) {
        throw new Error('This teacher is already assigned to this subject for this class');
      }

      const payload = {
        ...data,
        school_id: schoolId,
        is_active: true
      };

      console.log('Creating assignment with payload:', payload);

      const { data: assignment, error } = await supabase
        .from('subject_teacher_assignments')
        .insert(payload)
        .select(`
          *,
          subject:subjects(id, name, code),
          class:classes(id, name)
        `)
        .single();

      if (error) {
        console.error('Assignment creation error:', error);
        
        // Handle specific database errors
        if (error.code === '23505') {
          throw new Error('This assignment already exists');
        }
        if (error.code === '23503') {
          throw new Error('Invalid reference - check that subject, teacher, and class exist');
        }
        if (error.code === '42501') {
          throw new Error('Permission denied - you may not have access to create assignments');
        }
        
        throw new Error(error.message || 'Failed to create assignment');
      }

      // Fetch teacher data separately
      const { data: teacher, error: teacherError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('id', data.teacher_id)
        .single();

      if (teacherError) {
        console.error('Error fetching teacher data:', teacherError);
      }

      const result = {
        ...assignment,
        subject: assignment.subject,
        class: assignment.class,
        teacher: teacher || { id: data.teacher_id, name: 'Unknown Teacher', email: '' }
      };

      console.log('Assignment created successfully:', result);
      return result;

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
          class:classes(id, name)
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

      const result = assignments.map(assignment => ({
        ...assignment,
        subject: assignment.subject,
        class: assignment.class,
        teacher: teachers?.find(t => t.id === assignment.teacher_id) || { 
          id: assignment.teacher_id, 
          name: 'Unknown Teacher', 
          email: '' 
        }
      }));

      console.log('Assignments fetched successfully:', result.length);
      return result;

    } catch (error: any) {
      console.error('SubjectAssignmentService.getAssignments error:', error);
      throw error;
    }
  }

  static async removeAssignment(assignmentId: string): Promise<void> {
    console.log('SubjectAssignmentService.removeAssignment called with:', assignmentId);

    if (!assignmentId) {
      throw new Error('Assignment ID is required');
    }

    try {
      const { error } = await supabase
        .from('subject_teacher_assignments')
        .update({ is_active: false })
        .eq('id', assignmentId);

      if (error) {
        console.error('Error removing assignment:', error);
        throw new Error(error.message || 'Failed to remove assignment');
      }

      console.log('Assignment removed successfully');

    } catch (error: any) {
      console.error('SubjectAssignmentService.removeAssignment error:', error);
      throw error;
    }
  }
}
