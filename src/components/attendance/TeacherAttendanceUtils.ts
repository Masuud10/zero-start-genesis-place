
// Type and helpers for TeacherAttendance

export type AttendanceStatus = "present" | "absent" | "late";

export interface Student {
  id: string;
  name: string;
  admission_number: string;
}

export interface AttendanceRecord {
  status: AttendanceStatus;
  remarks: string;
}

export function validStatus(v: any): AttendanceStatus {
  return v === "present" || v === "absent" || v === "late" ? v : "present";
}
