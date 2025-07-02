import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { FileText, Download, Loader2, BarChart3, Users, Calendar, DollarSign, GraduationCap, FileSpreadsheet, Printer, TrendingUp, Target, Award, BookOpen } from 'lucide-react';
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
  const [currentStep, setCurrentStep] = useState(1);

  const { toast } = useToast();
  const { schoolId } = useSchoolScopedData();

  const reportTypes = [
    { 
      value: 'individual_student' as ReportType, 
      label: 'Individual Student Performance Report', 
      icon: GraduationCap,
      description: 'Comprehensive report for individual student performance',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    { 
      value: 'academic_performance' as ReportType, 
      label: 'Academic Performance Summary', 
      icon: BarChart3,
      description: 'Overall academic performance across all classes and subjects',
      color: 'bg-green-50 hover:bg-green-100 border-green-200'
    },
    { 
      value: 'attendance_summary' as ReportType, 
      label: 'Attendance Summary Report', 
      icon: Calendar,
      description: 'Student attendance patterns and statistics',
      color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200'
    },
    { 
      value: 'financial_performance' as ReportType, 
      label: 'Financial Performance Report', 
      icon: DollarSign,
      description: 'Fee collection, expenses, and financial analytics',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
    },
    { 
      value: 'class_performance' as ReportType, 
      label: 'Class Performance Report', 
      icon: Users,
      description: 'Class-wise performance analysis and comparison',
      color: 'bg-orange-50 hover:bg-orange-100 border-orange-200'
    },
    { 
      value: 'subject_performance' as ReportType, 
      label: 'Subject Performance Report', 
      icon: BookOpen,
      description: 'Subject-wise performance trends and insights',
      color: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200'
    }
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
    if (school?.address) {
      doc.text(school.address, 20, 28);
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
        case 'individual_student':
          if (!selectedStudent) {
            toast({
              title: "Student Required",
              description: "Please select a student for individual reports.",
              variant: "destructive"
            });
            return;
          }

          const { data: studentData } = await supabase
            .from('students')
            .select(`
              *,
              classes!students_class_id_fkey(name, level),
              grades!grades_student_id_fkey(
                score, max_score, percentage, letter_grade, term,
                subjects!grades_subject_id_fkey(name)
              ),
              fees!fees_student_id_fkey(amount, paid_amount, status, category, term)
            `)
            .eq('id', selectedStudent)
            .eq('school_id', schoolId)
            .single();

          if (studentData) {
            data = studentData.grades?.map(g => ({
              'Student Name': studentData.name,
              'Admission Number': studentData.admission_number,
              'Class': studentData.classes?.name,
              'Subject': g.subjects?.name,
              'Score': g.score,
              'Max Score': g.max_score,
              'Percentage': g.percentage,
              'Grade': g.letter_grade,
              'Term': g.term
            })) || [];
          }
          sheetName = 'Student_Performance';
          break;

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

  const generateReport = async (format: 'pdf' | 'excel' | 'print') => {
    if (reportType === 'individual_student' && !selectedStudent) {
      toast({
        title: "Student Required",
        description: "Please select a student for individual reports.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      if (format === 'pdf') {
        await generatePDFReport();
      } else if (format === 'excel') {
        await generateExcelReport();
      } else if (format === 'print') {
        // Generate PDF and open print dialog
        await generatePDFReport();
        setTimeout(() => window.print(), 1000);
      }
      onReportGenerated?.();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            School Reports Generator
          </DialogTitle>
          <DialogDescription className="text-base">
            Generate comprehensive reports for your school's academic and administrative data with professional formatting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-muted'}`}>
                1
              </div>
              <span className="ml-2 font-medium">Select Type</span>
            </div>
            <div className={`w-12 h-0.5 ${currentStep > 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-muted'}`}>
                2
              </div>
              <span className="ml-2 font-medium">Configure</span>
            </div>
            <div className={`w-12 h-0.5 ${currentStep > 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center ${currentStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 3 ? 'bg-primary text-white' : 'bg-muted'}`}>
                3
              </div>
              <span className="ml-2 font-medium">Generate</span>
            </div>
          </div>

          {/* Step 1: Report Type Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Choose Your Report Type</h3>
                <p className="text-muted-foreground">Select the type of report you want to generate</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Card
                      key={type.value}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${
                        reportType === type.value 
                          ? 'ring-2 ring-primary border-primary shadow-lg' 
                          : type.color
                      }`}
                      onClick={() => {
                        setReportType(type.value);
                        setCurrentStep(2);
                      }}
                    >
                      <CardContent className="p-6 text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
                          <Icon className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-2">{type.label}</h3>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                        </div>
                        {reportType === type.value && (
                          <Badge className="bg-primary text-white">Selected</Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex justify-center">
                <Button 
                  onClick={() => setCurrentStep(2)} 
                  disabled={!reportType}
                  size="lg"
                  className="px-8"
                >
                  Continue to Configuration
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Configuration */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Configure Report Parameters</h3>
                <p className="text-muted-foreground">Set up filters and options for your report</p>
              </div>

              <Card className="border-2">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Report Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Basic Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="academic-year" className="text-sm font-medium">Academic Year</Label>
                      <Select value={academicYear} onValueChange={setAcademicYear}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select Academic Year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2022">2022</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="term" className="text-sm font-medium">Term</Label>
                      <Select value={term} onValueChange={setTerm}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select Term (Optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {terms.map(termOption => (
                            <SelectItem key={termOption} value={termOption}>
                              {termOption}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {reportType === 'individual_student' && (
                      <div className="space-y-2">
                        <Label htmlFor="student" className="text-sm font-medium">Student *</Label>
                        <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select Student" />
                          </SelectTrigger>
                          <SelectContent>
                            {students.map(student => (
                              <SelectItem key={student.id} value={student.id}>
                                {student.name} ({student.admission_number})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Class Selection for certain report types */}
                  {['academic_performance', 'attendance_summary', 'class_performance', 'subject_performance'].includes(reportType) && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Select Classes</Label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedClasses(classes.map(c => c.id))}
                          >
                            Select All
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedClasses([])}
                          >
                            Clear All
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-4 border rounded-lg bg-muted/20">
                        {classes.map(classItem => (
                          <div key={classItem.id} className="flex items-center space-x-2 p-2 hover:bg-white rounded">
                            <Checkbox
                              id={classItem.id}
                              checked={selectedClasses.includes(classItem.id)}
                              onCheckedChange={(checked) => handleClassSelection(classItem.id, checked as boolean)}
                            />
                            <Label htmlFor={classItem.id} className="text-sm cursor-pointer flex-1">
                              {classItem.name}
                              {classItem.level && (
                                <span className="text-xs text-muted-foreground block">Level {classItem.level}</span>
                              )}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {selectedClasses.length === 0 && (
                        <p className="text-sm text-muted-foreground">No classes selected - will include all classes</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back to Report Types
                </Button>
                <Button 
                  onClick={() => setCurrentStep(3)}
                  disabled={reportType === 'individual_student' && !selectedStudent}
                  size="lg"
                >
                  Continue to Generate
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Generation */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Generate Your Report</h3>
                <p className="text-muted-foreground">Choose your preferred format and generate the report</p>
              </div>

              {/* Report Summary */}
              <Card className="border-2 border-primary/20">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Report Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Report Type:</span>
                      <p className="font-semibold">{reportTypes.find(r => r.value === reportType)?.label}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">School:</span>
                      <p className="font-semibold">{school?.name || 'Loading...'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Academic Year:</span>
                      <p className="font-semibold">{academicYear || 'All Years'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Term:</span>
                      <p className="font-semibold">{term || 'All Terms'}</p>
                    </div>
                    {reportType === 'individual_student' && selectedStudent && (
                      <div className="md:col-span-2">
                        <span className="text-sm font-medium text-muted-foreground">Student:</span>
                        <p className="font-semibold">
                          {students.find(s => s.id === selectedStudent)?.name} 
                          ({students.find(s => s.id === selectedStudent)?.admission_number})
                        </p>
                      </div>
                    )}
                    {selectedClasses.length > 0 && (
                      <div className="md:col-span-2">
                        <span className="text-sm font-medium text-muted-foreground">Selected Classes:</span>
                        <p className="font-semibold">
                          {selectedClasses.length === classes.length 
                            ? 'All Classes' 
                            : `${selectedClasses.length} classes selected`}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Generation Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <Button
                      onClick={() => generateReport('pdf')}
                      disabled={isGenerating || !schoolId}
                      className="w-full h-auto flex-col py-6"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-8 w-8 animate-spin mb-2" />
                          <span>Generating PDF...</span>
                        </>
                      ) : (
                        <>
                          <FileText className="h-8 w-8 mb-2" />
                          <span>Generate PDF Report</span>
                          <span className="text-xs opacity-75 mt-1">Professional formatting</span>
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <Button
                      onClick={() => generateReport('excel')}
                      disabled={isGenerating || !schoolId}
                      variant="outline"
                      className="w-full h-auto flex-col py-6"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-8 w-8 animate-spin mb-2" />
                          <span>Generating Excel...</span>
                        </>
                      ) : (
                        <>
                          <FileSpreadsheet className="h-8 w-8 mb-2" />
                          <span>Generate Excel Report</span>
                          <span className="text-xs opacity-75 mt-1">Data analysis ready</span>
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <Button
                      onClick={() => generateReport('print')}
                      disabled={isGenerating || !schoolId}
                      variant="outline"
                      className="w-full h-auto flex-col py-6"
                      size="lg"
                    >
                      <Printer className="h-8 w-8 mb-2" />
                      <span>Print Report</span>
                      <span className="text-xs opacity-75 mt-1">Direct printing</span>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Back to Configuration
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrincipalReportGenerator;