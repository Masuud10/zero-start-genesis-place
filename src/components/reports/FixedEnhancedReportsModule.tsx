import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { FileText, Download, Calendar, Users, GraduationCap, DollarSign, BookOpen } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ReportConfig {
  id: string;
  title: string;
  description: string;
  icon: any;
  roles: string[];
  dataRequirements: string[];
}

interface FixedEnhancedReportsModuleProps {
  userRole: string;
}

const FixedEnhancedReportsModule: React.FC<FixedEnhancedReportsModuleProps> = ({ userRole }) => {
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [filters, setFilters] = useState({
    academicYear: new Date().getFullYear().toString(),
    term: '',
    classId: '',
    startDate: '',
    endDate: ''
  });
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();

  // Define available reports based on user roles
  const reportConfigs: ReportConfig[] = [
    {
      id: 'academic_performance',
      title: 'Academic Performance Report',
      description: 'Student grades and academic progress analysis',
      icon: GraduationCap,
      roles: ['teacher', 'principal', 'school_owner', 'edufam_admin'],
      dataRequirements: ['grades', 'students', 'subjects']
    },
    {
      id: 'attendance_summary',
      title: 'Attendance Summary Report',
      description: 'Student attendance patterns and statistics',
      icon: Calendar,
      roles: ['teacher', 'principal', 'school_owner', 'edufam_admin'],
      dataRequirements: ['attendance', 'students', 'classes']
    },
    {
      id: 'financial_summary',
      title: 'Financial Summary Report',
      description: 'Fee collections, expenses, and financial overview',
      icon: DollarSign,
      roles: ['finance_officer', 'principal', 'school_owner', 'edufam_admin'],
      dataRequirements: ['fees', 'financial_transactions', 'expenses']
    },
    {
      id: 'student_individual',
      title: 'Individual Student Report',
      description: 'Comprehensive individual student progress report',
      icon: Users,
      roles: ['teacher', 'principal', 'school_owner', 'parent', 'edufam_admin'],
      dataRequirements: ['students', 'grades', 'attendance', 'fees']
    },
    {
      id: 'class_performance',
      title: 'Class Performance Report',
      description: 'Class-wide academic performance and statistics',
      icon: BookOpen,
      roles: ['teacher', 'principal', 'school_owner', 'edufam_admin'],
      dataRequirements: ['classes', 'students', 'grades', 'subjects']
    }
  ];

  // Filter reports based on user role
  const availableReports = reportConfigs.filter(report => 
    report.roles.includes(userRole)
  );

  useEffect(() => {
    fetchAvailableClasses();
    initializeFilters();
  }, [schoolId]);

  const fetchAvailableClasses = async () => {
    if (!schoolId) return;

    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, level, stream')
        .eq('school_id', schoolId)
        .order('name');

      if (error) throw error;
      setAvailableClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const initializeFilters = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    
    setFilters({
      academicYear: currentYear.toString(),
      term: 'Term 1',
      classId: '',
      startDate: startOfYear.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    });
  };

  const generateReport = async (format: 'pdf' | 'excel') => {
    if (!selectedReport) {
      toast({
        title: "No Report Selected",
        description: "Please select a report type first",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const reportConfig = reportConfigs.find(r => r.id === selectedReport);
      if (!reportConfig) throw new Error('Invalid report configuration');

      // Fetch required data based on report type
      const reportData = await fetchReportData(reportConfig);
      
      if (format === 'excel') {
        await generateExcelReport(reportConfig, reportData);
      } else {
        await generatePDFReport(reportConfig, reportData);
      }

      toast({
        title: "Report Generated",
        description: `${reportConfig.title} has been generated successfully`,
      });

    } catch (error: any) {
      console.error('Error generating report:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReportData = async (reportConfig: ReportConfig) => {
    const data: any = {};

    try {
      // Fetch data based on requirements with proper typing
      for (const requirement of reportConfig.dataRequirements) {
        try {
          let tableData: any[] = [];
          
          if (requirement === 'grades') {
            let query = supabase.from('grades').select('*');
            if (userRole !== 'edufam_admin' && schoolId) query = query.eq('school_id', schoolId);
            if (filters.classId) query = query.eq('class_id', filters.classId);
            const { data, error } = await query.limit(1000);
            if (error) throw error;
            tableData = data || [];
          } else if (requirement === 'students') {
            let query = supabase.from('students').select('*');
            if (userRole !== 'edufam_admin' && schoolId) query = query.eq('school_id', schoolId);
            if (filters.classId) query = query.eq('class_id', filters.classId);
            const { data, error } = await query.limit(1000);
            if (error) throw error;
            tableData = data || [];
          } else if (requirement === 'attendance') {
            let query = supabase.from('attendance').select('*');
            if (userRole !== 'edufam_admin' && schoolId) query = query.eq('school_id', schoolId);
            if (filters.classId) query = query.eq('class_id', filters.classId);
            const { data, error } = await query.limit(1000);
            if (error) throw error;
            tableData = data || [];
          } else if (requirement === 'financial_transactions') {
            let query = supabase.from('financial_transactions').select('*');
            if (userRole !== 'edufam_admin' && schoolId) query = query.eq('school_id', schoolId);
            const { data, error } = await query.limit(1000);
            if (error) throw error;
            tableData = data || [];
          }
          
          data[requirement] = tableData;
        } catch (error) {
          console.error(`Error fetching ${requirement}:`, error);
          data[requirement] = [];
        }
      }

      // Fetch additional reference data
      if (schoolId) {
        const { data: schoolData } = await supabase
          .from('schools')
          .select('*')
          .eq('id', schoolId)
          .single();
        data.school = schoolData;
      }

      return data;
    } catch (error) {
      console.error('Error fetching report data:', error);
      throw error;
    }
  };

  const generateExcelReport = async (reportConfig: ReportConfig, data: any) => {
    const timestamp = new Date().toISOString().split('T')[0];
    let csvContent = '';

    // Generate CSV based on report type
    switch (reportConfig.id) {
      case 'academic_performance':
        csvContent = [
          [`${reportConfig.title}`, ''],
          ['School', data.school?.name || 'N/A'],
          ['Generated', new Date().toLocaleDateString()],
          ['Academic Year', filters.academicYear],
          ['Term', filters.term || 'All Terms'],
          [''],
          ['Student Name', 'Admission Number', 'Class', 'Subject', 'Score', 'Grade', 'Status'],
          ...(data.grades || []).map((grade: any) => [
            grade.student_name || '',
            grade.admission_number || '',
            grade.class_name || '',
            grade.subject_name || '',
            grade.score || '',
            grade.letter_grade || '',
            grade.status || ''
          ])
        ].map(row => row.join(',')).join('\n');
        break;

      case 'attendance_summary':
        csvContent = [
          [`${reportConfig.title}`, ''],
          ['School', data.school?.name || 'N/A'],
          ['Generated', new Date().toLocaleDateString()],
          ['Period', `${filters.startDate} to ${filters.endDate}`],
          [''],
          ['Student Name', 'Class', 'Present Days', 'Absent Days', 'Attendance Rate'],
          ...(data.students || []).map((student: any) => {
            const attendanceRecords = (data.attendance || []).filter((a: any) => a.student_id === student.id);
            const presentDays = attendanceRecords.filter((a: any) => a.status === 'present').length;
            const totalDays = attendanceRecords.length;
            const rate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
            
            return [
              student.name,
              student.class_name || '',
              presentDays,
              totalDays - presentDays,
              `${rate}%`
            ];
          })
        ].map(row => row.join(',')).join('\n');
        break;

      case 'financial_summary':
        const totalRevenue = (data.financial_transactions || []).reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
        const totalExpenses = (data.expenses || []).reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
        
        csvContent = [
          [`${reportConfig.title}`, ''],
          ['School', data.school?.name || 'N/A'],
          ['Generated', new Date().toLocaleDateString()],
          ['Period', `${filters.startDate} to ${filters.endDate}`],
          [''],
          ['Summary', ''],
          ['Total Revenue', `KES ${totalRevenue.toLocaleString()}`],
          ['Total Expenses', `KES ${totalExpenses.toLocaleString()}`],
          ['Net Profit', `KES ${(totalRevenue - totalExpenses).toLocaleString()}`],
          [''],
          ['Transactions', ''],
          ['Date', 'Type', 'Amount', 'Description'],
          ...(data.financial_transactions || []).map((transaction: any) => [
            new Date(transaction.created_at).toLocaleDateString(),
            transaction.transaction_type,
            `KES ${transaction.amount}`,
            transaction.description || ''
          ])
        ].map(row => row.join(',')).join('\n');
        break;

      default:
        csvContent = [
          [`${reportConfig.title}`, ''],
          ['Generated', new Date().toLocaleDateString()],
          ['Report Type', reportConfig.id],
          ['Status', 'Generated Successfully']
        ].map(row => row.join(',')).join('\n');
    }

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eduFam-${reportConfig.id}-${timestamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const generatePDFReport = async (reportConfig: ReportConfig, data: any) => {
    const timestamp = new Date().toISOString().split('T')[0];
    
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportConfig.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; }
          .logo { font-size: 32px; font-weight: bold; color: #3b82f6; margin-bottom: 5px; }
          .school-name { font-size: 20px; color: #1f2937; margin-bottom: 10px; }
          .report-title { font-size: 24px; margin: 10px 0; color: #1f2937; }
          .report-meta { color: #6b7280; font-size: 14px; }
          .section { margin: 30px 0; }
          .section-title { font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; font-size: 12px; }
          th { background: #f3f4f6; font-weight: bold; color: #1f2937; }
          .summary-card { background: #f8fafc; padding: 15px; border-radius: 6px; margin: 10px 0; border-left: 4px solid #3b82f6; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
          @media print { body { margin: 0; } .header { page-break-inside: avoid; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🎓 EduFam Platform</div>
          <div class="school-name">${data.school?.name || 'School Report'}</div>
          <div class="report-title">${reportConfig.title}</div>
          <div class="report-meta">
            Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}<br>
            Academic Year: ${filters.academicYear} | Period: ${filters.startDate} to ${filters.endDate}
          </div>
        </div>
    `;

    // Add content based on report type
    switch (reportConfig.id) {
      case 'academic_performance':
        const totalGrades = (data.grades || []).length;
        const averageScore = totalGrades > 0 
          ? (data.grades || []).reduce((sum: number, g: any) => sum + (g.percentage || 0), 0) / totalGrades 
          : 0;

        htmlContent += `
          <div class="section">
            <div class="section-title">Performance Summary</div>
            <div class="summary-card">
              <strong>Total Grades Recorded:</strong> ${totalGrades}<br>
              <strong>Class Average:</strong> ${averageScore.toFixed(1)}%<br>
              <strong>Reporting Period:</strong> ${filters.academicYear} - ${filters.term || 'All Terms'}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Grade Details</div>
            <table>
              <thead>
                <tr><th>Student</th><th>Subject</th><th>Score</th><th>Grade</th><th>Status</th></tr>
              </thead>
              <tbody>
                ${(data.grades || []).slice(0, 50).map((grade: any) => `
                  <tr>
                    <td>${grade.student_name || 'N/A'}</td>
                    <td>${grade.subject_name || 'N/A'}</td>
                    <td>${grade.score || 0}/${grade.max_score || 100}</td>
                    <td>${grade.letter_grade || 'N/A'}</td>
                    <td>${grade.status || 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
        break;

      case 'attendance_summary':
        const totalStudents = (data.students || []).length;
        const avgAttendance = totalStudents > 0
          ? (data.students || []).reduce((sum: number, student: any) => {
              const attendanceRecords = (data.attendance || []).filter((a: any) => a.student_id === student.id);
              const rate = attendanceRecords.length > 0 
                ? (attendanceRecords.filter((a: any) => a.status === 'present').length / attendanceRecords.length) * 100 
                : 0;
              return sum + rate;
            }, 0) / totalStudents
          : 0;

        htmlContent += `
          <div class="section">
            <div class="section-title">Attendance Overview</div>
            <div class="summary-card">
              <strong>Total Students:</strong> ${totalStudents}<br>
              <strong>Average Attendance Rate:</strong> ${avgAttendance.toFixed(1)}%<br>
              <strong>Period:</strong> ${filters.startDate} to ${filters.endDate}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Student Attendance Details</div>
            <table>
              <thead>
                <tr><th>Student Name</th><th>Class</th><th>Present Days</th><th>Total Days</th><th>Attendance Rate</th></tr>
              </thead>
              <tbody>
                ${(data.students || []).slice(0, 30).map((student: any) => {
                  const attendanceRecords = (data.attendance || []).filter((a: any) => a.student_id === student.id);
                  const presentDays = attendanceRecords.filter((a: any) => a.status === 'present').length;
                  const totalDays = attendanceRecords.length;
                  const rate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
                  
                  return `
                    <tr>
                      <td>${student.name}</td>
                      <td>${student.class_name || 'N/A'}</td>
                      <td>${presentDays}</td>
                      <td>${totalDays}</td>
                      <td>${rate}%</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `;
        break;

      case 'financial_summary':
        const totalRevenue = (data.financial_transactions || []).reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
        const totalExpenses = (data.expenses || []).reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
        const netProfit = totalRevenue - totalExpenses;

        htmlContent += `
          <div class="section">
            <div class="section-title">Financial Overview</div>
            <div class="summary-card">
              <strong>Total Revenue:</strong> KES ${totalRevenue.toLocaleString()}<br>
              <strong>Total Expenses:</strong> KES ${totalExpenses.toLocaleString()}<br>
              <strong>Net Profit:</strong> KES ${netProfit.toLocaleString()}<br>
              <strong>Period:</strong> ${filters.startDate} to ${filters.endDate}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Recent Transactions</div>
            <table>
              <thead>
                <tr><th>Date</th><th>Type</th><th>Amount</th><th>Description</th></tr>
              </thead>
              <tbody>
                ${(data.financial_transactions || []).slice(0, 20).map((transaction: any) => `
                  <tr>
                    <td>${new Date(transaction.created_at).toLocaleDateString()}</td>
                    <td>${transaction.transaction_type}</td>
                    <td>KES ${(transaction.amount || 0).toLocaleString()}</td>
                    <td>${transaction.description || 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
        break;

      default:
        htmlContent += `
          <div class="section">
            <div class="summary-card">
              <strong>Report Status:</strong> Generated Successfully<br>
              <strong>Data Included:</strong> ${reportConfig.dataRequirements.join(', ')}
            </div>
          </div>
        `;
    }

    htmlContent += `
        <div class="footer">
          <p><strong>Generated by EduFam Platform</strong></p>
          <p>Report ID: ${reportConfig.id} | Generated: ${new Date().toISOString()}</p>
          <p><em>This report contains confidential information. Handle with care.</em></p>
        </div>
      </body>
      </html>
    `;

    // Download HTML file (user can save as PDF)
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eduFam-${reportConfig.id}-${timestamp}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <Alert>
        <AlertDescription>Please log in to access reports.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Report Generation</h2>
        <p className="text-muted-foreground">Generate comprehensive reports for {userRole.replace('_', ' ')} access level</p>
      </div>

      {/* Report Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Report Type</CardTitle>
          <CardDescription>Choose from available reports based on your role and permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableReports.map((report) => (
              <Card 
                key={report.id}
                className={`cursor-pointer transition-all ${
                  selectedReport === report.id 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedReport(report.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <report.icon className="h-8 w-8 text-primary mt-1" />
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{report.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {report.roles.slice(0, 3).map((role) => (
                          <Badge key={role} variant="secondary" className="text-xs">
                            {role.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Configuration */}
      {selectedReport && (
        <Card>
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
            <CardDescription>Configure filters and parameters for your report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Academic Year</Label>
                <Select value={filters.academicYear} onValueChange={(value) => setFilters({...filters, academicYear: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {[2024, 2023, 2022].map((year) => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Term</Label>
                <Select value={filters.term} onValueChange={(value) => setFilters({...filters, term: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Terms</SelectItem>
                    <SelectItem value="Term 1">Term 1</SelectItem>
                    <SelectItem value="Term 2">Term 2</SelectItem>
                    <SelectItem value="Term 3">Term 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {availableClasses.length > 0 && (
                <div className="space-y-2">
                  <Label>Class (Optional)</Label>
                  <Select value={filters.classId} onValueChange={(value) => setFilters({...filters, classId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Classes</SelectItem>
                      {availableClasses.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} {cls.level} {cls.stream}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                onClick={() => generateReport('pdf')} 
                disabled={loading || !selectedReport}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                {loading ? 'Generating...' : 'Generate PDF'}
              </Button>
              <Button 
                onClick={() => generateReport('excel')} 
                disabled={loading || !selectedReport}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {loading ? 'Generating...' : 'Export Excel'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FixedEnhancedReportsModule;