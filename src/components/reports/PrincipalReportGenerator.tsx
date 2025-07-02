import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { FileText, Download, Loader2, BarChart3, Users, Calendar, DollarSign, GraduationCap, FileSpreadsheet, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface PrincipalReportGeneratorProps {
  open?: boolean;
  onClose?: () => void;
  onReportGenerated?: () => void;
}

type ReportType = 'individual_student' | 'academic_performance' | 'attendance_summary' | 'financial_performance' | 'class_performance' | 'subject_performance';

const PrincipalReportGenerator: React.FC<PrincipalReportGeneratorProps> = ({
  open = false,
  onClose,
  onReportGenerated
}) => {
  const [reportType, setReportType] = useState<ReportType>('academic_performance');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [term, setTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { toast } = useToast();
  const { schoolId } = useSchoolScopedData();

  const reportTypes = [
    { value: 'individual_student', label: 'Individual Student Performance Report', icon: GraduationCap },
    { value: 'academic_performance', label: 'Academic Performance Summary', icon: BarChart3 },
    { value: 'attendance_summary', label: 'Attendance Summary Report', icon: Calendar },
    { value: 'financial_performance', label: 'Financial Performance Report', icon: DollarSign },
    { value: 'class_performance', label: 'Class Performance Report', icon: Users },
    { value: 'subject_performance', label: 'Subject Performance Report', icon: FileText }
  ];

  const terms = ['Term 1', 'Term 2', 'Term 3'];

  // Get classes
  const { data: classes = [] } = useQuery({
    queryKey: ['classes', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, level, stream')
        .eq('school_id', schoolId)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!schoolId
  });

  // Get students for individual reports
  const { data: students = [] } = useQuery({
    queryKey: ['students', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await supabase
        .from('students')
        .select('id, name, admission_number, classes!students_class_id_fkey(name)')
        .eq('school_id', schoolId)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!schoolId && reportType === 'individual_student'
  });

  // Get school details
  const { data: school } = useQuery({
    queryKey: ['school', schoolId],
    queryFn: async () => {
      if (!schoolId) return null;
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('id', schoolId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!schoolId
  });

  const handleClassSelection = (classId: string, checked: boolean) => {
    if (checked) {
      setSelectedClasses(prev => [...prev, classId]);
    } else {
      setSelectedClasses(prev => prev.filter(id => id !== classId));
    }
  };

  const addSchoolHeader = (doc: jsPDF) => {
    // Enhanced header with school branding
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, 210, 35, 'F');
    
    // School logo placeholder (if available)
    if (school?.logo_url) {
      // Add logo handling here if needed
    }
    
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(school?.name || 'School Report', 20, 20);
    
    // School details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (school?.location) {
      doc.text(school.location, 20, 28);
    }
    
    // Report type and timestamp
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    const selectedReportType = reportTypes.find(r => r.value === reportType);
    doc.text(selectedReportType?.label || 'Report', 20, 50);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 60);
    doc.text(`Academic Year: ${academicYear || 'Current'}`, 20, 68);
    if (term) {
      doc.text(`Term: ${term}`, 120, 68);
    }

    return 80; // Return Y position for content start
  };

  const addFooter = (doc: jsPDF) => {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setLineWidth(0.5);
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 280, 190, 280);
      
      // Footer content
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} of ${pageCount}`, 20, 290);
      doc.text('Powered by EduFam', 105, 290, { align: 'center' });
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 190, 290, { align: 'right' });
    }
  };

  const generateIndividualStudentReport = async (doc: jsPDF, startY: number) => {
    if (!selectedStudent) return startY;

    // Get comprehensive student data
    const { data: studentData } = await supabase
      .from('students')
      .select(`
        *,
        classes!students_class_id_fkey(name, level, stream),
        grades!grades_student_id_fkey(
          score, max_score, percentage, letter_grade, term, exam_type,
          subjects!grades_subject_id_fkey(name, code)
        ),
        attendance!attendance_student_id_fkey(status, date, term),
        fees!fees_student_id_fkey(amount, paid_amount, status, category, term)
      `)
      .eq('id', selectedStudent)
      .eq('school_id', schoolId)
      .single();

    if (!studentData) {
      doc.text('Student data not found.', 20, startY);
      return startY + 20;
    }

    let yPos = startY;

    // Student Information Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Information', 20, yPos);
    yPos += 15;

    const studentInfo = [
      ['Name', studentData.name],
      ['Admission Number', studentData.admission_number],
      ['Class', studentData.classes?.name || 'N/A'],
      ['Level', studentData.classes?.level || 'N/A'],
      ['Gender', studentData.gender || 'N/A']
    ];

    (doc as any).autoTable({
      startY: yPos,
      head: [['Field', 'Value']],
      body: studentInfo,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: 20, right: 20 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 20;

    // Academic Performance Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Academic Performance', 20, yPos);
    yPos += 15;

    const grades = studentData.grades?.filter(g => !term || g.term === term) || [];
    if (grades.length > 0) {
      const gradeData = grades.map(grade => [
        grade.subjects?.name || 'N/A',
        grade.score || '0',
        grade.max_score || '100',
        `${grade.percentage?.toFixed(1) || '0'}%`,
        grade.letter_grade || 'N/A'
      ]);

      (doc as any).autoTable({
        startY: yPos,
        head: [['Subject', 'Score', 'Max Score', 'Percentage', 'Grade']],
        body: gradeData,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] },
        margin: { left: 20, right: 20 }
      });

      yPos = (doc as any).lastAutoTable.finalY + 20;
    }

    return yPos;
  };

  const generateAcademicPerformanceReport = async (doc: jsPDF, startY: number) => {
    let classFilter = selectedClasses.length > 0 ? selectedClasses : classes.map(c => c.id);
    
    const { data: grades } = await supabase
      .from('grades')
      .select(`
        *,
        students!grades_student_id_fkey(name, admission_number),
        subjects!grades_subject_id_fkey(name, code),
        classes!grades_class_id_fkey(name, level)
      `)
      .eq('school_id', schoolId)
      .in('class_id', classFilter)
      .eq('status', 'released')
      .order('created_at', { ascending: false });

    if (!grades?.length) {
      doc.text('No academic performance data available.', 20, startY);
      return startY + 20;
    }

    let yPos = startY;

    // Overall Statistics
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Academic Performance Summary', 20, yPos);
    yPos += 15;

    const totalStudents = new Set(grades.map(g => g.student_id)).size;
    const averageScore = grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / grades.length;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Students: ${totalStudents}`, 20, yPos);
    doc.text(`Overall Average: ${averageScore.toFixed(1)}%`, 120, yPos);
    yPos += 20;

    // Performance by Subject
    const subjectPerformance = grades.reduce((acc: any, grade) => {
      const subjectName = grade.subjects?.name || 'Unknown';
      if (!acc[subjectName]) {
        acc[subjectName] = { scores: [], total: 0, count: 0 };
      }
      acc[subjectName].scores.push(grade.percentage || 0);
      acc[subjectName].total += grade.percentage || 0;
      acc[subjectName].count++;
      return acc;
    }, {});

    const subjectData = Object.entries(subjectPerformance).map(([subject, data]: [string, any]) => [
      subject,
      data.count,
      `${(data.total / data.count).toFixed(1)}%`,
      `${Math.max(...data.scores).toFixed(1)}%`,
      `${Math.min(...data.scores).toFixed(1)}%`
    ]);

    (doc as any).autoTable({
      startY: yPos,
      head: [['Subject', 'Students', 'Average', 'Highest', 'Lowest']],
      body: subjectData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: 20, right: 20 }
    });

    return (doc as any).lastAutoTable.finalY + 20;
  };

  const generateAttendanceReport = async (doc: jsPDF, startY: number) => {
    let classFilter = selectedClasses.length > 0 ? selectedClasses : classes.map(c => c.id);
    
    const { data: attendance } = await supabase
      .from('attendance')
      .select(`
        *,
        students!attendance_student_id_fkey(name, admission_number),
        classes!attendance_class_id_fkey(name, level)
      `)
      .eq('school_id', schoolId)
      .in('class_id', classFilter)
      .order('date', { ascending: false });

    if (!attendance?.length) {
      doc.text('No attendance data available.', 20, startY);
      return startY + 20;
    }

    let yPos = startY;

    // Attendance Summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Attendance Summary', 20, yPos);
    yPos += 15;

    const totalRecords = attendance.length;
    const presentCount = attendance.filter(a => a.status === 'present').length;
    const absentCount = attendance.filter(a => a.status === 'absent').length;
    const lateCount = attendance.filter(a => a.status === 'late').length;
    const attendanceRate = ((presentCount / totalRecords) * 100).toFixed(1);

    const summaryData = [
      ['Total Records', totalRecords.toString()],
      ['Present', presentCount.toString()],
      ['Absent', absentCount.toString()],
      ['Late', lateCount.toString()],
      ['Attendance Rate', `${attendanceRate}%`]
    ];

    (doc as any).autoTable({
      startY: yPos,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: 20, right: 20 }
    });

    return (doc as any).lastAutoTable.finalY + 20;
  };

  const generateFinancialReport = async (doc: jsPDF, startY: number) => {
    const { data: fees } = await supabase
      .from('fees')
      .select(`
        *,
        students!fees_student_id_fkey(name, admission_number),
        classes!fees_class_id_fkey(name, level)
      `)
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });

    if (!fees?.length) {
      doc.text('No financial data available.', 20, startY);
      return startY + 20;
    }

    let yPos = startY;

    // Financial Summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Financial Performance Summary', 20, yPos);
    yPos += 15;

    const totalFees = fees.reduce((sum, f) => sum + (f.amount || 0), 0);
    const totalPaid = fees.reduce((sum, f) => sum + (f.paid_amount || 0), 0);
    const outstanding = totalFees - totalPaid;
    const collectionRate = totalFees > 0 ? ((totalPaid / totalFees) * 100).toFixed(1) : '0';

    const financialData = [
      ['Total Fees', `KES ${totalFees.toLocaleString()}`],
      ['Total Collected', `KES ${totalPaid.toLocaleString()}`],
      ['Outstanding', `KES ${outstanding.toLocaleString()}`],
      ['Collection Rate', `${collectionRate}%`]
    ];

    (doc as any).autoTable({
      startY: yPos,
      head: [['Metric', 'Amount']],
      body: financialData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: 20, right: 20 }
    });

    return (doc as any).lastAutoTable.finalY + 20;
  };

  const generateClassPerformanceReport = async (doc: jsPDF, startY: number) => {
    let classFilter = selectedClasses.length > 0 ? selectedClasses : classes.map(c => c.id);
    
    const { data: classData } = await supabase
      .from('classes')
      .select(`
        *,
        students!students_class_id_fkey(
          id, name, admission_number,
          grades!grades_student_id_fkey(score, percentage, letter_grade)
        )
      `)
      .eq('school_id', schoolId)
      .in('id', classFilter)
      .order('name');

    if (!classData?.length) {
      doc.text('No class performance data available.', 20, startY);
      return startY + 20;
    }

    let yPos = startY;

    // Class Performance Analysis
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Class Performance Report', 20, yPos);
    yPos += 15;

    const classPerformanceData = classData.map(classItem => {
      const students = classItem.students || [];
      const grades = students.flatMap(s => s.grades || []);
      const avgPerformance = grades.length > 0 ? 
        grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / grades.length : 0;
      
      return [
        classItem.name,
        students.length.toString(),
        grades.length.toString(),
        `${avgPerformance.toFixed(1)}%`,
        grades.length > 0 ? Math.max(...grades.map(g => g.percentage || 0)).toFixed(1) + '%' : 'N/A',
        grades.length > 0 ? Math.min(...grades.map(g => g.percentage || 0)).toFixed(1) + '%' : 'N/A'
      ];
    });

    (doc as any).autoTable({
      startY: yPos,
      head: [['Class', 'Students', 'Assessments', 'Average', 'Highest', 'Lowest']],
      body: classPerformanceData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: 20, right: 20 }
    });

    return (doc as any).lastAutoTable.finalY + 20;
  };

  const generateSubjectPerformanceReport = async (doc: jsPDF, startY: number) => {
    let classFilter = selectedClasses.length > 0 ? selectedClasses : classes.map(c => c.id);
    
    const { data: subjectData } = await supabase
      .from('subjects')
      .select(`
        *,
        grades!grades_subject_id_fkey(score, percentage, letter_grade, student_id),
        classes!subjects_class_id_fkey(name)
      `)
      .eq('school_id', schoolId)
      .in('class_id', classFilter)
      .order('name');

    if (!subjectData?.length) {
      doc.text('No subject performance data available.', 20, startY);
      return startY + 20;
    }

    let yPos = startY;

    // Subject Performance Analysis
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Subject Performance Report', 20, yPos);
    yPos += 15;

    const subjectPerformanceData = subjectData.map(subject => {
      const grades = subject.grades || [];
      const uniqueStudents = new Set(grades.map(g => g.student_id)).size;
      const avgPerformance = grades.length > 0 ? 
        grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / grades.length : 0;
      
      return [
        subject.name,
        subject.classes?.name || 'N/A',
        uniqueStudents.toString(),
        grades.length.toString(),
        `${avgPerformance.toFixed(1)}%`,
        grades.length > 0 ? Math.max(...grades.map(g => g.percentage || 0)).toFixed(1) + '%' : 'N/A',
        grades.length > 0 ? Math.min(...grades.map(g => g.percentage || 0)).toFixed(1) + '%' : 'N/A'
      ];
    });

    (doc as any).autoTable({
      startY: yPos,
      head: [['Subject', 'Class', 'Students', 'Assessments', 'Average', 'Highest', 'Lowest']],
      body: subjectPerformanceData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: 20, right: 20 }
    });

    return (doc as any).lastAutoTable.finalY + 20;
  };

  const generateExcelReport = async () => {
    try {
      let data: any[] = [];
      let sheetName = 'Report';

      switch (reportType) {
        case 'academic_performance':
          const { data: gradesData } = await supabase
            .from('grades')
            .select(`
              *,
              students!grades_student_id_fkey(name, admission_number),
              subjects!grades_subject_id_fkey(name, code),
              classes!grades_class_id_fkey(name, level)
            `)
            .eq('school_id', schoolId)
            .eq('status', 'released');

          data = gradesData?.map(g => ({
            'Student Name': g.students?.name,
            'Admission Number': g.students?.admission_number,
            'Class': g.classes?.name,
            'Subject': g.subjects?.name,
            'Score': g.score,
            'Max Score': g.max_score,
            'Percentage': g.percentage,
            'Grade': g.letter_grade,
            'Term': g.term
          })) || [];
          sheetName = 'Academic_Performance';
          break;

        case 'attendance_summary':
          const { data: attendanceData } = await supabase
            .from('attendance')
            .select(`
              *,
              students!attendance_student_id_fkey(name, admission_number),
              classes!attendance_class_id_fkey(name, level)
            `)
            .eq('school_id', schoolId);

          data = attendanceData?.map(a => ({
            'Student Name': a.students?.name,
            'Admission Number': a.students?.admission_number,
            'Class': a.classes?.name,
            'Date': a.date,
            'Status': a.status,
            'Session': a.session,
            'Term': a.term
          })) || [];
          sheetName = 'Attendance_Summary';
          break;

        case 'financial_performance':
          const { data: feesData } = await supabase
            .from('fees')
            .select(`
              *,
              students!fees_student_id_fkey(name, admission_number)
            `)
            .eq('school_id', schoolId);

          data = feesData?.map(f => ({
            'Student Name': f.students?.name,
            'Admission Number': f.students?.admission_number,
            'Category': f.category,
            'Amount': f.amount,
            'Paid Amount': f.paid_amount,
            'Outstanding': (f.amount || 0) - (f.paid_amount || 0),
            'Status': f.status,
            'Term': f.term
          })) || [];
          sheetName = 'Financial_Performance';
          break;

        case 'class_performance':
          let classFilter = selectedClasses.length > 0 ? selectedClasses : classes.map(c => c.id);
          const { data: classGrades } = await supabase
            .from('grades')
            .select(`
              *,
              students!grades_student_id_fkey(name, admission_number),
              classes!grades_class_id_fkey(name, level),
              subjects!grades_subject_id_fkey(name)
            `)
            .eq('school_id', schoolId)
            .in('class_id', classFilter)
            .eq('status', 'released');

          data = classGrades?.map(g => ({
            'Class': g.classes?.name,
            'Student': g.students?.name,
            'Admission Number': g.students?.admission_number,
            'Subject': g.subjects?.name,
            'Score': g.score,
            'Max Score': g.max_score,
            'Percentage': g.percentage,
            'Grade': g.letter_grade,
            'Term': g.term
          })) || [];
          sheetName = 'Class_Performance';
          break;

        case 'subject_performance':
          let subjectClassFilter = selectedClasses.length > 0 ? selectedClasses : classes.map(c => c.id);
          const { data: subjectGrades } = await supabase
            .from('grades')
            .select(`
              *,
              students!grades_student_id_fkey(name, admission_number),
              classes!grades_class_id_fkey(name, level),
              subjects!grades_subject_id_fkey(name, code)
            `)
            .eq('school_id', schoolId)
            .in('class_id', subjectClassFilter)
            .eq('status', 'released');

          data = subjectGrades?.map(g => ({
            'Subject': g.subjects?.name,
            'Subject Code': g.subjects?.code,
            'Class': g.classes?.name,
            'Student': g.students?.name,
            'Admission Number': g.students?.admission_number,
            'Score': g.score,
            'Max Score': g.max_score,
            'Percentage': g.percentage,
            'Grade': g.letter_grade,
            'Term': g.term
          })) || [];
          sheetName = 'Subject_Performance';
          break;
      }

      if (data.length === 0) {
        toast({
          title: "No Data",
          description: "No data available for Excel export.",
          variant: "destructive"
        });
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      const fileName = `${school?.name || 'School'}_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "Excel Report Generated",
        description: "Your Excel report has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Excel generation error:', error);
      toast({
        title: "Excel Generation Failed",
        description: "Failed to generate Excel report. Please try again.",
        variant: "destructive"
      });
    }
  };

  const generatePDFReport = async () => {
    try {
      const doc = new jsPDF();
      let yPosition = addSchoolHeader(doc);

      // Generate content based on report type
      switch (reportType) {
        case 'individual_student':
          yPosition = await generateIndividualStudentReport(doc, yPosition);
          break;
        case 'academic_performance':
          yPosition = await generateAcademicPerformanceReport(doc, yPosition);
          break;
        case 'attendance_summary':
          yPosition = await generateAttendanceReport(doc, yPosition);
          break;
        case 'financial_performance':
          yPosition = await generateFinancialReport(doc, yPosition);
          break;
        case 'class_performance':
          yPosition = await generateClassPerformanceReport(doc, yPosition);
          break;
        case 'subject_performance':
          yPosition = await generateSubjectPerformanceReport(doc, yPosition);
          break;
      }

      addFooter(doc);

      const fileName = `${school?.name || 'School'}_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast({
        title: "PDF Report Generated",
        description: "Your PDF report has been downloaded successfully.",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "PDF Generation Failed",
        description: "Failed to generate PDF report. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleGenerateReport = async (format: 'pdf' | 'excel') => {
    if (reportType === 'individual_student' && !selectedStudent) {
      toast({
        title: "Student Required",
        description: "Please select a student for individual reports.",
        variant: "destructive"
      });
      return;
    }

    if (!['individual_student', 'academic_performance', 'financial_performance'].includes(reportType) && selectedClasses.length === 0) {
      toast({
        title: "Classes Required",
        description: "Please select at least one class.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      if (format === 'pdf') {
        await generatePDFReport();
      } else {
        await generateExcelReport();
      }
      onReportGenerated?.();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setReportType('academic_performance');
    setSelectedClasses([]);
    setSelectedStudent('');
    setAcademicYear('');
    setTerm('');
    onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Principal Reports
          </DialogTitle>
          <DialogDescription>
            Create comprehensive reports for your school's performance and administration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select value={reportType} onValueChange={(value: ReportType) => setReportType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Select value={academicYear} onValueChange={setAcademicYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={new Date().getFullYear().toString()}>
                        {new Date().getFullYear()}
                      </SelectItem>
                      <SelectItem value={(new Date().getFullYear() - 1).toString()}>
                        {new Date().getFullYear() - 1}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="term">Term (Optional)</Label>
                  <Select value={term} onValueChange={setTerm}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      {terms.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {reportType === 'individual_student' && (
            <Card>
              <CardHeader>
                <CardTitle>Select Student</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} - {student.admission_number} ({student.classes?.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {!['individual_student', 'academic_performance', 'financial_performance'].includes(reportType) && (
            <Card>
              <CardHeader>
                <CardTitle>Select Classes</CardTitle>
                <p className="text-sm text-muted-foreground">Leave empty to include all classes</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {classes.map((classItem) => (
                    <div key={classItem.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={classItem.id}
                        checked={selectedClasses.includes(classItem.id)}
                        onCheckedChange={(checked) => handleClassSelection(classItem.id, checked as boolean)}
                      />
                      <Label htmlFor={classItem.id} className="text-sm">
                        {classItem.name}
                        {classItem.stream && ` - ${classItem.stream}`}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={handleClose} disabled={isGenerating}>
              Cancel
            </Button>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => handleGenerateReport('excel')} 
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                )}
                Excel
              </Button>
              
              <Button onClick={() => handleGenerateReport('pdf')} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.print()} 
                disabled={isGenerating}
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrincipalReportGenerator;