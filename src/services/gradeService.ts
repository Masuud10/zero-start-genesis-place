
import { DataServiceCore } from './core/dataServiceCore';

interface DatabaseGradeInsert {
  student_id: string;
  subject_id: string;
  class_id: string;
  score: number;
  max_score: number;
  percentage?: number;
  position?: number;
  term: string;
  exam_type?: string;
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
    const dbData: DatabaseGradeInsert = {
      student_id: gradeData.student_id!,
      subject_id: gradeData.subject_id!,
      class_id: gradeData.class_id!,
      score: gradeData.score!,
      max_score: gradeData.max_score!,
      percentage: gradeData.percentage,
      position: gradeData.position,
      term: gradeData.term!,
      exam_type: gradeData.exam_type,
      submitted_by: gradeData.submitted_by,
      submitted_at: gradeData.submitted_at,
      status: gradeData.status,
      reviewed_by: gradeData.reviewed_by,
      reviewed_at: gradeData.reviewed_at,
      comments: gradeData.comments,
      is_released: gradeData.is_released ?? false,
      is_immutable: gradeData.is_immutable ?? false
    };

    return DataServiceCore.createRecord('grades', dbData, false);
  }

  static async updateGrade(id: string, updates: Partial<GradeData>) {
    return DataServiceCore.updateRecord('grades', id, updates);
  }

  static async getGrades(filters?: Record<string, any>) {
    return DataServiceCore.fetchRecords<GradeData>('grades', filters);
  }
}
