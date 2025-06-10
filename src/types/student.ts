
export interface Student {
  id: string;
  name: string;
  classId: string;
  parentId?: string;
  rollNumber: string;
  avatar?: string;
  admissionNumber: string;
  dateOfBirth: Date;
  gender: 'male' | 'female';
  address: string;
  parentContact: string;
  isActive: boolean;
  schoolId: string; // Required for multi-tenancy
}
