
import { supabase } from '@/integrations/supabase/client';

export interface Subject {
  id: string;
  name: string;
  code: string;
  class_id: string | null;
  teacher_id: string | null;
  school_id: string;
  curriculum: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export class SubjectService {
  static async getSubjects(schoolId: string, classId?: string): Promise<Subject[]> {
    try {
      console.log('📚 SubjectService: Fetching subjects for school:', schoolId, 'class:', classId);

      // Test connection first with timeout
      const connectionTest = await this.testConnection();
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

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching subjects:', error);
        throw new Error(`Failed to fetch subjects: ${error.message}`);
      }

      if (!data || data.length === 0) {
        console.log('📚 SubjectService: No subjects found');
        return [];
      }

      console.log('✅ SubjectService: Successfully fetched', data.length, 'subjects');
      return data as Subject[];

    } catch (error: any) {
      console.error('❌ SubjectService: Critical error:', error);
      throw new Error(error.message || 'Failed to fetch subjects');
    }
  }

  static async createSubject(subjectData: {
    name: string;
    code: string;
    school_id: string;
    class_id?: string;
    teacher_id?: string;
    curriculum?: string;
    category?: string;
  }): Promise<Subject> {
    try {
      console.log('📚 SubjectService: Creating subject:', subjectData);

      const { data, error } = await supabase
        .from('subjects')
        .insert({
          ...subjectData,
          curriculum: subjectData.curriculum || 'CBC',
          category: subjectData.category || 'Core',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating subject:', error);
        throw new Error(`Failed to create subject: ${error.message}`);
      }

      console.log('✅ SubjectService: Subject created successfully');
      return data as Subject;

    } catch (error: any) {
      console.error('❌ SubjectService: Critical error creating subject:', error);
      throw new Error(error.message || 'Failed to create subject');
    }
  }

  static async updateSubject(id: string, updates: Partial<Subject>): Promise<Subject> {
    try {
      console.log('📚 SubjectService: Updating subject:', id);

      const { data, error } = await supabase
        .from('subjects')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating subject:', error);
        throw new Error(`Failed to update subject: ${error.message}`);
      }

      console.log('✅ SubjectService: Subject updated successfully');
      return data as Subject;

    } catch (error: any) {
      console.error('❌ SubjectService: Critical error updating subject:', error);
      throw new Error(error.message || 'Failed to update subject');
    }
  }

  static async deleteSubject(id: string): Promise<void> {
    try {
      console.log('📚 SubjectService: Deleting subject:', id);

      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting subject:', error);
        throw new Error(`Failed to delete subject: ${error.message}`);
      }

      console.log('✅ SubjectService: Subject deleted successfully');

    } catch (error: any) {
      console.error('❌ SubjectService: Critical error deleting subject:', error);
      throw new Error(error.message || 'Failed to delete subject');
    }
  }

  // Enhanced connection test with better error handling and timeout
  static async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 SubjectService: Testing database connection...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ Connection test timeout after 3 seconds');
        controller.abort();
      }, 3000); // 3 second timeout
      
      const { error } = await supabase
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
      if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
        console.error('❌ Database connection test timed out');
      } else {
        console.error('❌ Database connection test error:', error);
      }
      return false;
    }
  }
}
