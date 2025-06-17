
import { DataServiceCore } from './core/dataServiceCore';

interface DatabaseAttendanceInsert {
  student_id: string;
  class_id: string;
  school_id?: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  session?: 'morning' | 'afternoon' | 'full_day';
  remarks?: string;
  submitted_by?: string;
  submitted_at?: string;
  academic_year?: string;
  term?: string;
}

export interface AttendanceData {
  id: string;
  student_id: string;
  class_id: string;
  school_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  session: 'morning' | 'afternoon' | 'full_day';
  remarks?: string;
  submitted_by: string;
  submitted_at: string;
  academic_year: string;
  term: string;
  created_at: string;
  updated_at: string;
}

export class AttendanceService {
  static async recordAttendance(attendanceData: Partial<AttendanceData>) {
    const dbData: DatabaseAttendanceInsert = {
      student_id: attendanceData.student_id!,
      class_id: attendanceData.class_id!,
      school_id: attendanceData.school_id,
      date: attendanceData.date!,
      status: attendanceData.status!,
      session: attendanceData.session,
      remarks: attendanceData.remarks,
      submitted_by: attendanceData.submitted_by,
      submitted_at: attendanceData.submitted_at,
      academic_year: attendanceData.academic_year,
      term: attendanceData.term
    };

    // Use upsert instead of createRecord to handle duplicates
    return DataServiceCore.upsertRecord('attendance', dbData, {
      onConflict: 'school_id,class_id,student_id,date,session'
    });
  }

  static async updateAttendance(id: string, updates: Partial<AttendanceData>) {
    return DataServiceCore.updateRecord('attendance', id, updates);
  }

  static async getAttendance(filters?: Record<string, any>) {
    return DataServiceCore.fetchRecords<AttendanceData>('attendance', filters);
  }
}
