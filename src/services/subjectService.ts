
import { supabase } from '@/integrations/supabase/client';
import { Subject, SubjectCreationData, SubjectAssignment, CreateAssignmentData } from '@/types/subject';

export class SubjectService {
  static async createSubject(data: SubjectCreationData, schoolId: string): Promise<Subject> {
    console.log('SubjectService.createSubject called with:', { data, schoolId });

    // Validate required fields
    if (!data.name?.trim()) {
      throw new Error('Subject name is required');
    }
    
    if (!data.code?.trim()) {
      throw new Error('Subject code is required');
    }

    if (!schoolId) {
      throw new Error('School ID is required');
    }

    // Format and validate the code
    const formattedCode = data.code.trim().toUpperCase();
    if (!/^[A-Z0-9]+$/.test(formattedCode)) {
      throw new Error('Subject code must contain only uppercase letters and numbers');
    }

    try {
      // Check for duplicate code within the school
      const { data: existing, error: checkError } = await supabase
        .from('subjects')
        .select('id')
        .eq('school_id', schoolId)
        .eq('code', formattedCode)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking for duplicate subject code:', checkError);
        throw new Error('Failed to validate subject code: ' + checkError.message);
      }

      if (existing) {
        throw new Error(`Subject with code "${formattedCode}" already exists in your school`);
      }

      // Validate class and teacher if provided
      if (data.class_id) {
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('id')
          .eq('id', data.class_id)
          .eq('school_id', schoolId)
          .maybeSingle();

        if (classError) {
          console.error('Error validating class:', classError);
          throw new Error('Failed to validate class: ' + classError.message);
        }

        if (!classData) {
          throw new Error('Selected class does not exist or does not belong to your school');
        }
      }

      if (data.teacher_id) {
        const { data: teacherData, error: teacherError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.teacher_id)
          .eq('school_id', schoolId)
          .eq('role', 'teacher')
          .maybeSingle();

        if (teacherError) {
          console.error('Error validating teacher:', teacherError);
          throw new Error('Failed to validate teacher: ' + teacherError.message);
        }

        if (!teacherData) {
          throw new Error('Selected teacher does not exist or does not belong to your school');
        }
      }

      // Prepare the payload with proper validation
      const payload = {
        name: data.name.trim(),
        code: formattedCode,
        class_id: data.class_id || null,
        teacher_id: data.teacher_id || null,
        curriculum: data.curriculum || 'cbc',
        category: data.category || 'core',
        credit_hours: data.credit_hours || 1,
        description: data.description?.trim() || null,
        school_id: schoolId,
        is_active: true
      };

      console.log('Creating subject with payload:', payload);

      const { data: subject, error } = await supabase
        .from('subjects')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error('Subject creation error:', error);
        
        // Handle specific database errors
        if (error.code === '23505') {
          throw new Error('A subject with this code already exists');
        }
        if (error.code === '23503') {
          throw new Error('Invalid reference - check that class and teacher exist');
        }
        if (error.code === '42501') {
          throw new Error('Permission denied - you may not have access to create subjects');
        }
        
        throw new Error(error.message || 'Failed to create subject');
      }

      console.log('Subject created successfully:', subject);
      return subject;

    } catch (error: any) {
      console.error('SubjectService.createSubject error:', error);
      throw error;
    }
  }

  static async getSubjects(schoolId: string, classId?: string): Promise<Subject[]> {
    console.log('SubjectService.getSubjects called with:', { schoolId, classId });

    if (!schoolId) {
      throw new Error('School ID is required');
    }

    try {
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

      console.log('Subjects fetched successfully:', data?.length || 0);
      return data || [];

    } catch (error: any) {
      console.error('SubjectService.getSubjects error:', error);
      throw error;
    }
  }

  static async createAssignment(data: CreateAssignmentData, schoolId: string): Promise<SubjectAssignment> {
    console.log('SubjectService.createAssignment called with:', { data, schoolId });

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
      console.error('SubjectService.createAssignment error:', error);
      throw error;
    }
  }

  static async getAssignments(schoolId: string, classId?: string): Promise<SubjectAssignment[]> {
    console.log('SubjectService.getAssignments called with:', { schoolId, classId });

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
      console.error('SubjectService.getAssignments error:', error);
      throw error;
    }
  }

  static async removeAssignment(assignmentId: string): Promise<void> {
    console.log('SubjectService.removeAssignment called with:', assignmentId);

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
      console.error('SubjectService.removeAssignment error:', error);
      throw error;
    }
  }
}
