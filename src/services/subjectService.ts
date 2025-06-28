
import { supabase } from '@/integrations/supabase/client';
import { Subject, SubjectCreationData } from '@/types/subject';

export class SubjectService {
  private static readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private static readonly CONNECTION_TIMEOUT = 5000; // 5 seconds

  static async getSubjects(schoolId: string, classId?: string): Promise<Subject[]> {
    try {
      console.log('📚 SubjectService: Fetching subjects for school:', schoolId, 'class:', classId);

      // Test connection first with timeout
      const connectionTest = await this.testConnectionWithTimeout();
      if (!connectionTest) {
        throw new Error('Database connection failed. Please check your network connection.');
      }

      let query = supabase
        .from('subjects')
        .select('*')
        .eq('school_id', schoolId)
        .order('name', { ascending: true })
        .limit(100); // Reasonable limit to prevent timeout

      // Apply class filter if provided
      if (classId && classId !== 'all') {
        query = query.eq('class_id', classId);
      }

      const result = await this.executeWithTimeout(query, this.DEFAULT_TIMEOUT);

      if (result.error) {
        console.error('❌ Error fetching subjects:', result.error);
        throw new Error(`Failed to fetch subjects: ${result.error.message}`);
      }

      if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
        console.log('📚 SubjectService: No subjects found');
        return [];
      }

      // CRITICAL FIX: Normalize curriculum field to lowercase to fix data inconsistency
      const normalizedData = result.data.map((subject: any) => ({
        ...subject,
        curriculum: subject.curriculum?.toLowerCase() || 'cbc'
      })) as Subject[];

      console.log('✅ SubjectService: Successfully fetched', normalizedData.length, 'subjects');
      return normalizedData;

    } catch (error: any) {
      console.error('❌ SubjectService: Critical error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw new Error(error.message || 'Failed to fetch subjects');
    }
  }

  static async createSubject(subjectData: SubjectCreationData, schoolId: string): Promise<Subject> {
    try {
      console.log('📚 SubjectService: Creating subject:', subjectData);

      const query = supabase
        .from('subjects')
        .insert({
          ...subjectData,
          school_id: schoolId,
          curriculum: subjectData.curriculum?.toLowerCase() || 'cbc', // Normalize curriculum
          category: subjectData.category || 'core',
          credit_hours: subjectData.credit_hours || 1,
          assessment_weight: subjectData.assessment_weight || 100,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      const result = await this.executeWithTimeout(query, this.DEFAULT_TIMEOUT);

      if (result.error) {
        console.error('❌ Error creating subject:', result.error);
        throw new Error(`Failed to create subject: ${result.error.message}`);
      }

      console.log('✅ SubjectService: Subject created successfully');
      return result.data as Subject;

    } catch (error: any) {
      console.error('❌ SubjectService: Critical error creating subject:', error);
      if (error.name === 'AbortError') {
        throw new Error('Create request timed out. Please try again.');
      }
      throw new Error(error.message || 'Failed to create subject');
    }
  }

  static async updateSubject(id: string, updates: Partial<Subject>): Promise<Subject> {
    try {
      console.log('📚 SubjectService: Updating subject:', id);

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Normalize curriculum if it's being updated
      if (updateData.curriculum) {
        updateData.curriculum = updateData.curriculum.toLowerCase();
      }

      const query = supabase
        .from('subjects')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      const result = await this.executeWithTimeout(query, this.DEFAULT_TIMEOUT);

      if (result.error) {
        console.error('❌ Error updating subject:', result.error);
        throw new Error(`Failed to update subject: ${result.error.message}`);
      }

      console.log('✅ SubjectService: Subject updated successfully');
      return result.data as Subject;

    } catch (error: any) {
      console.error('❌ SubjectService: Critical error updating subject:', error);
      if (error.name === 'AbortError') {
        throw new Error('Update request timed out. Please try again.');
      }
      throw new Error(error.message || 'Failed to update subject');
    }
  }

  static async deleteSubject(id: string): Promise<void> {
    try {
      console.log('📚 SubjectService: Deleting subject:', id);

      const query = supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      const result = await this.executeWithTimeout(query, this.DEFAULT_TIMEOUT);

      if (result.error) {
        console.error('❌ Error deleting subject:', result.error);
        throw new Error(`Failed to delete subject: ${result.error.message}`);
      }

      console.log('✅ SubjectService: Subject deleted successfully');

    } catch (error: any) {
      console.error('❌ SubjectService: Critical error deleting subject:', error);
      if (error.name === 'AbortError') {
        throw new Error('Delete request timed out. Please try again.');
      }
      throw new Error(error.message || 'Failed to delete subject');
    }
  }

  // NEW: Execute query with timeout
  private static async executeWithTimeout<T>(query: any, timeoutMs: number): Promise<{ data: T | null; error: any }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log(`⏰ Query timeout after ${timeoutMs}ms`);
      controller.abort();
    }, timeoutMs);

    try {
      const result = await query.abortSignal(controller.signal);
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Enhanced connection test with better timeout handling
  static async testConnectionWithTimeout(): Promise<boolean> {
    try {
      console.log('🔍 SubjectService: Testing database connection...');
      
      const query = supabase
        .from('subjects')
        .select('id')
        .limit(1);
        
      const result = await this.executeWithTimeout(query, this.CONNECTION_TIMEOUT);
      
      if (result.error) {
        console.error('❌ Database connection test failed:', result.error);
        return false;
      }
      
      console.log('✅ Database connection test successful');
      return true;
    } catch (error) {
      if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
        console.error('❌ Database connection test timed out');
      } else {
        console.error('❌ Database connection test error:', error);
      }
      return false;
    }
  }

  // Keep existing testConnection for backward compatibility
  static async testConnection(): Promise<boolean> {
    return this.testConnectionWithTimeout();
  }
}
