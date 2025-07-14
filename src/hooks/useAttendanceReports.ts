import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AttendanceReportData {
  student_id: string;
  student_name: string;
  admission_number?: string;
  roll_number?: string;
  status: "present" | "absent" | "late" | "excused";
}

export const useAttendanceReports = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateAttendancePDF = async (
    className: string,
    date: string,
    attendanceData: AttendanceReportData[],
    schoolDetails?: any
  ) => {
    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke('generate-attendance-pdf', {
        body: {
          className,
          date,
          attendanceData,
          schoolDetails,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-${className}-${date}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "PDF Generated",
        description: "Attendance report has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const printAttendanceReport = (
    className: string,
    date: string,
    attendanceData: AttendanceReportData[]
  ) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const presentCount = attendanceData.filter(r => r.status === "present").length;
    const absentCount = attendanceData.filter(r => r.status === "absent").length;
    const lateCount = attendanceData.filter(r => r.status === "late").length;
    const totalStudents = attendanceData.length;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Attendance Report - ${className}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .info { margin-bottom: 20px; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat-box { text-align: center; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
            .present { color: green; font-weight: bold; }
            .absent { color: red; font-weight: bold; }
            .late { color: orange; font-weight: bold; }
            .excused { color: blue; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Attendance Report</h1>
            <h2>${className}</h2>
            <p>Date: ${new Date(date).toLocaleDateString()}</p>
          </div>
          
          <div class="stats">
            <div class="stat-box">
              <h3>Present</h3>
              <p class="present">${presentCount}</p>
            </div>
            <div class="stat-box">
              <h3>Absent</h3>
              <p class="absent">${absentCount}</p>
            </div>
            <div class="stat-box">
              <h3>Late</h3>
              <p class="late">${lateCount}</p>
            </div>
            <div class="stat-box">
              <h3>Total</h3>
              <p>${totalStudents}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Student Name</th>
                <th>Admission Number</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${attendanceData.map((record, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${record.student_name}</td>
                  <td>${record.admission_number || 'N/A'}</td>
                  <td class="${record.status}">${record.status.toUpperCase()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>Powered by EduFam</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return {
    generateAttendancePDF,
    printAttendanceReport,
    isGenerating,
  };
};