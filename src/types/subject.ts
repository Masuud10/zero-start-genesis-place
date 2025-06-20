
export interface Subject {
  id: string;
  name: string;
  code: string;
  school_id: string;
  class_id?: string;
  teacher_id?: string;
  curriculum?: string;
  category?: string;
  credit_hours?: number;
  assessment_weight?: number;
  prerequisites?: string[];
  description?: string;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface SubjectCreationData {
  name: string;
  code: string;
  class_id?: string;
  teacher_id?: string;
  curriculum?: string;
  category?: string;
  credit_hours?: number;
  description?: string;
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
