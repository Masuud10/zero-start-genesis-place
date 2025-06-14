
export interface Student {
  id: string;
  name: string;
  admissionNumber: string;
  classId?: string; // Made optional since we now use junction table
  parentId?: string; // Made optional since we now use junction table
  rollNumber?: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female';
  address?: string;
  parentContact?: string;
  emergencyContact?: string;
  medicalNotes?: string;
  isActive: boolean;
  schoolId: string; // Required for multi-tenancy
  created_at: string;
  updated_at: string;
  
  // Related data from junction tables
  classes?: StudentClassEnrollment[];
  parents?: ParentStudentRelation[];
}

export interface StudentClassEnrollment {
  id: string;
  classId: string;
  academicYear: string;
  enrollmentDate: string;
  isActive: boolean;
  class?: {
    id: string;
    name: string;
  };
}

export interface ParentStudentRelation {
  id: string;
  parentId: string;
  relationshipType: string;
  isPrimaryContact: boolean;
  parent?: {
    id: string;
    name: string;
    email: string;
  };
}
