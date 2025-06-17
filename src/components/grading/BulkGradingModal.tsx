
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import BulkGradingControls from './BulkGradingControls';
import BulkGradingSheet from './BulkGradingSheet';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface BulkGradingModalProps {
  onClose: () => void;
}

type GradeValue = {
  score?: number | null;
  letter_grade?: string | null;
  cbc_performance_level?: string | null;
};

const BulkGradingModal: React.FC<BulkGradingModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();

  const [classes, setClasses] = useState<any[]>([]);
  const [academicTerms, setAcademicTerms] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  
  const [grades, setGrades] = useState<Record<string, Record<string, GradeValue>>>({});
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const curriculumType = 'standard'; // Default to standard for now

  useEffect(() => {
    if (!schoolId) return;
    
    const fetchInitialData = async () => {
      try {
        console.log('Fetching initial data for school:', schoolId);
        
        const [classesRes, termsRes] = await Promise.all([
          supabase.from('classes').select('*').eq('school_id', schoolId).order('name'),
          supabase.from('academic_terms').select('*').eq('school_id', schoolId).order('start_date', { ascending: false })
        ]);

        if (classesRes.error) {
          console.error('Classes error:', classesRes.error);
          throw classesRes.error;
        }
        if (termsRes.error) {
          console.error('Terms error:', termsRes.error);
          throw termsRes.error;
        }

        console.log('Classes loaded:', classesRes.data?.length);
        console.log('Terms loaded:', termsRes.data?.length);

        setClasses(classesRes.data || []);
        setAcademicTerms(termsRes.data || []);
        
        // Auto-select current term if available
        if (termsRes.data && termsRes.data.length > 0) {
          const currentTerm = termsRes.data.find(term => term.is_current) || termsRes.data[0];
          setSelectedTerm(currentTerm.term_name);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast({
          title: "Error",
          description: "Failed to load classes and terms",
          variant: "destructive"
        });
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
  }, [schoolId, toast]);

  const fetchClassData = useCallback(async () => {
    if (!selectedClass || !schoolId) {
      setStudents([]);
      setSubjects([]);
      return;
    }
    
    setLoading(true);
    try {
      console.log('Fetching data for class:', selectedClass, 'school:', schoolId);
      
      // Fetch students for the class
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('name');

      if (studentsError) {
        console.error('Students fetch error:', studentsError);
        throw studentsError;
      }

      console.log('Students found:', studentsData?.length);

      // Fetch subjects for the class - try different approaches
      let subjectsData = [];
      
      // First try to get subjects assigned to this specific class
      const { data: classSubjects, error: classSubjectsError } = await supabase
        .from('subjects')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('school_id', schoolId);

      if (!classSubjectsError && classSubjects && classSubjects.length > 0) {
        subjectsData = classSubjects;
        console.log('Found class-specific subjects:', subjectsData.length);
      } else {
        // Fallback: get all subjects for the school (for schools with general subjects)
        const { data: schoolSubjects, error: schoolSubjectsError } = await supabase
          .from('subjects')
          .select('*')
          .eq('school_id', schoolId)
          .is('class_id', null);

        if (!schoolSubjectsError && schoolSubjects) {
          subjectsData = schoolSubjects;
          console.log('Found school-wide subjects:', subjectsData.length);
        }
      }

      // If user is a teacher, filter subjects they're assigned to
      if (user?.role === 'teacher' && subjectsData.length > 0) {
        subjectsData = subjectsData.filter(subject => subject.teacher_id === user.id);
        console.log('Filtered subjects for teacher:', subjectsData.length);
      }

      console.log('Final subjects count:', subjectsData.length);

      setStudents(studentsData || []);
      setSubjects(subjectsData || []);

      // Show helpful message if no data found
      if (!studentsData || studentsData.length === 0) {
        toast({
          title: "No Students",
          description: "No active students found for this class.",
          variant: "default"
        });
      }

      if (!subjectsData || subjectsData.length === 0) {
        toast({
          title: "No Subjects",
          description: user?.role === 'teacher' 
            ? "You are not assigned to any subjects for this class."
            : "No subjects found for this class. Please ensure subjects are properly set up.",
          variant: "default"
        });
      }

    } catch (error) {
      console.error('Error fetching class data:', error);
      toast({
        title: "Error",
        description: "Failed to load class data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [selectedClass, schoolId, user?.id, user?.role, toast]);

  useEffect(() => {
    fetchClassData();
  }, [fetchClassData]);

  const fetchExistingGrades = useCallback(async () => {
    if (!selectedClass || !selectedTerm || !selectedExamType || !schoolId) return;
    
    setLoading(true);
    try {
      console.log('Fetching existing grades for:', { selectedClass, selectedTerm, selectedExamType, schoolId });
      
      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('term', selectedTerm)
        .eq('exam_type', selectedExamType)
        .eq('school_id', schoolId);
      
      if (error) {
        console.error('Error fetching grades:', error);
        throw error;
      }

      console.log('Existing grades found:', data?.length);

      if (data && data.length > 0) {
        const newGrades: Record<string, Record<string, GradeValue>> = {};
        for (const grade of data) {
          if (!newGrades[grade.student_id]) {
            newGrades[grade.student_id] = {};
          }
          newGrades[grade.student_id][grade.subject_id] = {
            score: grade.score,
            letter_grade: grade.letter_grade,
            cbc_performance_level: grade.cbc_performance_level,
          };
        }
        setGrades(newGrades);
        console.log('Loaded existing grades for students:', Object.keys(newGrades).length);
      } else {
        setGrades({});
      }
    } catch (error) {
      console.error('Error fetching existing grades:', error);
      toast({
        title: "Warning",
        description: "Could not load existing grades. You can still enter new grades.",
        variant: "default"
      });
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedTerm, selectedExamType, schoolId, toast]);

  useEffect(() => {
    fetchExistingGrades();
  }, [fetchExistingGrades]);

  const handleGradeChange = (studentId: string, subjectId: string, value: GradeValue) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: { ...(prev[studentId]?.[subjectId] || {}), ...value },
      },
    }));
  };

  const handleSubmit = async () => {
    if (!selectedClass || !selectedTerm || !selectedExamType || !schoolId) {
      toast({ 
        title: "Missing Information", 
        description: "Please select a class, term, and exam type.", 
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const gradesToUpsert = [];
      let validGradeCount = 0;
      
      for (const studentId in grades) {
        for (const subjectId in grades[studentId]) {
          const grade = grades[studentId][subjectId];
          
          // Only include grades that have actual values
          if (grade.score !== undefined && grade.score !== null && grade.score !== '') {
            gradesToUpsert.push({
              school_id: schoolId,
              student_id: studentId,
              class_id: selectedClass,
              subject_id: subjectId,
              term: selectedTerm,
              exam_type: selectedExamType,
              score: Number(grade.score),
              letter_grade: grade.letter_grade || null,
              cbc_performance_level: grade.cbc_performance_level || null,
              submitted_by: user?.id,
              status: user?.role === 'teacher' ? 'submitted' : 'draft',
              submitted_at: new Date().toISOString(),
            });
            validGradeCount++;
          }
        }
      }
      
      if (gradesToUpsert.length === 0) {
        toast({ 
          title: "No Grades to Submit", 
          description: "Please enter at least one grade score.", 
          variant: "default"
        });
        return;
      }

      console.log('Submitting grades:', gradesToUpsert.length);

      const { error } = await supabase
        .from('grades')
        .upsert(gradesToUpsert, {
          onConflict: 'school_id,student_id,subject_id,class_id,term,exam_type',
        });

      if (error) {
        console.error('Error submitting grades:', error);
        throw error;
      }

      const statusMessage = user?.role === 'teacher' 
        ? 'submitted for principal approval' 
        : 'saved successfully';

      toast({ 
        title: "Success", 
        description: `${validGradeCount} grades ${statusMessage}.`
      });
      onClose();
      
    } catch (error: any) {
      console.error('Error submitting grades:', error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to submit grades. Please try again.", 
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = selectedClass && selectedTerm && selectedExamType;
  const hasData = students.length > 0 && subjects.length > 0;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Grade Entry - Excel-like Interface</DialogTitle>
          <DialogDescription>
            Enter grades for multiple students and subjects in a spreadsheet format. 
            {user?.role === 'teacher' && ' Grades will be submitted to the principal for approval.'}
          </DialogDescription>
        </DialogHeader>
        
        {initialLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading classes and terms...</span>
          </div>
        ) : (
          <>
            <BulkGradingControls
              classes={classes}
              academicTerms={academicTerms}
              selectedClass={selectedClass}
              onClassChange={setSelectedClass}
              selectedTerm={selectedTerm}
              onTermChange={setSelectedTerm}
              selectedExamType={selectedExamType}
              onExamTypeChange={setSelectedExamType}
            />

            {loading && !initialLoading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading class data...</span>
              </div>
            )}

            {!canProceed && !initialLoading && (
              <div className="flex-grow flex items-center justify-center">
                <Alert className="max-w-md">
                  <AlertDescription>
                    Please select a class, term, and exam type to load the grading interface.
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            {canProceed && !loading && hasData && (
              <div className="flex-grow overflow-hidden">
                <div className="h-full border rounded-lg">
                  <BulkGradingSheet
                    students={students}
                    subjects={subjects}
                    grades={grades}
                    onGradeChange={handleGradeChange}
                    curriculumType={curriculumType}
                  />
                </div>
              </div>
            )}

            {canProceed && !loading && !hasData && (
              <div className="flex-grow flex items-center justify-center">
                <Alert variant="default" className="max-w-lg">
                  <AlertDescription>
                    {students.length === 0 && subjects.length === 0 
                      ? "No students or subjects found for the selected class. Please ensure the class has enrolled students and assigned subjects."
                      : students.length === 0 
                      ? "No students found for the selected class. Please ensure students are enrolled in this class."
                      : "No subjects found for the selected class. Please ensure subjects are assigned to this class or contact your administrator."
                    }
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </>
        )}

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !canProceed || !hasData}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Submitting...
              </>
            ) : (
              user?.role === 'teacher' ? 'Submit for Approval' : 'Save Grades'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkGradingModal;
