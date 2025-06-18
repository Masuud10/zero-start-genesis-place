
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { supabase } from '@/integrations/supabase/client';
import { usePrincipalEntityLists } from '@/hooks/usePrincipalEntityLists';
import { Award, Download, FileText, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const CertificateGenerator = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { classList } = usePrincipalEntityLists(0);
  
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [academicYear, setAcademicYear] = useState<string>(new Date().getFullYear().toString());
  const [students, setStudents] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const academicYears = [
    new Date().getFullYear().toString(),
    (new Date().getFullYear() - 1).toString(),
    (new Date().getFullYear() - 2).toString(),
  ];

  const handleClassChange = async (classId: string) => {
    setSelectedClass(classId);
    setSelectedStudent('');
    
    if (!classId) {
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

  const generateCertificate = async () => {
    if (!selectedClass || !selectedStudent || !academicYear) {
      toast({
        title: "Error",
        description: "Please select class, student, and academic year",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Get student certificate data
      const { data: certificateData, error: dataError } = await supabase
        .rpc('get_student_certificate_data', {
          p_student_id: selectedStudent,
          p_academic_year: academicYear,
          p_class_id: selectedClass
        });

      if (dataError) throw dataError;

      // Save certificate record
      const { error: saveError } = await supabase
        .from('certificates')
        .insert({
          school_id: schoolId,
          student_id: selectedStudent,
          class_id: selectedClass,
          academic_year: academicYear,
          performance: certificateData,
          generated_by: user?.id
        });

      if (saveError) throw saveError;

      toast({
        title: "Success",
        description: "Certificate generated successfully!",
      });

      // Here you would typically generate and download the PDF
      console.log('Certificate data:', certificateData);

    } catch (error: any) {
      console.error('Error generating certificate:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate certificate",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="shadow-lg border-0 rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-2xl">
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Certificate Generator
        </CardTitle>
        <p className="text-purple-100 text-sm">Generate official academic certificates</p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Class Selection */}
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

        {/* Student Selection */}
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

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button 
            onClick={generateCertificate}
            disabled={!selectedClass || !selectedStudent || !academicYear || isGenerating}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Certificate
              </>
            )}
          </Button>

          <Button variant="outline" disabled>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
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

export default CertificateGenerator;
