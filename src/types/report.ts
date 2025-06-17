
export interface Report {
  id: string;
  school_id: string;
  generated_by: string;
  report_type: 'individual_academic' | 'class_academic' | 'financial' | 'attendance';
  report_data: any;
  filters: any;
  generated_at: string;
  created_at: string;
  updated_at: string;
}

export interface ReportFilters {
  school_id?: string;
  academic_year?: string;
  term?: string;
  class_id?: string;
  student_id?: string;
  report_type?: string;
}

export interface StudentReportData {
  student: {
    id: string;
    name: string;
    admission_number: string;
    roll_number: string;
    date_of_birth: string;
    gender: string;
    class: {
      id: string;
      name: string;
      level: string;
      stream: string;
    };
    school: SchoolInfo;
  };
  academic_performance: {
    total_marks: number;
    possible_marks: number;
    average_percentage: number;
    overall_grade: string;
    class_position: number;
    total_subjects: number;
    subjects_performance: SubjectPerformance[];
  };
  attendance: {
    total_days: number;
    present_days: number;
    absent_days: number;
    late_days: number;
    attendance_percentage: number;
  };
  financial: {
    total_fees: number;
    paid_amount: number;
    outstanding_amount: number;
    fee_breakdown: FeeBreakdown[];
  };
  generated_at: string;
  academic_year: string;
  term?: string;
}

export interface ClassReportData {
  class_info: {
    id: string;
    name: string;
    level: string;
    stream: string;
    teacher: {
      name: string;
      email: string;
    };
    school: SchoolInfo;
    total_students: number;
  };
  performance_summary: {
    class_average: number;
    highest_score: number;
    lowest_score: number;
    total_subjects: number;
    top_performers: TopPerformer[];
    subject_performance: SubjectPerformance[];
  };
  attendance_summary: {
    total_attendance_records: number;
    class_attendance_rate: number;
    students_with_low_attendance: number;
  };
  generated_at: string;
  academic_year: string;
  term?: string;
}

export interface SchoolInfo {
  id: string;
  name: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  logo_url: string;
  motto: string;
  slogan: string;
  principal_name: string;
  principal_contact: string;
}

export interface SubjectPerformance {
  subject_name: string;
  subject_code: string;
  score?: number;
  max_score?: number;
  percentage?: number;
  grade?: string;
  position?: number;
  comments?: string;
  class_average?: number;
  highest_score?: number;
  lowest_score?: number;
}

export interface TopPerformer {
  student_name: string;
  admission_number: string;
  average_score: number;
  position: number;
}

export interface FeeBreakdown {
  category: string;
  term: string;
  amount: number;
  paid_amount: number;
  status: string;
  due_date: string;
}

export interface ReportGenerationRequest {
  report_type: 'individual_academic' | 'class_academic' | 'financial' | 'attendance';
  student_id?: string;
  class_id?: string;
  academic_year: string;
  term?: string;
  filters?: any;
}
