
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { supabase } from '@/integrations/supabase/client';
import { usePrincipalEntityLists } from '@/hooks/usePrincipalEntityLists';
import { FileText, Download, BarChart3, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ReportsGenerator = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { classList } = usePrincipalEntityLists(0);
  
  const [reportType, setReportType] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [academicYear, setAcademicYear] = useState<string>(new Date().getFullYear().toString());
  const [term, setTerm] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const reportTypes = [
    { value: 'student', label: 'Student Report' },
    { value: 'class', label: 'Class Report' },
    { value: 'school', label: 'School Report' }
  ];

  const terms = [
    { value: 'Term 1', label: 'Term 1' },
    { value: 'Term 2', label: 'Term 2' },
    { value: 'Term 3', label: 'Term 3' }
  ];

  const academicYears = [
    new Date().getFullYear().toString(),
    (new Date().getFullYear() - 1).toString(),
    (new Date().getFullYear() - 2).toString(),
  ];

  const handleClassChange = async (classId: string) => {
    setSelectedClass(classId);
    setSelectedStudent('');
    
    if (!classId || reportType !== 'student') {
      setStudents([]);
      return;
    }

    setLoadingStudents(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, admission_number')
        .eq('class_id', classId)
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive"
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  const generateReport = async () => {
    if (!reportType || !academicYear) {
      toast({
        title: "Error",
        description: "Please select report type and academic year",
        variant: "destructive"
      });
      return;
    }

    if (reportType === 'student' && (!selectedClass || !selectedStudent)) {
      toast({
        title: "Error",
        description: "Please select class and student for student report",
        variant: "destructive"
      });
      return;
    }

    if (reportType === 'class' && !selectedClass) {
      toast({
        title: "Error",
        description: "Please select class for class report",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      let reportData;
      
      if (reportType === 'student') {
        const { data, error } = await supabase
          .rpc('get_student_report_data', {
            p_student_id: selectedStudent,
            p_academic_year: academicYear,
            p_term: term || null
          });
        
        if (error) throw error;
        reportData = data;
      } else if (reportType === 'class') {
        const { data, error } = await supabase
          .rpc('get_class_report_data', {
            p_class_id: selectedClass,
            p_academic_year: academicYear,
            p_term: term || null
          });
        
        if (error) throw error;
        reportData = data;
      }

      // Save report record
      const { error: saveError } = await supabase
        .from('reports')
        .insert({
          school_id: schoolId,
          report_type: reportType,
          report_data: reportData,
          filters: {
            class_id: selectedClass,
            student_id: selectedStudent,
            academic_year: academicYear,
            term: term
          },
          generated_by: user?.id
        });

      if (saveError) throw saveError;

      toast({
        title: "Success",
        description: "Report generated successfully!",
      });

      // Here you would typically generate and download the PDF/CSV
      console.log('Report data:', reportData);

    } catch (error: any) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate report",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="shadow-lg border-0 rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-2xl">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Reports Generator
        </CardTitle>
        <p className="text-green-100 text-sm">Generate comprehensive academic reports</p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Report Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Report Type</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Choose report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Academic Year Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Academic Year</label>
            <Select value={academicYear} onValueChange={setAcademicYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Term Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Term (Optional)</label>
          <Select value={term} onValueChange={setTerm}>
            <SelectTrigger>
              <SelectValue placeholder="Select term (optional)" />
            </SelectTrigger>
            <SelectContent>
              {terms.map((termOption) => (
                <SelectItem key={termOption.value} value={termOption.value}>
                  {termOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Class Selection (for class and student reports) */}
        {(reportType === 'class' || reportType === 'student') && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Select Class</label>
            <Select value={selectedClass} onValueChange={handleClassChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose class" />
              </SelectTrigger>
              <SelectContent>
                {classList.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id}>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {classItem.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Student Selection (for student reports only) */}
        {reportType === 'student' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Select Student</label>
            <Select 
              value={selectedStudent} 
              onValueChange={setSelectedStudent}
              disabled={!selectedClass || loadingStudents}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  loadingStudents ? "Loading students..." : 
                  !selectedClass ? "Select a class first" : 
                  "Choose student"
                } />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name} ({student.admission_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button 
            onClick={generateReport}
            disabled={!reportType || !academicYear || isGenerating}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>

          <Button variant="outline" disabled>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>

          <Button variant="outline" disabled>
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
        </div>

        {/* Branding */}
        <div className="text-center pt-4 border-t">
          <p className="text-xs text-gray-500">Powered by EduFam</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportsGenerator;
