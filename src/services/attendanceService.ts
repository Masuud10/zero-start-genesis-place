
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
    // Validate required fields
    if (!attendanceData.student_id || !attendanceData.class_id || !attendanceData.date || !attendanceData.status) {
      throw new Error("Missing required attendance data: student_id, class_id, date, and status are required");
    }

    // Validate session for morning/afternoon attendance
    if (!attendanceData.session || !['morning', 'afternoon', 'full_day'].includes(attendanceData.session)) {
      throw new Error("Invalid session. Must be 'morning', 'afternoon', or 'full_day'");
    }

    const dbData: DatabaseAttendanceInsert = {
      student_id: attendanceData.student_id!,
      class_id: attendanceData.class_id!,
      school_id: attendanceData.school_id,
      date: attendanceData.date!,
      status: attendanceData.status!,
      session: attendanceData.session,
      remarks: attendanceData.remarks,
      submitted_by: attendanceData.submitted_by,
      submitted_at: attendanceData.submitted_at || new Date().toISOString(),
      academic_year: attendanceData.academic_year || new Date().getFullYear().toString(),
      term: attendanceData.term || 'Term 1'
    };

    try {
      // Use upsert to handle duplicates - will update existing record
      const result = await DataServiceCore.upsertRecord('attendance', dbData, {
        onConflict: 'school_id,class_id,student_id,date,session'
      });
      
      return result;
    } catch (error: any) {
      // Handle unique constraint violation
      if (error.code === '23505' || error.message?.includes('duplicate')) {
        throw new Error(`Attendance for this student on ${attendanceData.date} (${attendanceData.session} session) has already been recorded`);
      }
      throw error;
    }
  }

  static async updateAttendance(id: string, updates: Partial<AttendanceData>) {
    return DataServiceCore.updateRecord('attendance', id, updates);
  }

  static async getAttendance(filters?: Record<string, any>) {
    return DataServiceCore.fetchRecords<AttendanceData>('attendance', filters);
  }
}
