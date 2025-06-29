export interface Subject {
  id: string;
  name: string;
  code: string;
  school_id: string;
  class_id: string | null;
  teacher_id: string | null;
  curriculum: string;
  category: string;
  credit_hours: number | null;
  assessment_weight: number | null;
  prerequisites: string[] | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  class?: {
    id: string;
    name: string;
  };
  teacher?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface SubjectAssignment {
  id: string;
  school_id: string;
  subject_id: string;
  teacher_id: string;
  class_id: string;
  assigned_by?: string;
  assigned_at: string;
  is_active: boolean;
  subject?: {
    id: string;
    name: string;
    code: string;
  };
  teacher?: {
    id: string;
    name: string;
    email: string;
  };
  class?: {
    id: string;
    name: string;
  };
}

export interface CreateAssignmentData {
  subject_id: string;
  teacher_id: string;
  class_id: string;
}

// New interface for the form data
export interface NewSubjectFormData {
  name: string;
  code: string;
  curriculum: 'cbc' | 'igcse';
  category: 'core' | 'elective' | 'optional';
  class_id?: string;
  teacher_id?: string;
  credit_hours: number;
  assessment_weight: number;
  description?: string;
  is_active: boolean;
}
