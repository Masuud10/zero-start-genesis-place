
import { supabase } from '@/integrations/supabase/client';
import { NewSubjectFormData } from '@/types/subject';

export class SubjectDatabaseService {
  static async createSubject(schoolId: string, data: NewSubjectFormData) {
    if (!schoolId) {
      throw new Error('School ID is required to create a subject');
    }

    // Prepare the subject data for database insertion
    const subjectData = {
      name: data.name.trim(),
      code: data.code.toUpperCase().trim(),
      school_id: schoolId,
      curriculum: data.curriculum, // CBC or IGCSE
      curriculum_type: data.curriculum, // Store in both fields for consistency
      category: data.category,
      class_id: data.class_id || null,
      teacher_id: data.teacher_id || null,
      credit_hours: data.credit_hours,
      assessment_weight: data.assessment_weight,
      prerequisites: data.prerequisites || null,
      description: data.description?.trim() || null,
      is_active: data.is_active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert the subject into the database
    const { data: insertedSubject, error } = await supabase
      .from('subjects')
      .insert([subjectData])
      .select()
      .single();

    if (error) {
      console.error('Database error creating subject:', error);
      throw new Error(`Failed to create subject: ${error.message}`);
    }

    return insertedSubject;
  }

  static async updateSubject(subjectId: string, data: Partial<NewSubjectFormData>) {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    };

    const { data: updatedSubject, error } = await supabase
      .from('subjects')
      .update(updateData)
      .eq('id', subjectId)
      .select()
      .single();

    if (error) {
      console.error('Database error updating subject:', error);
      throw new Error(`Failed to update subject: ${error.message}`);
    }

    return updatedSubject;
  }

  static async getSubjectsBySchool(schoolId: string, options?: {
    curriculum?: string;
    classId?: string;
    isActive?: boolean;
  }) {
    let query = supabase
      .from('subjects')
      .select(`
        *,
        class:classes(id, name),
        teacher:profiles(id, name, email)
      `)
      .eq('school_id', schoolId);

    if (options?.curriculum) {
      query = query.eq('curriculum', options.curriculum);
    }

    if (options?.classId) {
      query = query.eq('class_id', options.classId);
    }

    if (options?.isActive !== undefined) {
      query = query.eq('is_active', options.isActive);
    }

    query = query.order('name');

    const { data, error } = await query;

    if (error) {
      console.error('Database error fetching subjects:', error);
      throw new Error(`Failed to fetch subjects: ${error.message}`);
    }

    return data || [];
  }

  static async deleteSubject(subjectId: string) {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', subjectId);

    if (error) {
      console.error('Database error deleting subject:', error);
      throw new Error(`Failed to delete subject: ${error.message}`);
    }

    return true;
  }
}
