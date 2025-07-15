
import { DataServiceCore } from './core/dataServiceCore';

// Database interfaces matching actual schema
interface DatabaseStudentInsert {
  name: string;
  admission_number: string;
  class_id?: string;
  school_id?: string;
  parent_id?: string;
  roll_number?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  parent_contact?: string;
  emergency_contact?: string;
  medical_notes?: string;
  avatar_url?: string;
  is_active?: boolean;
}

// Legacy interface for backward compatibility
export interface StudentData {
  id: string;
  name: string;
  admission_number: string;
  class_id: string;
  school_id: string;
  parent_id?: string;
  roll_number?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  parent_contact?: string;
  emergency_contact?: string;
  medical_notes?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class StudentService {
  static async createStudent(studentData: Partial<StudentData>) {
    try {
      console.log('StudentService.createStudent called with:', studentData);
      const dbData: DatabaseStudentInsert = {
        name: studentData.name!,
        admission_number: studentData.admission_number!,
        class_id: studentData.class_id,
        school_id: studentData.school_id,
        parent_id: studentData.parent_id,
        roll_number: studentData.roll_number,
        date_of_birth: studentData.date_of_birth,
        gender: studentData.gender,
        address: studentData.address,
        parent_contact: studentData.parent_contact,
        emergency_contact: studentData.emergency_contact,
        medical_notes: studentData.medical_notes,
        avatar_url: studentData.avatar_url,
        is_active: studentData.is_active ?? true
      };
      // Log the dbData being sent to the database
      console.log('StudentService.createStudent dbData:', dbData);
      return await DataServiceCore.createRecord('students', dbData);
    } catch (error) {
      console.error('StudentService.createStudent error:', error);
      return { data: null, error };
    }
  }

  static async updateStudent(id: string, updates: Partial<StudentData>) {
    return DataServiceCore.updateRecord('students', id, updates);
  }

  static async deleteStudent(id: string) {
    return DataServiceCore.deleteRecord('students', id, true);
  }

  static async getStudents(filters?: Record<string, any>) {
    return DataServiceCore.fetchRecords<StudentData>('students', filters);
  }
}
