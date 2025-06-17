
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useReports } from '@/hooks/useReports';
import { FileText, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ReportGenerationForm = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { 
    generateStudentReport, 
    generateClassReport, 
    isGeneratingStudent, 
    isGeneratingClass,
    availableReportTypes 
  } = useReports();

  const [reportType, setReportType] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [term, setTerm] = useState('');

  // Fetch classes
  const { data: classes } = useQuery({
    queryKey: ['classes', schoolId],
    queryFn: async () => {
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

  // Fetch students for selected class
  const { data: students } = useQuery({
    queryKey: ['students', selectedClass],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, admission_number')
        .eq('class_id', selectedClass)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedClass
  });

  const handleGenerate = () => {
    if (reportType === 'individual_academic') {
      generateStudentReport({
        report_type: 'individual_academic',
        student_id: selectedStudent,
        academic_year: academicYear,
        term: term || undefined,
        filters: { class_id: selectedClass }
      });
    } else if (reportType === 'class_academic') {
      generateClassReport({
        report_type: 'class_academic',
        class_id: selectedClass,
        academic_year: academicYear,
        term: term || undefined,
        filters: {}
      });
    }
  };

  const canGenerate = reportType && academicYear && 
    (reportType === 'class_academic' ? selectedClass : (selectedClass && selectedStudent));

  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'individual_academic': 'Individual Academic Report',
      'class_academic': 'Class Academic Report',
      'financial': 'Financial Report',
      'attendance': 'Attendance Report'
    };
    return labels[type] || type;
  };

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
            <label className="text-sm font-medium">Report Type</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {availableReportTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getReportTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Academic Year</label>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Term (Optional)</label>
            <Select value={term} onValueChange={setTerm}>
              <SelectTrigger>
                <SelectValue placeholder="All terms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Terms</SelectItem>
                <SelectItem value="Term 1">Term 1</SelectItem>
                <SelectItem value="Term 2">Term 2</SelectItem>
                <SelectItem value="Term 3">Term 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Class</label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes?.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} {cls.stream && `- ${cls.stream}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {reportType === 'individual_academic' && selectedClass && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Student</label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
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

        <Button 
          onClick={handleGenerate} 
          disabled={!canGenerate || isGeneratingStudent || isGeneratingClass}
          className="w-full"
        >
          {(isGeneratingStudent || isGeneratingClass) ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ReportGenerationForm;
