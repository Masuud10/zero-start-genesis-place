
export interface CBCCompetency {
  id: string;
  competency_name: string;
  competency_code: string;
  description?: string;
  strands: string[] | any[];
  sub_strands: string[] | any[];
  weighting: number;
  class_id?: string;
  subject_id?: string;
  school_id: string;
  assessment_types?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CBCStrandAssessment {
  id: string;
  school_id: string;
  student_id: string;
  subject_id: string;
  class_id: string;
  competency_id?: string;
  strand_name: string;
  sub_strand_name?: string;
  assessment_type: string;
  performance_level: 'EM' | 'AP' | 'PR' | 'EX';
  teacher_remarks?: string;
  term: string;
  academic_year: string;
  assessment_date?: string;
  teacher_id: string;
  submitted_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CBCPerformanceSummary {
  id: string;
  school_id: string;
  student_id: string;
  subject_id: string;
  class_id: string;
  term: string;
  academic_year: string;
  overall_performance_level?: 'EM' | 'AP' | 'PR' | 'EX';
  competency_levels: Record<string, any>;
  teacher_general_remarks?: string;
  areas_of_strength?: string[];
  areas_for_improvement?: string[];
  teacher_id: string;
  created_at?: string;
  updated_at?: string;
}

export type CBCPerformanceLevel = 'EM' | 'AP' | 'PR' | 'EX';

export const CBC_PERFORMANCE_LEVELS = [
  { value: 'EX', label: 'Exemplary', description: 'Consistently demonstrates exceptional understanding and skills' },
  { value: 'PR', label: 'Proficient', description: 'Demonstrates good understanding and application of skills' },
  { value: 'AP', label: 'Approaching Proficiency', description: 'Shows developing understanding with support needed' },
  { value: 'EM', label: 'Emerging', description: 'Beginning to show understanding, requires significant support' }
] as const;

export const CBC_ASSESSMENT_TYPES = [
  { value: 'observation', label: 'Observation' },
  { value: 'written_work', label: 'Written Work' },
  { value: 'project_work', label: 'Project Work' },
  { value: 'group_activity', label: 'Group Activity' },
  { value: 'oral_assessment', label: 'Oral Assessment' },
  { value: 'practical_work', label: 'Practical Work' }
] as const;
