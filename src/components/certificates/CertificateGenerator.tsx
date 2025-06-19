
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Award, Download, FileText, Users, Loader2 } from 'lucide-react';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const CertificateGenerator: React.FC = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [generating, setGenerating] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  // Load classes on component mount
  React.useEffect(() => {
    const loadClasses = async () => {
      if (!schoolId) return;
      
      try {
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .eq('school_id', schoolId)
          .order('name');

        if (error) throw error;
        setClasses(data || []);
      } catch (error: any) {
        console.error('Error loading classes:', error);
        toast({
          title: "Loading Error",
          description: "Failed to load classes. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoadingClasses(false);
      }
    };

    loadClasses();
  }, [schoolId]);

  const handleGenerateCertificates = async () => {
    if (!selectedClass || !selectedTerm || !selectedAcademicYear) {
      toast({
        title: "Missing Information",
        description: "Please select class, term, and academic year",
        variant: "destructive"
      });
      return;
    }

    if (!user?.id || !schoolId) {
      toast({
        title: "Authentication Error",
        description: "Please ensure you are logged in.",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    try {
      // Get students in the selected class
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('is_active', true);

      if (studentsError) throw studentsError;

      if (!students || students.length === 0) {
        toast({
          title: "No Students Found",
          description: "No active students found in the selected class.",
          variant: "destructive"
        });
        return;
      }

      // Generate certificates for each student
      const certificatePromises = students.map(async (student) => {
        // Get student's performance data
        const { data: performanceData } = await supabase.rpc('get_student_certificate_data', {
          p_student_id: student.id,
          p_academic_year: selectedAcademicYear,
          p_class_id: selectedClass
        });

        // Create certificate record
        return supabase
          .from('certificates')
          .upsert({
            school_id: schoolId,
            student_id: student.id,
            class_id: selectedClass,
            academic_year: selectedAcademicYear,
            performance: performanceData || {},
            generated_by: user.id
          }, {
            onConflict: 'school_id,student_id,class_id,academic_year'
          });
      });

      await Promise.all(certificatePromises);
      
      toast({
        title: "Certificates Generated",
        description: `Successfully generated ${students.length} certificates for ${selectedClass} - ${selectedTerm} ${selectedAcademicYear}`,
      });
    } catch (error: any) {
      console.error('Certificate generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate certificates. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const academicYears = [
    `${currentYear}`,
    `${currentYear - 1}`,
    `${currentYear + 1}`
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certificate Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingClasses ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading classes...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Class</label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Select Term</label>
                  <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="term1">Term 1</SelectItem>
                      <SelectItem value="term2">Term 2</SelectItem>
                      <SelectItem value="term3">Term 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Academic Year</label>
                  <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose year" />
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

              <div className="border-t pt-4">
                <Button 
                  onClick={handleGenerateCertificates} 
                  disabled={generating || !selectedClass || !selectedTerm || !selectedAcademicYear}
                  className="w-full"
                  size="lg"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating Certificates...
                    </>
                  ) : (
                    <>
                      <Award className="h-4 w-4 mr-2" />
                      Generate Certificates
                    </>
                  )}
                </Button>
              </div>

              {selectedClass && selectedTerm && selectedAcademicYear && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <h4 className="font-medium text-blue-900">Certificate Preview</h4>
                  </div>
                  <p className="text-sm text-blue-700">
                    Certificates will be generated for all active students in the selected class 
                    based on their performance data for {selectedTerm} {selectedAcademicYear}.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificateGenerator;
