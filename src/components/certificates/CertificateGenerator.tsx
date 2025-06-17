
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useCertificates } from '@/hooks/useCertificates';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Award, Download, Eye } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CertificateGenerator = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [bulkGeneration, setBulkGeneration] = useState(false);

  const { generateCertificate, isGenerating } = useCertificates();

  // Get available academic years
  const { data: academicYears } = useQuery({
    queryKey: ['academic-years', schoolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grades')
        .select('term')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Extract unique years from grades
      const years = [...new Set(data.map(g => new Date(g.term || '').getFullYear().toString()))]
        .filter(year => year !== 'NaN')
        .sort((a, b) => b.localeCompare(a));
      
      return years;
    },
    enabled: !!schoolId,
  });

  // Get classes
  const { data: classes } = useQuery({
    queryKey: ['classes', schoolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, level')
        .eq('school_id', schoolId)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!schoolId,
  });

  // Get students for selected class
  const { data: students } = useQuery({
    queryKey: ['students', selectedClassId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, admission_number')
        .eq('class_id', selectedClassId)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedClassId,
  });

  const handleGenerate = () => {
    if (!selectedAcademicYear || !selectedClassId) return;

    if (bulkGeneration && students) {
      // Generate for all students in class
      students.forEach(student => {
        generateCertificate({
          student_id: student.id,
          class_id: selectedClassId,
          academic_year: selectedAcademicYear,
        });
      });
    } else if (selectedStudentId) {
      // Generate for single student
      generateCertificate({
        student_id: selectedStudentId,
        class_id: selectedClassId,
        academic_year: selectedAcademicYear,
      });
    }
  };

  const canGenerate = user?.role === 'principal' || user?.role === 'edufam_admin';

  if (!canGenerate) {
    return (
      <Alert>
        <AlertDescription>
          You don't have permission to generate certificates. Only principals and system administrators can generate certificates.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Certificate Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="academic-year">Academic Year</Label>
            <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
              <SelectContent>
                {academicYears?.map(year => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="class">Class</Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes?.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} {cls.level && `- ${cls.level}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="bulk-generation"
              checked={bulkGeneration}
              onChange={(e) => setBulkGeneration(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="bulk-generation">Generate for entire class</Label>
          </div>

          {!bulkGeneration && (
            <div className="space-y-2">
              <Label htmlFor="student">Student</Label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students?.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.admission_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Button
          onClick={handleGenerate}
          disabled={
            !selectedAcademicYear || 
            !selectedClassId || 
            (!bulkGeneration && !selectedStudentId) ||
            isGenerating
          }
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Award className="mr-2 h-4 w-4" />
              Generate Certificate{bulkGeneration ? 's' : ''}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CertificateGenerator;
