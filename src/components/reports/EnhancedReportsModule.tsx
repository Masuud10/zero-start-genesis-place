import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Download, Calendar, BarChart3, Users, GraduationCap, DollarSign, BookOpen, User, School, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ReportType {
  value: string;
  label: string;
  description: string;
  icon: any;
  color: string;
  roles: string[];
}

interface EnhancedReportsModuleProps {
  userRole: string;
}

const EnhancedReportsModule: React.FC<EnhancedReportsModuleProps> = ({ userRole }) => {
  const [reportType, setReportType] = useState('');
  const [format, setFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState('current_term');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Define available reports per role
  const allReports: ReportType[] = [
    // Teacher Reports
    {
      value: 'grade_report',
      label: 'Grade Report',
      description: 'Generate grade reports for your classes',
      icon: GraduationCap,
      color: 'blue',
      roles: ['teacher', 'principal', 'school_owner']
    },
    {
      value: 'attendance_report',
      label: 'Attendance Report',
      description: 'Generate attendance reports for classes',
      icon: Users,
      color: 'green',
      roles: ['teacher', 'principal', 'school_owner']
    },
    
    // Principal/School Owner Reports
    {
      value: 'academic_performance',
      label: 'Academic Performance Report',
      description: 'Comprehensive academic analysis by class or school',
      icon: BarChart3,
      color: 'purple',
      roles: ['principal', 'school_owner']
    },
    {
      value: 'financial_summary',
      label: 'Financial Summary Report',
      description: 'Fee collection and financial overview',
      icon: DollarSign,
      color: 'yellow',
      roles: ['principal', 'school_owner', 'finance_officer']
    },
    {
      value: 'class_performance',
      label: 'Class Performance Report',
      description: 'Detailed class-wise performance analysis',
      icon: BookOpen,
      color: 'indigo',
      roles: ['principal', 'school_owner']
    },
    {
      value: 'subject_performance',
      label: 'Subject Performance Report',
      description: 'Subject-wise performance across all classes',
      icon: FileSpreadsheet,
      color: 'pink',
      roles: ['principal', 'school_owner']
    },
    {
      value: 'individual_student',
      label: 'Individual Student Report',
      description: 'Complete student academic and attendance record',
      icon: User,
      color: 'cyan',
      roles: ['principal', 'school_owner', 'parent']
    },
    
    // Finance Officer Reports
    {
      value: 'fee_collection',
      label: 'Fee Collection Report',
      description: 'Detailed fee collection analysis',
      icon: DollarSign,
      color: 'emerald',
      roles: ['finance_officer', 'principal', 'school_owner']
    },
    {
      value: 'payment_summary',
      label: 'Payment Summary Report',
      description: 'MPESA and other payment methods summary',
      icon: FileSpreadsheet,
      color: 'orange',
      roles: ['finance_officer', 'principal', 'school_owner']
    },
    
    // Parent Reports
    {
      value: 'child_progress',
      label: 'Child Progress Report',
      description: 'Your child\'s academic and attendance progress',
      icon: User,
      color: 'teal',
      roles: ['parent']
    },
    
    // System Reports
    {
      value: 'school_summary',
      label: 'School Summary Report',
      description: 'Complete school performance overview',
      icon: School,
      color: 'red',
      roles: ['edufam_admin']
    }
  ];

  // Filter reports based on user role
  const availableReports = allReports.filter(report => 
    report.roles.includes(userRole)
  );

  // Get data for dropdowns based on role
  const { data: classes } = useQuery({
    queryKey: ['classes', user?.school_id],
    queryFn: async () => {
      if (!user?.school_id || userRole === 'parent') return [];
      
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, level, stream')
        .eq('school_id', user.school_id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.school_id && userRole !== 'parent'
  });

  const { data: students } = useQuery({
    queryKey: ['students', user?.school_id, selectedClass],
    queryFn: async () => {
      if (!user?.school_id || userRole === 'teacher') return [];
      
      let query = supabase
        .from('students')
        .select('id, name, admission_number')
        .eq('school_id', user.school_id)
        .eq('is_active', true);

      if (selectedClass) {
        query = query.eq('class_id', selectedClass);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.school_id && userRole !== 'teacher' && reportType === 'individual_student'
  });

  const { data: parentChildren } = useQuery({
    queryKey: ['parent-children', user?.id],
    queryFn: async () => {
      if (userRole !== 'parent' || !user?.id) return [];
      
      const { data, error } = await supabase
        .from('parent_students')
        .select(`
          student_id,
          students!inner(id, name, admission_number)
        `)
        .eq('parent_id', user.id);

      if (error) throw error;
      return data?.map(ps => ({
        id: ps.students.id,
        name: ps.students.name,
        admission_number: ps.students.admission_number,
        class_name: 'Class Info'
      })) || [];
    },
    enabled: userRole === 'parent'
  });

  const handleGenerateReport = async () => {
    if (!reportType) {
      toast({
        title: "Missing Information",
        description: "Please select a report type.",
        variant: "destructive"
      });
      return;
    }

    // Validate required fields based on report type
    if (['grade_report', 'attendance_report', 'class_performance'].includes(reportType) && !selectedClass && userRole !== 'parent') {
      toast({
        title: "Missing Information",
        description: "Please select a class.",
        variant: "destructive"
      });
      return;
    }

    if (reportType === 'individual_student' && !selectedStudent && userRole !== 'parent') {
      toast({
        title: "Missing Information",
        description: "Please select a student.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Call backend API to generate report
      const reportData = {
        report_type: reportType,
        school_id: user?.school_id,
        class_id: selectedClass || null,
        student_id: selectedStudent || (userRole === 'parent' ? parentChildren?.[0]?.id : null),
        academic_year: new Date().getFullYear().toString(),
        term: dateRange === 'current_term' ? 'Term 1' : null,
        format: format,
        generated_by: user?.id,
        filters: {
          date_range: dateRange,
          user_role: userRole
        }
      };

      // Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const selectedReport = availableReports.find(r => r.value === reportType);
      
      toast({
        title: "Report Generated Successfully",
        description: `${selectedReport?.label} has been generated and will download shortly.`
      });

      // Here you would typically receive a download URL from the backend
      // For now, we'll simulate the file generation
      const fileName = `${selectedReport?.label.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${format}`;
      console.log('Generated report:', fileName);
      
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: "Report Generation Failed",
        description: "An error occurred while generating the report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getRoleTitle = () => {
    switch (userRole) {
      case 'teacher': return 'Teacher Reports';
      case 'principal': return 'Principal Reports';
      case 'school_owner': return 'School Owner Reports';
      case 'finance_officer': return 'Financial Reports';
      case 'parent': return 'Student Progress Reports';
      case 'edufam_admin': return 'System Reports';
      default: return 'Reports';
    }
  };

  const getRoleDescription = () => {
    switch (userRole) {
      case 'teacher': return 'Generate grade and attendance reports for your classes.';
      case 'principal': return 'Generate comprehensive academic and administrative reports.';
      case 'school_owner': return 'Access complete school performance and financial reports.';
      case 'finance_officer': return 'Generate detailed financial and fee collection reports.';
      case 'parent': return 'View your child\'s academic progress and attendance reports.';
      case 'edufam_admin': return 'Generate system-wide reports and analytics.';
      default: return 'Generate reports based on your access level.';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
          {getRoleTitle()}
        </h1>
        <p className="text-muted-foreground mt-1">
          {getRoleDescription()}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Select Report Type</Label>
            <div className="grid gap-3">
              {availableReports.map((report) => {
                const Icon = report.icon;
                return (
                  <div
                    key={report.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      reportType === report.value
                        ? `border-blue-500 bg-blue-50/50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setReportType(report.value)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 text-blue-600`} />
                        <div>
                          <h4 className="font-medium">{report.label}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {report.description}
                          </p>
                        </div>
                      </div>
                      {reportType === report.value && (
                        <Badge variant="default" className="bg-blue-600">
                          Selected
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filters based on report type and role */}
          {reportType && (
            <div className="space-y-4 p-4 bg-gray-50/50 rounded-lg">
              <h3 className="font-medium">Report Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Class Selection */}
                {(['grade_report', 'attendance_report', 'class_performance'].includes(reportType) && userRole !== 'parent') && (
                  <div>
                    <Label>Select Class</Label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes?.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name} ({cls.level} {cls.stream})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Student Selection */}
                {reportType === 'individual_student' && userRole !== 'parent' && (
                  <div>
                    <Label>Select Student</Label>
                    <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students?.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name} ({student.admission_number})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Parent Child Selection */}
                {userRole === 'parent' && parentChildren && parentChildren.length > 1 && (
                  <div>
                    <Label>Select Child</Label>
                    <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your child" />
                      </SelectTrigger>
                      <SelectContent>
                        {parentChildren.map((child) => (
                          <SelectItem key={child.id} value={child.id}>
                            {child.name} - {child.class_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Date Range */}
                <div>
                  <Label>Date Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current_term">Current Term</SelectItem>
                      <SelectItem value="current_year">Current Year</SelectItem>
                      <SelectItem value="last_term">Last Term</SelectItem>
                      <SelectItem value="last_year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Export Format */}
                <div>
                  <Label>Export Format</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          {reportType && (
            <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <School className="w-4 h-4" />
                <span>Reports include school logo, branding, and "Powered by EduFam" footer</span>
              </div>
              
              <Button 
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="flex items-center gap-2 min-w-[140px]"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-sm mb-1">Report Features</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Professional formatting with school branding</li>
                <li>• Real-time data from your school's database</li>
                <li>• Available in PDF and Excel formats</li>
                <li>• Printable and shareable documents</li>
                <li>• Secure access based on your role permissions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedReportsModule;