
import { supabase } from '@/integrations/supabase/client';
import { Subject, SubjectCreationData } from '@/types/subject';

export class SubjectDatabaseService {
  static async createSubject(data: SubjectCreationData, schoolId: string): Promise<Subject> {
    console.log('📚 SubjectDatabaseService.createSubject called with:', { data, schoolId });

    if (!schoolId) {
      throw new Error('School ID is required for subject creation');
    }

    // Get current user context to ensure proper authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Authentication error:', authError);
      throw new Error('User authentication required');
    }

    // Prepare the payload with proper data structure and validation
    const payload = {
      name: data.name.trim(),
      code: data.code.trim().toUpperCase(),
      class_id: data.class_id || null,
      teacher_id: data.teacher_id || null,
      curriculum: data.curriculum || 'cbc',
      category: data.category || 'core', 
      credit_hours: data.credit_hours || 1,
      assessment_weight: data.assessment_weight || 100,
      description: data.description?.trim() || null,
      school_id: schoolId,
      is_active: true
    };

    // Validate required fields
    if (!payload.name) {
      throw new Error('Subject name is required');
    }
    if (!payload.code) {
      throw new Error('Subject code is required');
    }
    if (!payload.curriculum) {
      throw new Error('Curriculum type is required');
    }
    if (!payload.category) {
      throw new Error('Subject category is required');
    }
    if (payload.credit_hours < 1) {
      throw new Error('Credit hours must be at least 1');
    }
    if (payload.assessment_weight && (payload.assessment_weight < 1 || payload.assessment_weight > 100)) {
      throw new Error('Assessment weight must be between 1 and 100');
    }

    console.log('📚 SubjectDatabaseService: Creating subject with payload:', payload);

    try {
      // Optimized duplicate check with proper indexing
      const { data: existingSubject, error: duplicateCheckError } = await supabase
        .from('subjects')
        .select('id, code')
        .eq('school_id', schoolId)
        .eq('code', payload.code)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (duplicateCheckError) {
        console.error('❌ Error checking for duplicate subject:', duplicateCheckError);
        throw new Error(`Failed to validate subject uniqueness: ${duplicateCheckError.message}`);
      }

      if (existingSubject) {
        throw new Error(`A subject with code "${payload.code}" already exists in your school`);
      }

      // Create the subject with optimized query
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
        console.error('❌ SubjectDatabaseService: Database error:', error);
        
        // Handle specific database constraint errors
        if (error.code === '23505') {
          // Unique constraint violation
          if (error.message.includes('unique_subject_code_per_school')) {
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

      console.log('✅ SubjectDatabaseService: Subject created successfully:', subject);
      return subject;

    } catch (error: any) {
      console.error('❌ SubjectDatabaseService: Create subject error:', error);
      throw error;
    }
  }

  static async getSubjects(schoolId: string, classId?: string): Promise<Subject[]> {
    console.log('📚 SubjectDatabaseService.getSubjects called with:', { schoolId, classId });

    if (!schoolId || schoolId.trim() === '') {
      console.error('❌ School ID is required and cannot be empty');
      throw new Error('School ID is required');
    }

    try {
      // Test connection first with shorter timeout
      const connectionTest = await this.testConnection();
      if (!connectionTest) {
        console.error('❌ Database connection test failed');
        throw new Error('Database connection failed. Please try again.');
      }

      // Build query with proper validation
      let query = supabase
        .from('subjects')
        .select(`
          *,
          class:classes(id, name),
          teacher:profiles!subjects_teacher_id_fkey(id, name, email)
        `)
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('name')
        .limit(500); // Add reasonable limit

      // Apply class filter if provided and valid
      if (classId && classId !== 'all' && classId.trim() !== '') {
        console.log('📚 SubjectDatabaseService: Filtering by class_id:', classId);
        query = query.eq('class_id', classId);
      }

      console.log('📚 SubjectDatabaseService: Executing query...');
      const { data, error } = await query;

      if (error) {
        console.error('❌ SubjectDatabaseService: Database error:', error);
        
        // Handle specific database errors
        if (error.code === 'PGRST116') {
          console.log('📚 SubjectDatabaseService: No subjects found (PGRST116)');
          return [];
        }
        
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        console.log('📚 SubjectDatabaseService: No data returned from query');
        return [];
      }

      console.log('✅ SubjectDatabaseService: Successfully fetched', data.length, 'subjects');
      return data;

    } catch (error: any) {
      console.error('❌ SubjectDatabaseService.getSubjects error:', error);
      
      // Don't throw errors for empty results - return empty array instead
      if (error.message?.includes('No subjects found') || 
          error.message?.includes('not found') ||
          error.message?.includes('PGRST116')) {
        console.log('📚 SubjectDatabaseService: Returning empty array for "not found" scenario');
        return [];
      }
      
      // Re-throw actual errors
      throw error;
    }
  }

  // Enhanced connection test with better error handling and shorter timeout
  static async testConnection(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // Reduced timeout to 2 seconds
      
      const { data, error } = await supabase
        .from('subjects')
        .select('id')
        .limit(1)
        .abortSignal(controller.signal);
        
      clearTimeout(timeoutId);
      
      if (error) {
        console.error('❌ Database connection test failed:', error);
        return false;
      }
      
      console.log('✅ Database connection test successful');
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('❌ Database connection test timed out');
      } else {
        console.error('❌ Database connection test error:', error);
      }
      return false;
    }
  }
}
