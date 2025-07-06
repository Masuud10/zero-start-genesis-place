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

interface TransactionData {
  student_id: string;
  amount: number;
  payment_method: string;
  transaction_type: string;
  reference_number?: string;
  description?: string;
  [key: string]: unknown;
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

  static async recordPayment(transactionData: TransactionData) {
    return FinanceService.recordPayment(transactionData);
  }

  // Reporting - delegate to ReportService
  static async generateStudentReport(studentId: string, schoolId: string) {
    return ReportService.generateStudentReport(studentId, schoolId);
  }

  static async generateClassReport(classId: string, schoolId: string) {
    return ReportService.generateClassPerformanceReport(classId, schoolId);
  }

  static async generateFinancialReport(schoolId: string, startDate: string, endDate: string) {
    return ReportService.generateFeeCollectionReport(schoolId, startDate, endDate);
  }
}

// Re-export types for backward compatibility
export type { StudentData, GradeData, AttendanceData, FinancialData };
