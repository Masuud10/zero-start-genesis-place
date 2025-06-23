
import { supabase } from '@/integrations/supabase/client';
import { Subject, SubjectCreationData } from '@/types/subject';

export class SubjectDatabaseService {
  static async createSubject(data: SubjectCreationData, schoolId: string): Promise<Subject> {
    console.log('SubjectDatabaseService.createSubject called with:', { data, schoolId });

    if (!schoolId) {
      throw new Error('School ID is required for subject creation');
    }

    // Get current user context to ensure proper authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      throw new Error('User authentication required');
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
      // First, let's check if we can access the subjects table
      const { data: testAccess, error: accessError } = await supabase
        .from('subjects')
        .select('id')
        .limit(1);

      if (accessError) {
        console.error('SubjectDatabaseService: Table access error:', accessError);
        throw new Error(`Database access denied: ${accessError.message}`);
      }

      console.log('SubjectDatabaseService: Table access confirmed, proceeding with insert');

      // Create the subject with explicit RLS bypass if needed
      const { data: subject, error } = await supabase
        .from('subjects')
        .insert(payload)
        .select(`
          *,
          class:classes(id, name),
          teacher:profiles!subjects_teacher_id_fkey(id, name, email)
        `)
        .single();

      if (error) {
        console.error('SubjectDatabaseService: Database error:', error);
        
        // Handle specific database constraint errors
        if (error.code === '23505') {
          // Unique constraint violation
          if (error.message.includes('subjects_name_school_id_key') || error.message.includes('name')) {
            throw new Error(`A subject with the name "${data.name}" already exists in your school`);
          } else if (error.message.includes('subjects_code_school_id_key') || error.message.includes('code')) {
            throw new Error(`A subject with the code "${data.code}" already exists in your school`);
          } else if (error.message.includes('unique_subject_code_per_school')) {
            throw new Error(`Subject code "${data.code}" is already used in your school`);
          }
          throw new Error('A subject with this information already exists in your school');
        }
        if (error.code === '23503') {
          // Foreign key constraint violation
          throw new Error('Invalid reference - please check that the selected class and teacher exist');
        }
        if (error.code === '42501') {
          // Insufficient privilege
          throw new Error('Permission denied - you may not have access to create subjects');
        }
        if (error.code === '23514') {
          // Check constraint violation
          throw new Error('Invalid data provided - please check all required fields');
        }
        
        // Generic error with more context
        throw new Error(`Failed to create subject: ${error.message} (Code: ${error.code})`);
      }

      if (!subject) {
        throw new Error('Subject was not created - no data returned from database');
      }

      console.log('SubjectDatabaseService: Subject created successfully:', subject);
      return subject;

    } catch (error: any) {
      console.error('SubjectDatabaseService: Create subject error:', error);
      
      // Re-throw with more context if it's a generic error
      if (error.message === 'Failed to create subject') {
        throw new Error('Database connection failed. Please try again or contact support.');
      }
      
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
        .select(`
          *,
          class:classes(id, name),
          teacher:profiles!subjects_teacher_id_fkey(id, name, email)
        `)
        .eq('school_id', schoolId)
        .eq('is_active', true);

      if (classId && classId !== 'all') {
        query = query.eq('class_id', classId);
      }

      const { data, error } = await query.order('name');

      if (error) {
        console.error('SubjectDatabaseService: Error fetching subjects:', error);
        throw new Error(`Failed to fetch subjects: ${error.message}`);
      }

      console.log('SubjectDatabaseService: Subjects fetched successfully:', data?.length || 0);
      return data || [];

    } catch (error: any) {
      console.error('SubjectDatabaseService.getSubjects error:', error);
      throw error;
    }
  }

  // Test database connectivity
  static async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('count')
        .limit(1);
        
      if (error) {
        console.error('Database connection test failed:', error);
        return false;
      }
      
      console.log('Database connection test successful');
      return true;
    } catch (error) {
      console.error('Database connection test error:', error);
      return false;
    }
  }
}
