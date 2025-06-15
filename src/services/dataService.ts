
import { StudentService, StudentData } from './studentService';
import { GradeService, GradeData } from './gradeService';
import { AttendanceService, AttendanceData } from './attendanceService';
import { FinanceService, FinancialData } from './financeService';
import { ReportService } from './reportService';

// Define UserScope as ReportService now requires it for its methods.
interface UserScope {
  isSystemAdmin: boolean;
  schoolId: string | null;
}

// Legacy DataService that delegates to new modular services
// This maintains backward compatibility while using the new architecture
export class DataService {
  // Student Management - delegate to StudentService
  static async createStudent(studentData: Partial<StudentData>) {
    return StudentService.createStudent(studentData);
  }

  static async updateStudent(id: string, updates: Partial<StudentData>) {
    return StudentService.updateStudent(id, updates);
  }

  static async deleteStudent(id: string) {
    return StudentService.deleteStudent(id);
  }

  // Grade Management - delegate to GradeService
  static async createGrade(gradeData: Partial<GradeData>) {
    return GradeService.createGrade(gradeData);
  }

  static async updateGrade(id: string, updates: Partial<GradeData>) {
    return GradeService.updateGrade(id, updates);
  }

  // Attendance Management - delegate to AttendanceService
  static async recordAttendance(attendanceData: Partial<AttendanceData>) {
    return AttendanceService.recordAttendance(attendanceData);
  }

  static async updateAttendance(id: string, updates: Partial<AttendanceData>) {
    return AttendanceService.updateAttendance(id, updates);
  }

  // Financial Management - delegate to FinanceService
  static async createFee(feeData: Partial<FinancialData>) {
    return FinanceService.createFee(feeData);
  }

  static async updateFee(id: string, updates: Partial<FinancialData>) {
    return FinanceService.updateFee(id, updates);
  }

  static async recordPayment(transactionData: any) {
    return FinanceService.recordPayment(transactionData);
  }

  // Reporting - delegate to ReportService
  static async generateStudentReport(scope: UserScope, studentId: string, academicYear: string, term: string) {
    return ReportService.generateStudentReport(scope, studentId, academicYear, term);
  }

  static async generateClassReport(scope: UserScope, classId: string, academicYear: string, term: string) {
    return ReportService.generateClassReport(scope, classId, academicYear, term);
  }

  static async generateFinancialReport(scope: UserScope, schoolId?: string, academicYear?: string) {
    return ReportService.generateFinancialReport(scope, schoolId, academicYear);
  }
}

// Re-export types for backward compatibility
export type { StudentData, GradeData, AttendanceData, FinancialData };
