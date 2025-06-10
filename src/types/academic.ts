
import { Student } from './student';

export interface Class {
  id: string;
  name: string;
  teacherId: string;
  students: Student[];
  subjects: Subject[];
  schoolId: string; // Required for multi-tenancy
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  classId: string;
  schoolId: string; // Required for multi-tenancy
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
