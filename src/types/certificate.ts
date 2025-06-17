
export interface Certificate {
  id: string;
  school_id: string;
  student_id: string;
  class_id: string;
  academic_year: string;
  performance: CertificatePerformance;
  generated_by: string;
  generated_at: string;
  created_at: string;
  updated_at: string;
}

export interface CertificatePerformance {
  student: {
    id: string;
    name: string;
    admission_number: string;
    roll_number: string;
    school_id: string;
  };
  performance: {
    total_marks: number;
    possible_marks: number;
    average_score: number;
    grade_letter: string;
    total_subjects: number;
    class_position: number;
    subjects_performance: SubjectPerformance[];
  };
  attendance: {
    total_days: number;
    present_days: number;
    absent_days: number;
    attendance_percentage: number;
  };
  academic_year: string;
  class_id: string;
}

export interface SubjectPerformance {
  subject_name: string;
  subject_code: string;
  score: number;
  max_score: number;
  percentage: number;
  grade: string;
}

export interface CertificateGenerationRequest {
  student_id: string;
  class_id: string;
  academic_year: string;
}

export interface CertificateFilters {
  school_id?: string;
  academic_year?: string;
  class_id?: string;
  student_name?: string;
}
