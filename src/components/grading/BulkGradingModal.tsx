
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import BulkGradingControls from '../grading/BulkGradingControls';
import BulkGradingSheet from '../grading/BulkGradingSheet';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { useCurrentAcademicInfo } from '@/hooks/useCurrentAcademicInfo';

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
  const { currentSchool } = useSchool();
  const { toast } = useToast();
  const { academicInfo } = useCurrentAcademicInfo(currentSchool?.id);

  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  
  const [grades, setGrades] = useState<Record<string, Record<string, GradeValue>>>({});
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const schoolId = currentSchool?.id;
  const curriculumType = currentSchool?.curriculum_type || 'standard';
  const currentTerm = academicInfo.term;

  useEffect(() => {
    if (!schoolId) return;
    
    const fetchInitialData = async () => {
      try {
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('*')
          .eq('school_id', schoolId)
          .order('name');

        if (classesError) throw classesError;
        setClasses(classesData || []);
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast({
          title: "Error",
          description: "Failed to load classes",
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

      // Fetch subjects - try class-specific first, then school-wide
      let subjectsData = [];
      
      // First try to get subjects specific to this class
      const { data: classSubjects, error: classSubjectsError } = await supabase
        .from('subjects')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('school_id', schoolId);

      if (!classSubjectsError && classSubjects && classSubjects.length > 0) {
        subjectsData = classSubjects;
      } else {
        // Fallback to school-wide subjects if no class-specific subjects
        const { data: schoolSubjects, error: schoolSubjectsError } = await supabase
          .from('subjects')
          .select('*')
          .eq('school_id', schoolId)
          .is('class_id', null);

        if (!schoolSubjectsError) {
          subjectsData = schoolSubjects || [];
        }
      }

      // Filter subjects by teacher if user is a teacher
      if (user?.role === 'teacher') {
        subjectsData = subjectsData.filter(subject => subject.teacher_id === user.id);
      }

      console.log('Subjects found:', subjectsData?.length);

      setStudents(studentsData || []);
      setSubjects(subjectsData || []);

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
    if (!selectedClass || !currentTerm || !selectedExamType) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('term', currentTerm)
        .eq('exam_type', selectedExamType)
        .eq('school_id', schoolId);
      
      if (error) throw error;

      if (data) {
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
      }
    } catch (error) {
      console.error('Error fetching existing grades:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedClass, currentTerm, selectedExamType, schoolId]);

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
    if (!selectedClass || !currentTerm || !selectedExamType) {
      toast({ 
        title: "Missing Information", 
        description: "Please select a class and exam type.", 
        variant: "destructive"
      });
      return;
    }

    if (!currentTerm) {
      toast({ 
        title: "No Academic Term", 
        description: "Current academic term is not set. Please contact administration.", 
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const gradesToUpsert = [];
      for (const studentId in grades) {
        for (const subjectId in grades[studentId]) {
          const grade = grades[studentId][subjectId];
          if (grade.score !== undefined && grade.score !== null) {
            gradesToUpsert.push({
              school_id: schoolId,
              student_id: studentId,
              class_id: selectedClass,
              subject_id: subjectId,
              term: currentTerm,
              exam_type: selectedExamType,
              score: grade.score,
              letter_grade: grade.letter_grade || null,
              cbc_performance_level: grade.cbc_performance_level || null,
              submitted_by: user?.id,
              status: user?.role === 'teacher' ? 'submitted' : 'draft',
            });
          }
        }
      }
      
      if (gradesToUpsert.length === 0) {
        toast({ 
          title: "No Grades to Submit", 
          description: "Please enter at least one grade.", 
          variant: "default"
        });
        return;
      }

      const { error } = await supabase
        .from('grades')
        .upsert(gradesToUpsert, {
          onConflict: 'school_id,student_id,subject_id,class_id,term,exam_type',
        });

      if (error) throw error;

      toast({ 
        title: "Success", 
        description: `${gradesToUpsert.length} grades ${user?.role === 'teacher' ? 'submitted for approval' : 'saved'} successfully.`
      });
      onClose();
      
    } catch (error: any) {
      console.error('Error submitting grades:', error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to submit grades", 
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = selectedClass && selectedExamType && currentTerm;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Grade Entry</DialogTitle>
          <DialogDescription>
            Enter grades for multiple students and subjects at once. 
            {user?.role === 'teacher' && ' Grades will be submitted to the principal for approval.'}
          </DialogDescription>
        </DialogHeader>
        
        {initialLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading...</span>
          </div>
        ) : (
          <>
            <BulkGradingControls
              classes={classes}
              academicTerms={[{ term_name: currentTerm || 'Current Term' }]}
              selectedClass={selectedClass}
              onClassChange={setSelectedClass}
              selectedTerm={currentTerm || ''}
              onTermChange={() => {}} // Read-only current term
              selectedExamType={selectedExamType}
              onExamTypeChange={setSelectedExamType}
            />

            {loading && !initialLoading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading data...</span>
              </div>
            )}

            {!canProceed && (
              <div className="flex-grow flex items-center justify-center">
                <Alert className="max-w-md">
                  <AlertDescription>
                    Please select a class and exam type to load the grading sheet.
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            {canProceed && !loading && students.length > 0 && subjects.length > 0 && (
              <div className="flex-grow overflow-hidden">
                <BulkGradingSheet
                  students={students}
                  subjects={subjects}
                  grades={grades}
                  onGradeChange={handleGradeChange}
                  curriculumType={curriculumType as any}
                />
              </div>
            )}

            {canProceed && !loading && (students.length === 0 || subjects.length === 0) && (
              <div className="flex-grow flex items-center justify-center">
                <Alert variant="destructive" className="max-w-md">
                  <AlertDescription>
                    {students.length === 0 && subjects.length === 0 
                      ? "No students or subjects found for the selected class."
                      : students.length === 0 
                      ? "No students found for the selected class."
                      : "No subjects found for the selected class."
                    }
                    <br />
                    Please check class setup and subject assignments.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !canProceed || students.length === 0 || subjects.length === 0}
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
