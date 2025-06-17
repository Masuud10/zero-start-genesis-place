
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import BulkGradingControls from './BulkGradingControls';
import BulkGradingSheet from './BulkGradingSheet';
import { Loader2, Shield, AlertTriangle, CheckCircle, Send, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface BulkGradingModalProps {
  onClose: () => void;
}

type GradeValue = {
  score?: number | null;
  letter_grade?: string | null;
  cbc_performance_level?: string | null;
  percentage?: number | null;
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
  const [existingGradesStatus, setExistingGradesStatus] = useState<string>('');
  const [isReadOnly, setIsReadOnly] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const curriculumType = 'standard'; // Default to standard for now
  const isTeacher = user?.role === 'teacher';
  const isPrincipal = user?.role === 'principal';

  useEffect(() => {
    if (!schoolId) return;
    
    const fetchInitialData = async () => {
      try {
        console.log('Fetching initial data for school:', schoolId);
        
        const [classesRes, termsRes] = await Promise.all([
          supabase.from('classes').select('*').eq('school_id', schoolId).order('name'),
          supabase.from('academic_terms').select('*').eq('school_id', schoolId).order('start_date', { ascending: false })
        ]);

        if (classesRes.error) throw classesRes.error;
        if (termsRes.error) throw termsRes.error;

        console.log('Classes found:', classesRes.data?.length || 0);
        console.log('Terms found:', termsRes.data?.length || 0);

        setClasses(classesRes.data || []);
        setAcademicTerms(termsRes.data || []);
        
        // Auto-select current term
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
      
      // Fetch students - get all students in the class regardless of enrollment table
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

      console.log('Students query result:', studentsData?.length || 0, 'students found');

      // Fetch subjects based on user role
      let subjectsData = [];
      
      if (isTeacher) {
        // Teachers can only see subjects they teach in this class
        const { data: teacherSubjects, error: subjectsError } = await supabase
          .from('subjects')
          .select('*')
          .eq('school_id', schoolId)
          .eq('teacher_id', user.id)
          .eq('class_id', selectedClass);

        if (subjectsError) {
          console.error('Teacher subjects fetch error:', subjectsError);
          throw subjectsError;
        }
        
        subjectsData = teacherSubjects || [];
        console.log('Teacher subjects found:', subjectsData.length);
      } else {
        // Principals and admins can see all subjects for the class
        const { data: classSubjects, error: classSubjectsError } = await supabase
          .from('subjects')
          .select('*')
          .eq('school_id', schoolId)
          .eq('class_id', selectedClass);

        if (classSubjectsError) {
          console.error('Class subjects fetch error:', classSubjectsError);
          throw classSubjectsError;
        }
        
        subjectsData = classSubjects || [];
        console.log('All class subjects found:', subjectsData.length);
      }

      setStudents(studentsData || []);
      setSubjects(subjectsData || []);

      // Show specific messages based on what's missing
      if (!studentsData || studentsData.length === 0) {
        toast({
          title: "No Students Found",
          description: `No active students found in the selected class. Please ensure students are properly enrolled.`,
          variant: "default"
        });
      }

      if (!subjectsData || subjectsData.length === 0) {
        const message = isTeacher 
          ? "You are not assigned to teach any subjects for this class."
          : "No subjects found for this class. Please ensure subjects are properly set up.";
        
        toast({
          title: "No Subjects Found",
          description: message,
          variant: "default"
        });
      }

    } catch (error) {
      console.error('Error fetching class data:', error);
      toast({
        title: "Error",
        description: `Failed to load class data: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [selectedClass, schoolId, user?.id, isTeacher, toast]);

  useEffect(() => {
    fetchClassData();
  }, [fetchClassData]);

  const fetchExistingGrades = useCallback(async () => {
    if (!selectedClass || !selectedTerm || !selectedExamType || !schoolId) return;
    
    setLoading(true);
    try {
      console.log('Fetching existing grades for:', { selectedClass, selectedTerm, selectedExamType });
      
      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('term', selectedTerm)
        .eq('exam_type', selectedExamType)
        .eq('school_id', schoolId);
      
      if (error) throw error;
      console.log('Existing grades found:', data?.length || 0);

      if (data && data.length > 0) {
        // Check status of existing grades
        const statuses = [...new Set(data.map(g => g.status))];
        const hasSubmitted = statuses.includes('submitted');
        const hasApproved = statuses.includes('approved');
        const hasReleased = statuses.includes('released');

        console.log('Grade statuses found:', statuses);

        if (hasReleased) {
          setExistingGradesStatus('released');
          setIsReadOnly(true);
        } else if (hasApproved) {
          setExistingGradesStatus('approved');
          setIsReadOnly(!isPrincipal); // Only principals can edit approved grades
        } else if (hasSubmitted) {
          setExistingGradesStatus('submitted');
          setIsReadOnly(!isPrincipal); // Only principals can edit submitted grades
        } else {
          setExistingGradesStatus('draft');
          setIsReadOnly(false);
        }

        // Load existing grades
        const newGrades: Record<string, Record<string, GradeValue>> = {};
        for (const grade of data) {
          if (!newGrades[grade.student_id]) {
            newGrades[grade.student_id] = {};
          }
          newGrades[grade.student_id][grade.subject_id] = {
            score: grade.score,
            letter_grade: grade.letter_grade,
            cbc_performance_level: grade.cbc_performance_level,
            percentage: grade.percentage
          };
        }
        setGrades(newGrades);
        console.log('Grades loaded for:', Object.keys(newGrades).length, 'students');
      } else {
        setGrades({});
        setExistingGradesStatus('');
        setIsReadOnly(false);
        console.log('No existing grades found');
      }
    } catch (error) {
      console.error('Error fetching existing grades:', error);
      toast({
        title: "Warning",
        description: "Could not load existing grades.",
        variant: "default"
      });
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedTerm, selectedExamType, schoolId, isPrincipal, toast]);

  useEffect(() => {
    fetchExistingGrades();
  }, [fetchExistingGrades]);

  const handleGradeChange = (studentId: string, subjectId: string, value: GradeValue) => {
    if (isReadOnly) return;
    
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
    
    setSubmitting(true);
    
    try {
      const gradesToUpsert = [];
      let validGradeCount = 0;
      
      for (const studentId in grades) {
        for (const subjectId in grades[studentId]) {
          const grade = grades[studentId][subjectId];
          
          if (grade.score !== undefined && grade.score !== null && grade.score.toString() !== '') {
            gradesToUpsert.push({
              school_id: schoolId,
              student_id: studentId,
              class_id: selectedClass,
              subject_id: subjectId,
              term: selectedTerm,
              exam_type: selectedExamType,
              score: Number(grade.score),
              max_score: 100, // Default max score
              percentage: grade.percentage,
              letter_grade: grade.letter_grade || null,
              cbc_performance_level: grade.cbc_performance_level || null,
              submitted_by: user?.id,
              status: isTeacher ? 'submitted' : 'draft',
              submitted_at: isTeacher ? new Date().toISOString() : null,
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

      console.log('Submitting grades:', gradesToUpsert.length, 'records');

      const { error } = await supabase
        .from('grades')
        .upsert(gradesToUpsert, {
          onConflict: 'school_id,student_id,subject_id,class_id,term,exam_type',
        });

      if (error) throw error;

      // Calculate positions after successful submission
      if (selectedClass && selectedTerm && selectedExamType) {
        await supabase.rpc('calculate_class_positions', {
          p_class_id: selectedClass,
          p_term: selectedTerm,
          p_exam_type: selectedExamType
        });
      }

      const statusMessage = isTeacher 
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
        description: error.message || "Failed to submit grades.", 
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    switch (existingGradesStatus) {
      case 'submitted':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Send className="h-3 w-3 mr-1" />Submitted for Approval</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'released':
        return <Badge variant="outline" className="text-purple-600 border-purple-600"><Lock className="h-3 w-3 mr-1" />Released</Badge>;
      case 'draft':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Draft</Badge>;
      default:
        return null;
    }
  };

  const canProceed = selectedClass && selectedTerm && selectedExamType;
  const hasData = students.length > 0 && subjects.length > 0;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {isTeacher ? 'Grade Entry & Submission' : 'Grade Management'}
            {getStatusBadge()}
          </DialogTitle>
          <DialogDescription>
            {isTeacher 
              ? 'Enter grades for your subjects. Grades will be submitted for principal approval.'
              : 'Manage grades for all subjects. You can approve and release results.'
            }
            {isReadOnly && (
              <div className="flex items-center gap-2 mt-2 text-orange-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Read-only mode - grades cannot be modified</span>
              </div>
            )}
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
                <BulkGradingSheet
                  students={students}
                  subjects={subjects}
                  grades={grades}
                  onGradeChange={handleGradeChange}
                  curriculumType={curriculumType}
                  isReadOnly={isReadOnly}
                  selectedClass={selectedClass}
                  selectedTerm={selectedTerm}
                  selectedExamType={selectedExamType}
                />
              </div>
            )}

            {canProceed && !loading && !hasData && (
              <div className="flex-grow flex items-center justify-center">
                <Alert variant="default" className="max-w-lg">
                  <AlertDescription>
                    {students.length === 0 && subjects.length === 0 
                      ? "No students or subjects found for the selected class. Please ensure the class has students enrolled and subjects assigned."
                      : students.length === 0 
                      ? "No students found for the selected class. Please ensure students are enrolled in this class."
                      : isTeacher
                      ? "No subjects found that you are assigned to teach for this class. Please contact your principal to assign you to subjects for this class."
                      : "No subjects found for the selected class. Please ensure subjects are properly assigned to this class."
                    }
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </>
        )}

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          {canProceed && hasData && !isReadOnly && (
            <Button 
              onClick={handleSubmit} 
              disabled={submitting}
              className={isTeacher ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  {isTeacher ? 'Submitting...' : 'Saving...'}
                </>
              ) : (
                <>
                  {isTeacher ? (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit for Approval
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Save Grades
                    </>
                  )}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkGradingModal;
