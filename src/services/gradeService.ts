import { DataServiceCore } from './core/dataServiceCore';
import { supabase } from '@/integrations/supabase/client';

interface DatabaseGradeInsert {
  student_id: string;
  subject_id: string;
  class_id: string;
  school_id: string;
  score: number;
  max_score: number;
  percentage?: number;
  position?: number;
  term: string;
  exam_type?: string;
  academic_year?: string;
  submitted_by?: string;
  submitted_at?: string;
  status?: 'draft' | 'submitted' | 'approved' | 'released';
  reviewed_by?: string;
  reviewed_at?: string;
  comments?: string;
  is_released?: boolean;
  is_immutable?: boolean;
}

export interface GradeData {
  id: string;
  student_id: string;
  subject_id: string;
  class_id: string;
  score: number;
  max_score: number;
  percentage: number;
  position?: number;
  term: string;
  exam_type: string;
  academic_year?: string;
  submitted_by: string;
  submitted_at: string;
  status: 'draft' | 'submitted' | 'approved' | 'released';
  reviewed_by?: string;
  reviewed_at?: string;
  comments?: string;
  is_released: boolean;
  is_immutable: boolean;
  created_at: string;
  updated_at: string;
}

export class GradeService {
  static async createGrade(gradeData: Partial<GradeData>) {
    // Validate required fields
    if (!gradeData.student_id || !gradeData.subject_id || !gradeData.class_id || !gradeData.term || !gradeData.exam_type) {
      throw new Error("Missing required grade data: student_id, subject_id, class_id, term, and exam_type are required");
    }

    if (!gradeData.class_id) {
      throw new Error("class_id is required to create a grade");
    }

    // Check for existing grade with same criteria
    const { data: existingGrades, error: checkError } = await supabase
      .from('grades')
      .select('id, status, submitted_by')
      .eq('student_id', gradeData.student_id!)
      .eq('subject_id', gradeData.subject_id!)
      .eq('class_id', gradeData.class_id!)
      .eq('term', gradeData.term!)
      .eq('exam_type', gradeData.exam_type!)
      .eq('academic_year', gradeData.academic_year || new Date().getFullYear().toString());

    if (checkError) {
      console.error('Error checking existing grades:', checkError);
    }

    if (existingGrades && existingGrades.length > 0) {
      const existingGrade = existingGrades[0];
      // If grade exists and is not draft, prevent duplicate
      if (existingGrade.status !== 'draft') {
        throw new Error(`A ${gradeData.exam_type} grade for this student has already been submitted and cannot be duplicated`);
      }
    }

    const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('school_id')
        .eq('id', gradeData.class_id)
        .maybeSingle();
    
    if (classError) throw classError;
    if (!classData?.school_id) throw new Error("Could not find school for the class");

    const dbData: DatabaseGradeInsert = {
      student_id: gradeData.student_id!,
      subject_id: gradeData.subject_id!,
      class_id: gradeData.class_id!,
      school_id: classData.school_id,
      score: gradeData.score!,
      max_score: gradeData.max_score!,
      percentage: gradeData.percentage,
      position: gradeData.position,
      term: gradeData.term!,
      exam_type: gradeData.exam_type,
      academic_year: gradeData.academic_year || new Date().getFullYear().toString(),
      submitted_by: gradeData.submitted_by,
      submitted_at: gradeData.submitted_at,
      status: gradeData.status || 'draft',
      reviewed_by: gradeData.reviewed_by,
      reviewed_at: gradeData.reviewed_at,
      comments: gradeData.comments,
      is_released: gradeData.is_released ?? false,
      is_immutable: gradeData.is_immutable ?? false
    };

    try {
      return await DataServiceCore.createRecord('grades', dbData);
    } catch (error: any) {
      // Handle unique constraint violation
      if (error.code === '23505' || error.message?.includes('duplicate')) {
        throw new Error(`A grade for this student in ${gradeData.exam_type} already exists`);
      }
      throw error;
    }
  }

  static async updateGrade(id: string, updates: Partial<GradeData>) {
    return DataServiceCore.updateRecord('grades', id, updates);
  }

  static async getGrades(filters?: Record<string, any>) {
    return DataServiceCore.fetchRecords<GradeData>('grades', filters);
  }
}
