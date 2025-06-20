
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { Download, FileText, Award, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CertificateGeneratorProps {
  open?: boolean;
  onClose?: () => void;
  onCertificateGenerated?: () => void;
}

interface Student {
  id: string;
  name: string;
  admission_number: string;
  class_id: string;
}

interface Class {
  id: string;
  name: string;
  level: string;
  stream?: string;
}

const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({ 
  open = false, 
  onClose,
  onCertificateGenerated 
}) => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Access control check
  const canGenerateCertificates = user?.role === 'principal' || user?.role === 'edufam_admin';

  useEffect(() => {
    if (schoolId && open && canGenerateCertificates) {
      loadClasses();
    }
  }, [schoolId, open, canGenerateCertificates]);

  useEffect(() => {
    if (selectedClass) {
      loadStudents();
    }
  }, [selectedClass]);

  const loadClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, level, stream')
        .eq('school_id', schoolId);

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error loading classes:', error);
      toast({
        title: "Error",
        description: "Failed to load classes.",
        variant: "destructive"
      });
    }
  };

  const loadStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, admission_number, class_id')
        .eq('class_id', selectedClass)
        .eq('is_active', true);

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error loading students:', error);
      toast({
        title: "Error",
        description: "Failed to load students.",
        variant: "destructive"
      });
    }
  };

  const validateCertificateData = async () => {
    if (!selectedStudent || !selectedTerm || !selectedYear) {
      setValidationError("Please select student, term, and year.");
      return false;
    }

    try {
      // Check if student has grades for the selected term and year
      const { data: grades, error: gradesError } = await supabase
        .from('grades')
        .select('id')
        .eq('student_id', selectedStudent)
        .eq('term', selectedTerm)
        .eq('status', 'released')
        .eq('school_id', schoolId);

      if (gradesError) throw gradesError;

      if (!grades || grades.length === 0) {
        setValidationError("No released grades found for this student in the selected term. Please ensure grades are finalized and released.");
        return false;
      }

      // Check if student has attendance data
      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance')
        .select('id')
        .eq('student_id', selectedStudent)
        .eq('academic_year', selectedYear);

      if (attendanceError) throw attendanceError;

      if (!attendance || attendance.length === 0) {
        console.warn('No attendance data found for student, proceeding with certificate generation');
      }

      setValidationError(null);
      return true;
    } catch (error) {
      console.error('Error validating certificate data:', error);
      setValidationError("Error validating data. Please try again.");
      return false;
    }
  };

  const handleGenerateCertificate = async () => {
    if (!canGenerateCertificates) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to generate certificates.",
        variant: "destructive"
      });
      return;
    }

    const isValid = await validateCertificateData();
    if (!isValid) return;

    setLoading(true);
    try {
      // Generate certificate using the stored procedure
      const { data: certificateData, error: certificateError } = await supabase
        .rpc('get_student_certificate_data', {
          p_student_id: selectedStudent,
          p_academic_year: selectedYear,
          p_class_id: selectedClass
        });

      if (certificateError) throw certificateError;

      if (!certificateData) {
        throw new Error("No data available to generate certificate");
      }

      // Create certificate record
      const { data: certificate, error: insertError } = await supabase
        .from('certificates')
        .insert({
          student_id: selectedStudent,
          class_id: selectedClass,
          academic_year: selectedYear,
          performance: certificateData,
          school_id: schoolId,
          generated_by: user?.id
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Get student name for success message
      const student = students.find(s => s.id === selectedStudent);
      
      toast({
        title: "Success",
        description: `Certificate successfully generated for ${student?.name || 'student'}.`,
      });

      // Reset form
      setSelectedClass('');
      setSelectedStudent('');
      setSelectedTerm('');
      setSelectedYear('');
      setValidationError(null);

      if (onCertificateGenerated) {
        onCertificateGenerated();
      }
    } catch (error: any) {
      console.error('Error generating certificate:', error);
      toast({
        title: "Error",
        description: error.message || "Error generating certificate. Please check data completeness.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Access control check
  if (!canGenerateCertificates) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certificate Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Access denied. Only principals can generate certificates.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // If no modal props provided, render as standalone component
  if (!open && !onClose) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certificate Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {validationError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} {cls.stream && `- ${cls.stream}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStudent} onValueChange={setSelectedStudent} disabled={!selectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select Student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name} ({student.admission_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger>
                <SelectValue placeholder="Select Term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="term1">Term 1</SelectItem>
                <SelectItem value="term2">Term 2</SelectItem>
                <SelectItem value="term3">Term 3</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleGenerateCertificate} 
            disabled={loading || !selectedClass || !selectedStudent || !selectedTerm || !selectedYear}
            className="w-full"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                Generate Certificate
                <FileText className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Render as modal
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Generate Certificate
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {validationError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} {cls.stream && `- ${cls.stream}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStudent} onValueChange={setSelectedStudent} disabled={!selectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="Select Student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.name} ({student.admission_number})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
            <SelectTrigger>
              <SelectValue placeholder="Select Term" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="term1">Term 1</SelectItem>
              <SelectItem value="term2">Term 2</SelectItem>
              <SelectItem value="term3">Term 3</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger>
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            onClick={handleGenerateCertificate} 
            disabled={loading || !selectedClass || !selectedStudent || !selectedTerm || !selectedYear}
            className="w-full"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                Generate Certificate
                <FileText className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CertificateGenerator;
