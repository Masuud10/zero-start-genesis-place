
import { supabase } from '@/integrations/supabase/client';
import { Subject, NewSubjectFormData } from '@/types/subject';

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
        class: item.class && typeof item.class === 'object' && 'id' in item.class ? {
          id: item.class.id,
          name: item.class.name
        } : undefined,
        teacher: item.teacher && typeof item.teacher === 'object' && 'id' in item.teacher ? {
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

  static async createSubject(schoolId: string, subjectData: NewSubjectFormData): Promise<Subject> {
    console.log('📚 SubjectDatabaseService.createSubject called with:', { schoolId, subjectData });

    if (!schoolId || schoolId.trim() === '') {
      console.error('❌ School ID is required and cannot be empty');
      throw new Error('School ID is required');
    }

    try {
      // Test connection first
      const connectionTest = await this.testConnection();
      if (!connectionTest) {
        console.error('❌ Database connection test failed');
        throw new Error('Database connection failed. Please try again.');
      }

      // Validate subject data
      if (!subjectData.name?.trim()) {
        throw new Error('Subject name is required');
      }
      
      if (!subjectData.code?.trim()) {
        throw new Error('Subject code is required');
      }

      // Format and validate the code
      const formattedCode = subjectData.code.trim().toUpperCase();
      if (!/^[A-Z0-9]+$/.test(formattedCode)) {
        throw new Error('Subject code must contain only uppercase letters and numbers');
      }

      // Check for duplicate subject code within the school
      const { data: existingCodeSubject, error: duplicateCodeError } = await supabase
        .from('subjects')
        .select('id, code')
        .eq('school_id', schoolId)
        .eq('code', formattedCode)
        .eq('is_active', true)
        .maybeSingle();

      if (duplicateCodeError && duplicateCodeError.code !== 'PGRST116') {
        console.error('❌ Error checking for duplicate subject code:', duplicateCodeError);
        throw new Error('Failed to validate subject code uniqueness');
      }

      if (existingCodeSubject) {
        throw new Error(`A subject with code "${formattedCode}" already exists in your school.`);
      }

      // Check for duplicate subject name within the school (case-insensitive)
      const { data: existingNameSubject, error: duplicateNameError } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('school_id', schoolId)
        .ilike('name', subjectData.name.trim())
        .eq('is_active', true)
        .maybeSingle();

      if (duplicateNameError && duplicateNameError.code !== 'PGRST116') {
        console.error('❌ Error checking for duplicate subject name:', duplicateNameError);
        throw new Error('Failed to validate subject name uniqueness');
      }

      if (existingNameSubject) {
        throw new Error(`A subject with name "${subjectData.name.trim()}" already exists in your school.`);
      }

      // Validate class and teacher references if provided
      if (subjectData.class_id) {
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('id, school_id')
          .eq('id', subjectData.class_id)
          .eq('school_id', schoolId)
          .single();

        if (classError || !classData) {
          throw new Error('Selected class does not exist or does not belong to your school');
        }
      }

      if (subjectData.teacher_id) {
        const { data: teacherData, error: teacherError } = await supabase
          .from('profiles')
          .select('id, school_id, role')
          .eq('id', subjectData.teacher_id)
          .eq('school_id', schoolId)
          .eq('role', 'teacher')
          .single();

        if (teacherError || !teacherData) {
          throw new Error('Selected teacher does not exist or does not belong to your school');
        }
      }

      // Prepare subject data for insertion
      const insertData = {
        name: subjectData.name.trim(),
        code: formattedCode,
        curriculum: subjectData.curriculum,
        category: subjectData.category,
        class_id: subjectData.class_id || null,
        teacher_id: subjectData.teacher_id || null,
        credit_hours: subjectData.credit_hours,
        assessment_weight: subjectData.assessment_weight,
        description: subjectData.description?.trim() || null,
        is_active: subjectData.is_active,
        school_id: schoolId
      };

      console.log('📚 SubjectDatabaseService: Inserting subject data:', insertData);

      // Insert the new subject
      const { data: newSubject, error: insertError } = await supabase
        .from('subjects')
        .insert(insertData)
        .select(`
          *,
          class:classes!subjects_class_id_fkey(id, name),
          teacher:profiles!subjects_teacher_id_fkey(id, name, email)
        `)
        .single();

      if (insertError) {
        console.error('❌ Error creating subject:', insertError);
        
        // Handle specific database errors
        if (insertError.code === '23505') {
          throw new Error('A subject with this code already exists in your school.');
        } else if (insertError.code === '23503') {
          throw new Error('Please check that the selected class and teacher exist.');
        } else {
          throw new Error(insertError.message || 'Failed to create subject. Please try again.');
        }
      }

      // Transform the response to match Subject interface
      const transformedSubject: Subject = {
        id: newSubject.id,
        name: newSubject.name,
        code: newSubject.code,
        school_id: newSubject.school_id,
        class_id: newSubject.class_id,
        teacher_id: newSubject.teacher_id,
        curriculum: newSubject.curriculum,
        category: newSubject.category,
        credit_hours: newSubject.credit_hours,
        assessment_weight: newSubject.assessment_weight,
        prerequisites: newSubject.prerequisites,
        description: newSubject.description,
        is_active: newSubject.is_active,
        created_at: newSubject.created_at,
        updated_at: newSubject.updated_at,
        class: newSubject.class && typeof newSubject.class === 'object' && 'id' in newSubject.class ? {
          id: newSubject.class.id,
          name: newSubject.class.name
        } : undefined,
        teacher: newSubject.teacher && typeof newSubject.teacher === 'object' && 'id' in newSubject.teacher ? {
          id: newSubject.teacher.id,
          name: newSubject.teacher.name,
          email: newSubject.teacher.email
        } : undefined
      };

      console.log('✅ SubjectDatabaseService: Subject created successfully:', transformedSubject);
      return transformedSubject;

    } catch (error: any) {
      console.error('❌ SubjectDatabaseService.createSubject error:', error);
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
