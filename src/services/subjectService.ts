import { supabase } from '@/integrations/supabase/client';
import { Subject } from '@/types/subject';
import { PostgrestError } from '@supabase/supabase-js';

interface SubjectData extends Subject {
  curriculum: string;
}

interface QueryResult<T> {
  data: T | null;
  error: PostgrestError | null;
}

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
      const normalizedData = result.data.map((subject: SubjectData) => ({
        ...subject,
        curriculum: subject.curriculum?.toLowerCase() || 'cbc'
      })) as Subject[];

      console.log('✅ SubjectService: Successfully fetched', normalizedData.length, 'subjects');
      return normalizedData;

    } catch (error) {
      console.error('❌ SubjectService: Critical error:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch subjects');
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

    } catch (error) {
      console.error('❌ SubjectService: Critical error updating subject:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Update request timed out. Please try again.');
      }
      throw new Error(error instanceof Error ? error.message : 'Failed to update subject');
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

    } catch (error) {
      console.error('❌ SubjectService: Critical error deleting subject:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Delete request timed out. Please try again.');
      }
      throw new Error(error instanceof Error ? error.message : 'Failed to delete subject');
    }
  }

  // NEW: Execute query with timeout
  private static async executeWithTimeout<T>(query: unknown, timeoutMs: number): Promise<QueryResult<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log(`⏰ Query timeout after ${timeoutMs}ms`);
      controller.abort();
    }, timeoutMs);

    try {
      const result = await (query as { abortSignal: (signal: AbortSignal) => Promise<QueryResult<T>> }).abortSignal(controller.signal);
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
      if (error instanceof Error && error.name === 'AbortError') {
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
