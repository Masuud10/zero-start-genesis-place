
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
import { FileText, Download, Loader2, BarChart3, Users, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface PrincipalReportGeneratorProps {
  open?: boolean;
  onClose?: () => void;
  onReportGenerated?: () => void;
}

type ReportType = 'academic_performance' | 'attendance_summary' | 'class_overview' | 'student_list';

const PrincipalReportGenerator: React.FC<PrincipalReportGeneratorProps> = ({
  open = false,
  onClose,
  onReportGenerated
}) => {
  const [reportType, setReportType] = useState<ReportType>('academic_performance');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [academicYear, setAcademicYear] = useState('');
  const [term, setTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { toast } = useToast();
  const { schoolId } = useSchoolScopedData();

  const reportTypes = [
    { value: 'academic_performance', label: 'Academic Performance Report', icon: BarChart3 },
    { value: 'attendance_summary', label: 'Attendance Summary Report', icon: Calendar },
    { value: 'class_overview', label: 'Class Overview Report', icon: Users },
    { value: 'student_list', label: 'Student List Report', icon: FileText }
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

  const generateAcademicPerformanceReport = async (doc: jsPDF) => {
    const { data: grades } = await supabase
      .from('grades')
      .select(`
        *,
        students!grades_student_id_fkey(name, admission_number),
        subjects!grades_subject_id_fkey(name),
        classes!grades_class_id_fkey(name)
      `)
      .eq('school_id', schoolId)
      .in('class_id', selectedClasses)
      .eq('status', 'released')
      .order('created_at', { ascending: false });

    if (!grades?.length) {
      doc.text('No academic performance data available for the selected criteria.', 20, 80);
      return;
    }

    // Group by class and subject
    const classPerformance: Record<string, any[]> = {};
    grades.forEach(grade => {
      const className = grade.classes?.name || 'Unknown Class';
      if (!classPerformance[className]) {
        classPerformance[className] = [];
      }
      classPerformance[className].push(grade);
    });

    let yPosition = 80;

    Object.entries(classPerformance).forEach(([className, classGrades]) => {
      // Class header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`Class: ${className}`, 20, yPosition);
      yPosition += 10;

      // Calculate class statistics
      const totalScores = classGrades.reduce((sum, grade) => sum + (grade.score || 0), 0);
      const averageScore = totalScores / classGrades.length;
      const totalStudents = new Set(classGrades.map(g => g.student_id)).size;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Students: ${totalStudents}`, 20, yPosition);
      doc.text(`Average Score: ${averageScore.toFixed(1)}%`, 120, yPosition);
      yPosition += 20;

      // Subject performance table
      const subjectData = classGrades.reduce((acc: Record<string, any>, grade) => {
        const subjectName = grade.subjects?.name || 'Unknown Subject';
        if (!acc[subjectName]) {
          acc[subjectName] = { scores: [], count: 0, total: 0 };
        }
        acc[subjectName].scores.push(grade.score || 0);
        acc[subjectName].count++;
        acc[subjectName].total += grade.score || 0;
        return acc;
      }, {});

      const tableData = Object.entries(subjectData).map(([subject, data]: [string, any]) => [
        subject,
        data.count,
        (data.total / data.count).toFixed(1) + '%',
        Math.max(...data.scores) + '%',
        Math.min(...data.scores) + '%'
      ]);

      (doc as any).autoTable({
        startY: yPosition,
        head: [['Subject', 'Students', 'Average', 'Highest', 'Lowest']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;

      // Add new page if needed
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
    });
  };

  const generateAttendanceReport = async (doc: jsPDF) => {
    const { data: attendance } = await supabase
      .from('attendance')
      .select(`
        *,
        students!attendance_student_id_fkey(name, admission_number),
        classes!attendance_class_id_fkey(name)
      `)
      .eq('school_id', schoolId)
      .in('class_id', selectedClasses)
      .order('date', { ascending: false });

    if (!attendance?.length) {
      doc.text('No attendance data available for the selected criteria.', 20, 80);
      return;
    }

    // Group by class
    const classAttendance: Record<string, any[]> = {};
    attendance.forEach(record => {
      const className = record.classes?.name || 'Unknown Class';
      if (!classAttendance[className]) {
        classAttendance[className] = [];
      }
      classAttendance[className].push(record);
    });

    let yPosition = 80;

    Object.entries(classAttendance).forEach(([className, records]) => {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`Class: ${className}`, 20, yPosition);
      yPosition += 15;

      // Calculate attendance statistics
      const totalRecords = records.length;
      const presentCount = records.filter(r => r.status === 'present').length;
      const absentCount = records.filter(r => r.status === 'absent').length;
      const lateCount = records.filter(r => r.status === 'late').length;
      const attendanceRate = (presentCount / totalRecords * 100).toFixed(1);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Records: ${totalRecords}`, 20, yPosition);
      doc.text(`Present: ${presentCount}`, 20, yPosition + 10);
      doc.text(`Absent: ${absentCount}`, 80, yPosition + 10);
      doc.text(`Late: ${lateCount}`, 140, yPosition + 10);
      doc.text(`Attendance Rate: ${attendanceRate}%`, 20, yPosition + 20);
      
      yPosition += 40;

      // Add new page if needed
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
    });
  };

  const generateClassOverviewReport = async (doc: jsPDF) => {
    const selectedClassesData = classes.filter(cls => selectedClasses.includes(cls.id));
    
    let yPosition = 80;

    for (const classInfo of selectedClassesData) {
      // Get students count
      const { count: studentsCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', classInfo.id)
        .eq('school_id', schoolId);

      // Get subjects count
      const { count: subjectsCount } = await supabase
        .from('subjects')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', classInfo.id)
        .eq('school_id', schoolId);

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`Class: ${classInfo.name}`, 20, yPosition);
      
      if (classInfo.stream) {
        doc.text(`Stream: ${classInfo.stream}`, 120, yPosition);
      }
      
      yPosition += 15;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Level: ${classInfo.level || 'Not specified'}`, 20, yPosition);
      doc.text(`Total Students: ${studentsCount || 0}`, 20, yPosition + 10);
      doc.text(`Total Subjects: ${subjectsCount || 0}`, 20, yPosition + 20);
      
      yPosition += 40;

      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
    }
  };

  const generateStudentListReport = async (doc: jsPDF) => {
    const { data: students } = await supabase
      .from('students')
      .select(`
        *,
        classes!students_class_id_fkey(name)
      `)
      .eq('school_id', schoolId)
      .in('class_id', selectedClasses)
      .order('name');

    if (!students?.length) {
      doc.text('No students found for the selected classes.', 20, 80);
      return;
    }

    // Group by class
    const studentsByClass: Record<string, any[]> = {};
    students.forEach(student => {
      const className = student.classes?.name || 'Unknown Class';
      if (!studentsByClass[className]) {
        studentsByClass[className] = [];
      }
      studentsByClass[className].push(student);
    });

    let yPosition = 80;

    Object.entries(studentsByClass).forEach(([className, classStudents]) => {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`Class: ${className}`, 20, yPosition);
      yPosition += 15;

      const tableData = classStudents.map((student, index) => [
        index + 1,
        student.name,
        student.admission_number,
        student.roll_number || 'N/A',
        student.gender || 'N/A'
      ]);

      (doc as any).autoTable({
        startY: yPosition,
        head: [['#', 'Name', 'Admission No.', 'Roll No.', 'Gender']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;

      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
    });
  };

  const generateReport = async () => {
    if (!selectedClasses.length) {
      toast({
        title: "No Classes Selected",
        description: "Please select at least one class.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFillColor(41, 128, 185);
      doc.rect(0, 0, 210, 25, 'F');
      
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(school?.name || 'School Report', 20, 16);
      
      // Report details
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      const selectedReportType = reportTypes.find(r => r.value === reportType);
      doc.text(selectedReportType?.label || 'Report', 20, 40);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 50);
      doc.text(`Academic Year: ${academicYear || 'Current'}`, 20, 60);
      if (term) {
        doc.text(`Term: ${term}`, 120, 60);
      }

      // Generate content based on report type
      switch (reportType) {
        case 'academic_performance':
          await generateAcademicPerformanceReport(doc);
          break;
        case 'attendance_summary':
          await generateAttendanceReport(doc);
          break;
        case 'class_overview':
          await generateClassOverviewReport(doc);
          break;
        case 'student_list':
          await generateStudentListReport(doc);
          break;
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} of ${pageCount}`, 180, 290);
        doc.text(`Generated by EduFam - ${school?.name}`, 20, 290);
      }

      // Save the PDF
      const fileName = `${selectedReportType?.label.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast({
        title: "Report Generated",
        description: "Your report has been generated and downloaded successfully.",
      });

      onReportGenerated?.();
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setReportType('academic_performance');
    setSelectedClasses([]);
    setAcademicYear('');
    setTerm('');
    onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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

          <Card>
            <CardHeader>
              <CardTitle>Select Classes</CardTitle>
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

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose} disabled={isGenerating}>
              Cancel
            </Button>
            <Button onClick={generateReport} disabled={isGenerating || selectedClasses.length === 0}>
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrincipalReportGenerator;
