
import { supabase } from '@/integrations/supabase/client';
import { Subject, SubjectCreationData } from '@/types/subject';

export class SubjectDatabaseService {
  static async createSubject(data: SubjectCreationData, schoolId: string): Promise<Subject> {
    console.log('SubjectDatabaseService.createSubject called with:', { data, schoolId });

    if (!schoolId) {
      throw new Error('School ID is required for subject creation');
    }

    // Prepare the payload with proper data structure
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

    console.log('SubjectDatabaseService: Creating subject with payload:', payload);

    try {
      const { data: subject, error } = await supabase
        .from('subjects')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error('SubjectDatabaseService: Database error:', error);
        
        // Handle specific database constraint errors
        if (error.code === '23505') {
          if (error.message.includes('subjects_name_school_id_key')) {
            throw new Error('A subject with this name already exists in your school');
          } else if (error.message.includes('subjects_code_school_id_key')) {
            throw new Error('A subject with this code already exists in your school');
          }
          throw new Error('A subject with this information already exists');
        }
        if (error.code === '23503') {
          throw new Error('Invalid reference - check that class and teacher exist');
        }
        if (error.code === '42501') {
          throw new Error('Permission denied - you may not have access to create subjects');
        }
        
        throw new Error(error.message || 'Failed to create subject');
      }

      if (!subject) {
        throw new Error('Subject was not created - no data returned');
      }

      console.log('SubjectDatabaseService: Subject created successfully:', subject);
      return subject;

    } catch (error: any) {
      console.error('SubjectDatabaseService: Create subject error:', error);
      throw error;
    }
  }

  static async getSubjects(schoolId: string, classId?: string): Promise<Subject[]> {
    console.log('SubjectDatabaseService.getSubjects called with:', { schoolId, classId });

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
        console.error('SubjectDatabaseService: Error fetching subjects:', error);
        throw new Error(error.message || 'Failed to fetch subjects');
      }

      console.log('SubjectDatabaseService: Subjects fetched successfully:', data?.length || 0);
      return data || [];

    } catch (error: any) {
      console.error('SubjectDatabaseService.getSubjects error:', error);
      throw error;
    }
  }
}
