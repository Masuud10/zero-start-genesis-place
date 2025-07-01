
export interface CBCCompetency {
  id: string;
  competency_name: string;
  competency_code: string;
  description?: string;
  strands: string[];
  sub_strands: string[];
  weighting: number;
  class_id?: string;
  subject_id?: string;
  school_id: string;
  assessment_types: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CBCPerformanceLevel {
  value: 'EX' | 'PR' | 'AP' | 'EM';
  label: string;
  description: string;
  color: string;
}

export interface CBCGradeData {
  student_id: string;
  subject_id: string;
  class_id: string;
  term: string;
  exam_type: string;
  performance_level: 'EX' | 'PR' | 'AP' | 'EM';
  strand_scores: Record<string, string>;
  teacher_remarks?: string;
  assessment_type?: string;
  curriculum_type: 'CBC';
  status: 'draft' | 'submitted' | 'approved' | 'released';
}

export interface StandardGradeData {
  student_id: string;
  subject_id: string;
  class_id: string;
  term: string;
  exam_type: string;
  score: number;
  max_score: number;
  percentage: number;
  letter_grade?: string;
  curriculum_type: 'standard' | 'IGCSE';
  status: 'draft' | 'submitted' | 'approved' | 'released';
}

export type GradeData = CBCGradeData | StandardGradeData;
