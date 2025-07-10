import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";
import { format } from "date-fns";

export interface ExportOptions {
  format: 'excel' | 'pdf';
  dateRange: {
    startDate: string;
    endDate: string;
  };
  classes: string[];
  includeRemarks: boolean;
  includeSummary: boolean;
  includeCharts: boolean;
  statusFilter: string[];
  sessionFilter: string[];
  fileName: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  class_id: string;
  school_id: string;
  date: string;
  status: string;
  session: string;
  remarks?: string;
  term?: string;
  academic_year?: string;
  submitted_by: string;
  submitted_at: string;
  students?: {
    name: string;
    admission_number?: string;
  };
  classes?: {
    name: string;
  };
}

export interface AttendanceSummary {
  totalRecords: number;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendanceRate: number;
  byDate: Record<string, {
    present: number;
    absent: number;
    late: number;
    excused: number;
    total: number;
  }>;
  byClass: Record<string, {
    present: number;
    absent: number;
    late: number;
    excused: number;
    total: number;
    className: string;
  }>;
}

export class AttendanceExportService {
  /**
   * Fetch attendance data based on export options
   */
  static async fetchAttendanceData(options: ExportOptions): Promise<{
    records: AttendanceRecord[];
    summary: AttendanceSummary;
  }> {
    const { data: records, error } = await supabase
      .from("attendance")
      .select(`
        *,
        students!inner(id, name, admission_number),
        classes!inner(id, name)
      `)
      .in("class_id", options.classes)
      .in("status", options.statusFilter)
      .in("session", options.sessionFilter)
      .gte("date", options.dateRange.startDate)
      .lte("date", options.dateRange.endDate)
      .order("date", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch attendance data: ${error.message}`);
    }

    const attendanceRecords = records || [];
    const summary = this.calculateSummary(attendanceRecords);

    return { records: attendanceRecords, summary };
  }

  /**
   * Calculate summary statistics from attendance records
   */
  static calculateSummary(records: AttendanceRecord[]): AttendanceSummary {
    const summary: AttendanceSummary = {
      totalRecords: records.length,
      totalStudents: new Set(records.map(r => r.student_id)).size,
      presentCount: records.filter(r => r.status === 'present').length,
      absentCount: records.filter(r => r.status === 'absent').length,
      lateCount: records.filter(r => r.status === 'late').length,
      excusedCount: records.filter(r => r.status === 'excused').length,
      attendanceRate: 0,
      byDate: {},
      byClass: {},
    };

    // Calculate attendance rate
    const totalPresentable = summary.presentCount + summary.absentCount + summary.lateCount;
    summary.attendanceRate = totalPresentable > 0 
      ? Math.round(((summary.presentCount + summary.lateCount) / totalPresentable) * 100)
      : 0;

    // Group by date
    records.forEach(record => {
      const date = record.date;
      if (!summary.byDate[date]) {
        summary.byDate[date] = { present: 0, absent: 0, late: 0, excused: 0, total: 0 };
      }
      summary.byDate[date][record.status as keyof typeof summary.byDate[typeof date]]++;
      summary.byDate[date].total++;
    });

    // Group by class
    records.forEach(record => {
      const classId = record.class_id;
      const className = record.classes?.name || classId;
      if (!summary.byClass[classId]) {
        summary.byClass[classId] = { 
          present: 0, 
          absent: 0, 
          late: 0, 
          excused: 0, 
          total: 0,
          className 
        };
      }
      summary.byClass[classId][record.status as keyof typeof summary.byClass[typeof classId]]++;
      summary.byClass[classId].total++;
    });

    return summary;
  }

  /**
   * Export attendance data to Excel/CSV format
   */
  static async exportToExcel(
    records: AttendanceRecord[], 
    summary: AttendanceSummary, 
    options: ExportOptions
  ): Promise<void> {
    const workbook = XLSX.utils.book_new();

    // Main attendance data sheet
    const attendanceData = records.map(record => ({
      'Date': format(new Date(record.date), 'MMM dd, yyyy'),
      'Student Name': record.students?.name || 'N/A',
      'Admission Number': record.students?.admission_number || 'N/A',
      'Class': record.classes?.name || 'N/A',
      'Status': record.status,
      'Session': record.session,
      'Remarks': options.includeRemarks ? (record.remarks || '') : '',
      'Submitted At': record.submitted_at ? format(new Date(record.submitted_at), 'MMM dd, yyyy HH:mm') : 'N/A',
    }));

    const attendanceSheet = XLSX.utils.json_to_sheet(attendanceData);
    XLSX.utils.book_append_sheet(workbook, attendanceSheet, 'Attendance Data');

    // Summary sheet
    if (options.includeSummary) {
      const summaryData = [
        { 'Metric': 'Total Records', 'Value': summary.totalRecords },
        { 'Metric': 'Total Students', 'Value': summary.totalStudents },
        { 'Metric': 'Present', 'Value': summary.presentCount },
        { 'Metric': 'Absent', 'Value': summary.absentCount },
        { 'Metric': 'Late', 'Value': summary.lateCount },
        { 'Metric': 'Excused', 'Value': summary.excusedCount },
        { 'Metric': 'Attendance Rate', 'Value': `${summary.attendanceRate}%` },
        {},
        { 'Date': 'Date', 'Present': 'Present', 'Absent': 'Absent', 'Late': 'Late', 'Excused': 'Excused', 'Total': 'Total' },
        ...Object.entries(summary.byDate).map(([date, stats]) => ({
          'Date': format(new Date(date), 'MMM dd, yyyy'),
          'Present': stats.present,
          'Absent': stats.absent,
          'Late': stats.late,
          'Excused': stats.excused,
          'Total': stats.total,
        })),
        {},
        { 'Class': 'Class', 'Present': 'Present', 'Absent': 'Absent', 'Late': 'Late', 'Excused': 'Excused', 'Total': 'Total' },
        ...Object.values(summary.byClass).map(stats => ({
          'Class': stats.className,
          'Present': stats.present,
          'Absent': stats.absent,
          'Late': stats.late,
          'Excused': stats.excused,
          'Total': stats.total,
        })),
      ];

      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    }

    // Metadata sheet
    const metadataData = [
      { 'Field': 'Export Date', 'Value': format(new Date(), 'MMM dd, yyyy HH:mm') },
      { 'Field': 'Date Range', 'Value': `${format(new Date(options.dateRange.startDate), 'MMM dd, yyyy')} - ${format(new Date(options.dateRange.endDate), 'MMM dd, yyyy')}` },
      { 'Field': 'Classes', 'Value': options.classes.join(', ') },
      { 'Field': 'Status Filter', 'Value': options.statusFilter.join(', ') },
      { 'Field': 'Session Filter', 'Value': options.sessionFilter.join(', ') },
      { 'Field': 'Include Remarks', 'Value': options.includeRemarks ? 'Yes' : 'No' },
      { 'Field': 'Include Summary', 'Value': options.includeSummary ? 'Yes' : 'No' },
    ];

    const metadataSheet = XLSX.utils.json_to_sheet(metadataData);
    XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Export Info');

    // Save the file
    const fileName = `${options.fileName}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  /**
   * Export attendance data to PDF format
   */
  static async exportToPDF(
    records: AttendanceRecord[], 
    summary: AttendanceSummary, 
    options: ExportOptions
  ): Promise<void> {
    const pdfContent = this.generatePDFContent(records, summary, options);
    
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(pdfContent);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
  }

  /**
   * Generate PDF content with enhanced styling
   */
  static generatePDFContent(
    records: AttendanceRecord[], 
    summary: AttendanceSummary, 
    options: ExportOptions
  ): string {
    const dateRange = `${format(new Date(options.dateRange.startDate), 'MMM dd, yyyy')} - ${format(new Date(options.dateRange.endDate), 'MMM dd, yyyy')}`;
    const exportDate = format(new Date(), 'MMM dd, yyyy HH:mm');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Attendance Report - ${options.fileName}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 20px; 
              line-height: 1.6;
              color: #333;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 3px solid #2563eb; 
              padding-bottom: 20px; 
            }
            .header h1 { 
              color: #1e40af; 
              margin: 0 0 10px 0;
              font-size: 28px;
            }
            .info { 
              margin-bottom: 20px; 
              background: #f8fafc;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #2563eb;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 10px;
            }
            .attendance-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px; 
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .attendance-table th, .attendance-table td { 
              border: 1px solid #e2e8f0; 
              padding: 12px 8px; 
              text-align: left; 
            }
            .attendance-table th { 
              background: linear-gradient(135deg, #2563eb, #1d4ed8); 
              color: white; 
              font-weight: 600;
              text-transform: uppercase;
              font-size: 12px;
              letter-spacing: 0.5px;
            }
            .attendance-table tr:nth-child(even) { 
              background-color: #f8fafc; 
            }
            .attendance-table tr:hover { 
              background-color: #e0f2fe; 
            }
            .summary { 
              margin-top: 30px; 
              padding: 20px; 
              background: linear-gradient(135deg, #f0f9ff, #e0f2fe); 
              border-radius: 8px; 
              border: 1px solid #bae6fd;
            }
            .summary h3 { 
              color: #0369a1; 
              margin: 0 0 15px 0;
              font-size: 20px;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
              gap: 15px;
            }
            .summary-item {
              text-align: center;
              padding: 15px;
              background: white;
              border-radius: 6px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .summary-item .number {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
            }
            .summary-item .label {
              font-size: 12px;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .status-present { color: #059669; font-weight: 600; }
            .status-absent { color: #dc2626; font-weight: 600; }
            .status-late { color: #d97706; font-weight: 600; }
            .status-excused { color: #2563eb; font-weight: 600; }
            .footer { 
              margin-top: 30px; 
              text-align: center; 
              font-size: 12px; 
              color: #64748b;
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
            }
            .charts-section {
              margin-top: 30px;
              padding: 20px;
              background: #f8fafc;
              border-radius: 8px;
            }
            .chart-placeholder {
              height: 200px;
              background: linear-gradient(135deg, #e0f2fe, #bae6fd);
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #0369a1;
              font-weight: 600;
            }
            @media print { 
              body { margin: 0; }
              .header { border-bottom-color: #000; }
              .attendance-table th { background: #000 !important; color: #fff !important; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Attendance Report</h1>
            <div class="info">
              <div class="info-grid">
                <div><strong>Date Range:</strong> ${dateRange}</div>
                <div><strong>Classes:</strong> ${options.classes.length} selected</div>
                <div><strong>Status Filter:</strong> ${options.statusFilter.join(', ')}</div>
                <div><strong>Session Filter:</strong> ${options.sessionFilter.join(', ')}</div>
                <div><strong>Generated:</strong> ${exportDate}</div>
                <div><strong>Total Records:</strong> ${summary.totalRecords}</div>
              </div>
            </div>
          </div>
          
          ${options.includeSummary ? `
            <div class="summary">
              <h3>📈 Summary Statistics</h3>
              <div class="summary-grid">
                <div class="summary-item">
                  <div class="number">${summary.totalRecords}</div>
                  <div class="label">Total Records</div>
                </div>
                <div class="summary-item">
                  <div class="number">${summary.totalStudents}</div>
                  <div class="label">Students</div>
                </div>
                <div class="summary-item">
                  <div class="number">${summary.presentCount}</div>
                  <div class="label">Present</div>
                </div>
                <div class="summary-item">
                  <div class="number">${summary.absentCount}</div>
                  <div class="label">Absent</div>
                </div>
                <div class="summary-item">
                  <div class="number">${summary.lateCount}</div>
                  <div class="label">Late</div>
                </div>
                <div class="summary-item">
                  <div class="number">${summary.excusedCount}</div>
                  <div class="label">Excused</div>
                </div>
                <div class="summary-item">
                  <div class="number">${summary.attendanceRate}%</div>
                  <div class="label">Attendance Rate</div>
                </div>
              </div>
            </div>
          ` : ''}
          
          <table class="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Student Name</th>
                <th>Admission #</th>
                <th>Class</th>
                <th>Status</th>
                <th>Session</th>
                ${options.includeRemarks ? '<th>Remarks</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${records.map(record => `
                <tr>
                  <td>${format(new Date(record.date), 'MMM dd, yyyy')}</td>
                  <td>${record.students?.name || 'N/A'}</td>
                  <td>${record.students?.admission_number || 'N/A'}</td>
                  <td>${record.classes?.name || 'N/A'}</td>
                  <td class="status-${record.status}">${record.status.charAt(0).toUpperCase() + record.status.slice(1)}</td>
                  <td>${record.session.charAt(0).toUpperCase() + record.session.slice(1)}</td>
                  ${options.includeRemarks ? `<td>${record.remarks || ''}</td>` : ''}
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          ${options.includeCharts ? `
            <div class="charts-section">
              <h3>📊 Attendance Trends</h3>
              <div class="chart-placeholder">
                Charts would be displayed here in a full implementation
              </div>
            </div>
          ` : ''}
          
          <div class="footer">
            <p>📋 Generated by EduFam School Management System</p>
            <p>This report contains ${records.length} attendance records for ${summary.totalStudents} students</p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Main export function that handles both Excel and PDF exports
   */
  static async exportAttendance(options: ExportOptions): Promise<void> {
    try {
      // Fetch attendance data
      const { records, summary } = await this.fetchAttendanceData(options);

      if (records.length === 0) {
        throw new Error('No attendance records found for the selected criteria');
      }

      // Export based on format
      if (options.format === 'excel') {
        await this.exportToExcel(records, summary, options);
      } else {
        await this.exportToPDF(records, summary, options);
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }
} 