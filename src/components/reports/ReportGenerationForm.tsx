
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useReports } from '@/hooks/useReports';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { FileText, Users, DollarSign, CalendarCheck } from 'lucide-react';

const ReportGenerationForm = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { 
    generateStudentReport, 
    generateClassReport, 
    isGeneratingStudent, 
    isGeneratingClass,
    canGenerateReports,
    availableReportTypes 
  } = useReports();

  const [reportType, setReportType] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('');
  const [classId, setClassId] = useState<string>('');
  const [academicYear, setAcademicYear] = useState<string>(new Date().getFullYear().toString());
  const [term, setTerm] = useState<string>('');

  // Get students for the school
  const { data: students } = useQuery({
    queryKey: ['students', schoolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, admission_number, class_id')
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!schoolId && canGenerateReports,
  });

  // Get classes for the school
  const { data: classes } = useQuery({
    queryKey: ['classes', schoolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, level, stream')
        .eq('school_id', schoolId)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!schoolId && canGenerateReports,
  });

  if (!canGenerateReports) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">You don't have permission to generate reports.</p>
        </CardContent>
      </Card>
    );
  }

  const handleGenerateReport = () => {
    if (!reportType || !academicYear) return;

    const request = {
      report_type: reportType as any,
      academic_year: academicYear,
      term: term || undefined,
      filters: {}
    };

    if (reportType === 'individual_academic') {
      if (!studentId) return;
      generateStudentReport({ ...request, student_id: studentId });
    } else if (reportType === 'class_academic') {
      if (!classId) return;
      generateClassReport({ ...request, class_id: classId });
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'individual_academic':
        return <FileText className="h-4 w-4" />;
      case 'class_academic':
        return <Users className="h-4 w-4" />;
      case 'financial':
        return <DollarSign className="h-4 w-4" />;
      case 'attendance':
        return <CalendarCheck className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'individual_academic':
        return 'Individual Student Academic Report';
      case 'class_academic':
        return 'Class Academic Report';
      case 'financial':
        return 'Financial Report';
      case 'attendance':
        return 'Attendance Report';
      default:
        return type;
    }
  };

  const isGenerating = isGeneratingStudent || isGeneratingClass;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Generate New Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type *</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {availableReportTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center gap-2">
                      {getReportTypeIcon(type)}
                      {getReportTypeLabel(type)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="academicYear">Academic Year *</Label>
            <Select value={academicYear} onValueChange={setAcademicYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="term">Term (Optional)</Label>
            <Select value={term} onValueChange={setTerm}>
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

          {reportType === 'individual_academic' && (
            <div className="space-y-2">
              <Label htmlFor="student">Student *</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
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

          {reportType === 'class_academic' && (
            <div className="space-y-2">
              <Label htmlFor="class">Class *</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      {classItem.name} {classItem.stream && `- ${classItem.stream}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleGenerateReport}
            disabled={
              isGenerating ||
              !reportType ||
              !academicYear ||
              (reportType === 'individual_academic' && !studentId) ||
              (reportType === 'class_academic' && !classId)
            }
            className="min-w-[140px]"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Generating...
              </>
            ) : (
              'Generate Report'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportGenerationForm;
