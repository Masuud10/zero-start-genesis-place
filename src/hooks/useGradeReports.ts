import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GradeReportData {
  student_id: string;
  student_name: string;
  admission_number?: string;
  subjects: {
    [subjectId: string]: {
      subject_name: string;
      score?: number;
      max_score?: number;
      percentage?: number;
      letter_grade?: string;
      performance_level?: string;
      coursework_score?: number;
      exam_score?: number;
    };
  };
  total_score?: number;
  total_possible?: number;
  overall_percentage?: number;
  overall_grade?: string;
  overall_position?: number;
}

export const useGradeReports = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateGradePDF = async (
    className: string,
    curriculumType: string,
    term: string,
    examType: string,
    academicYear: string,
    gradeData: GradeReportData[],
    subjects: Array<{ id: string; name: string; code?: string }>,
    schoolDetails?: any
  ) => {
    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke('generate-grade-pdf', {
        body: {
          className,
          curriculumType,
          term,
          examType,
          academicYear,
          gradeData,
          subjects,
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
      a.download = `grades-${className}-${term}-${examType}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "PDF Generated",
        description: "Grade sheet has been downloaded successfully.",
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

  const generateGradeExcel = async (
    className: string,
    curriculumType: string,
    term: string,
    examType: string,
    academicYear: string,
    gradeData: GradeReportData[],
    subjects: Array<{ id: string; name: string; code?: string }>
  ) => {
    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke('generate-grade-excel', {
        body: {
          className,
          curriculumType,
          term,
          examType,
          academicYear,
          gradeData,
          subjects,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Create download link
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grades-${className}-${term}-${examType}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Excel Generated",
        description: "Grade sheet has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error generating Excel:", error);
      toast({
        title: "Error",
        description: "Failed to generate Excel report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const printGradeReport = (
    className: string,
    curriculumType: string,
    term: string,
    examType: string,
    academicYear: string,
    gradeData: GradeReportData[],
    subjects: Array<{ id: string; name: string; code?: string }>
  ) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const totalStudents = gradeData.length;
    const avgPercentage = totalStudents > 0 
      ? gradeData.reduce((sum, record) => sum + (record.overall_percentage || 0), 0) / totalStudents
      : 0;
    const passRate = totalStudents > 0
      ? (gradeData.filter(record => (record.overall_percentage || 0) >= 50).length / totalStudents) * 100
      : 0;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Grade Sheet - ${className}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
            .header { text-align: center; margin-bottom: 30px; }
            .info { margin-bottom: 20px; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat-box { text-align: center; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 10px; }
            th, td { padding: 4px; text-align: center; border: 1px solid #ddd; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .student-name { text-align: left; }
            .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; }
            @media print {
              body { margin: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Grade Sheet Report</h1>
            <h2>${className}</h2>
            <p>${term} - ${examType} - ${academicYear}</p>
            <p>Curriculum: ${curriculumType.toUpperCase()}</p>
          </div>
          
          <div class="stats">
            <div class="stat-box">
              <h4>Total Students</h4>
              <p>${totalStudents}</p>
            </div>
            <div class="stat-box">
              <h4>Class Average</h4>
              <p>${avgPercentage.toFixed(1)}%</p>
            </div>
            <div class="stat-box">
              <h4>Pass Rate</h4>
              <p>${passRate.toFixed(1)}%</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Student Name</th>
                <th>Adm. No.</th>
                ${subjects.map(subject => `<th>${subject.name}</th>`).join('')}
                <th>Total</th>
                <th>Average</th>
                <th>Grade</th>
                <th>Position</th>
              </tr>
            </thead>
            <tbody>
              ${gradeData.map((record, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td class="student-name">${record.student_name}</td>
                  <td>${record.admission_number || 'N/A'}</td>
                  ${subjects.map(subject => {
                    const subjectGrade = record.subjects[subject.id];
                    if (!subjectGrade) return '<td>-</td>';
                    
                    if (curriculumType?.toLowerCase() === 'cbc') {
                      return `<td>${subjectGrade.performance_level || 'N/A'}</td>`;
                    } else if (curriculumType?.toLowerCase() === 'igcse') {
                      return `<td>${subjectGrade.letter_grade || 'N/A'}</td>`;
                    } else {
                      return `<td>${subjectGrade.score || 0}/${subjectGrade.max_score || 100}<br/>${subjectGrade.letter_grade || 'N/A'}</td>`;
                    }
                  }).join('')}
                  <td>${record.total_score || 0}/${record.total_possible || 0}</td>
                  <td>${record.overall_percentage?.toFixed(1) || '0'}%</td>
                  <td>${record.overall_grade || 'N/A'}</td>
                  <td>${record.overall_position || '-'}</td>
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
    generateGradePDF,
    generateGradeExcel,
    printGradeReport,
    isGenerating,
  };
};