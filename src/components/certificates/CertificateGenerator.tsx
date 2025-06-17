
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Award, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const CertificateGenerator = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [generating, setGenerating] = useState(false);

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

  const handleGenerate = async () => {
    if (!selectedStudent || !selectedClass) {
      toast({
        title: "Missing Information",
        description: "Please select both a class and a student",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    try {
      // Get certificate data using the database function
      const { data: certificateData, error: dataError } = await supabase
        .rpc('get_student_certificate_data', {
          p_student_id: selectedStudent,
          p_academic_year: academicYear,
          p_class_id: selectedClass
        });

      if (dataError) throw dataError;

      // Create certificate record
      const { error: insertError } = await supabase
        .from('certificates')
        .insert({
          school_id: schoolId,
          student_id: selectedStudent,
          class_id: selectedClass,
          academic_year: academicYear,
          performance: certificateData,
          generated_by: user?.id
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Certificate generated successfully",
      });

      // Reset form
      setSelectedStudent('');
      setSelectedClass('');
    } catch (error: any) {
      console.error('Error generating certificate:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate certificate",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Generate Student Certificate
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {selectedClass && (
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
          disabled={generating || !selectedStudent || !selectedClass}
          className="w-full"
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Award className="mr-2 h-4 w-4" />
              Generate Certificate
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CertificateGenerator;
