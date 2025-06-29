
import { supabase } from '@/integrations/supabase/client';
import { Subject } from '@/types/subject';

export class SubjectDatabaseService {
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
          class:classes!subjects_class_id_fkey(id, name),
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

      // Transform the data to match the Subject interface
      const transformedData: Subject[] = data.map(item => ({
        id: item.id,
        name: item.name,
        code: item.code,
        school_id: item.school_id,
        class_id: item.class_id,
        teacher_id: item.teacher_id,
        curriculum: item.curriculum,
        category: item.category,
        credit_hours: item.credit_hours,
        assessment_weight: item.assessment_weight,
        prerequisites: item.prerequisites,
        description: item.description,
        is_active: item.is_active,
        created_at: item.created_at,
        updated_at: item.updated_at,
        class: item.class ? {
          id: item.class.id,
          name: item.class.name
        } : undefined,
        teacher: item.teacher ? {
          id: item.teacher.id,
          name: item.teacher.name,
          email: item.teacher.email
        } : undefined
      }));

      console.log('✅ SubjectDatabaseService: Successfully fetched', transformedData.length, 'subjects');
      return transformedData;

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
