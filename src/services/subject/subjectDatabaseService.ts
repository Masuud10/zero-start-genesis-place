
import { supabase } from '@/integrations/supabase/client';

export interface SubjectData {
  id?: string;
  name: string;
  code: string;
  description?: string;
  class_id: string;
  teacher_id?: string;
  curriculum_type?: string;
  curriculum?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSubjectResponse {
  success: boolean;
  subject_id?: string;
  error?: string;
  message?: string;
}

/**
 * Creates a new subject in the database
 */
export async function createSubject(data: SubjectData): Promise<CreateSubjectResponse> {
  try {
    const subjectData = {
      name: data.name,
      code: data.code,
      description: data.description,
      class_id: data.class_id,
      teacher_id: data.teacher_id,
      curriculum_type: data.curriculum, // Store in both fields for consistency
      curriculum: data.curriculum,
      is_active: data.is_active ?? true
    };

    const { data: result, error } = await supabase
      .from('subjects')
      .insert([subjectData])
      .select()
      .single();

    if (error) {
      console.error('Error creating subject:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      subject_id: result.id,
      message: 'Subject created successfully'
    };
  } catch (error) {
    console.error('Unexpected error creating subject:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Updates an existing subject in the database
 */
export async function updateSubject(subjectId: string, updates: Partial<SubjectData>): Promise<CreateSubjectResponse> {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .update(updates)
      .eq('id', subjectId)
      .select()
      .single();

    if (error) {
      console.error('Error updating subject:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      subject_id: data.id,
      message: 'Subject updated successfully'
    };
  } catch (error) {
    console.error('Unexpected error updating subject:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Fetches a subject by ID
 */
export async function getSubject(subjectId: string): Promise<SubjectData | null> {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', subjectId)
      .single();

    if (error) {
      console.error('Error fetching subject:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error fetching subject:', error);
    return null;
  }
}

/**
 * Fetches all subjects for a class
 */
export async function getSubjectsByClass(classId: string): Promise<SubjectData[]> {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('class_id', classId)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching subjects:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching subjects:', error);
    return [];
  }
}

/**
 * Deletes a subject by ID
 */
export async function deleteSubject(subjectId: string): Promise<CreateSubjectResponse> {
  try {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', subjectId);

    if (error) {
      console.error('Error deleting subject:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      message: 'Subject deleted successfully'
    };
  } catch (error) {
    console.error('Unexpected error deleting subject:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
