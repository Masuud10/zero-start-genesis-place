import { Student } from './student';

export interface Class {
  id: string;
  name: string;
  teacherId?: string; // Made optional since we now have many-to-many
  students?: Student[];
  subjects?: Subject[];
  schoolId: string; // Required for multi-tenancy
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  teacherId?: string; // Made optional since we now have many-to-many
  classId?: string; // Made optional since subjects can be shared
  schoolId: string; // Required for multi-tenancy
  created_at: string;
}

export interface TeacherClass {
  id: string;
  teacherId: string;
  classId: string;
  subjectId?: string;
  created_at: string;
  teacher?: {
    id: string;
    name: string;
    email: string;
  };
  subject?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface StudentClass {
  id: string;
  studentId: string;
  classId: string;
  academicYear: string;
  enrollmentDate: string;
  isActive: boolean;
  created_at: string;
  student?: {
    id: string;
    name: string;
    admissionNumber: string;
    rollNumber?: string;
  };
}

export interface ParentStudent {
  id: string;
  parentId: string;
  studentId: string;
  relationshipType: string;
  isPrimaryContact: boolean;
  created_at: string;
  parent?: {
    id: string;
    name: string;
    email: string;
  };
  student?: {
    id: string;
    name: string;
    admissionNumber: string;
  };
}

export interface Timetable {
  id: string;
  classId: string;
  schoolId: string;
  schedule: TimetableSlot[];
  version: number;
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
}

export interface TimetableSlot {
  id: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
  startTime: string;
  endTime: string;
  subjectId: string;
  teacherId: string;
  room?: string;
}
