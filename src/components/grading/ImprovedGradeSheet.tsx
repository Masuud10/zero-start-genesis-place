
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useSchoolCurriculum } from '@/hooks/useSchoolCurriculum';
import { useCBCStrandAssessments } from '@/hooks/useCBCStrandAssessments';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, Save } from 'lucide-react';
import BulkGradingSheet from './BulkGradingSheet';

interface Student {
  id: string;
  name: string;
  admission_number?: string;
  roll_number?: string;
}

interface Subject {
  id: string;
  name: string;
  code?: string;
}

interface GradeValue {
  score?: number | null;
  letter_grade?: string | null;
  cbc_performance_level?: string | null;
  percentage?: number | null;
  strand_scores?: Record<string, string>;
  teacher_remarks?: string;
  assessment_type?: string;
  performance_level?: 'EM' | 'AP' | 'PR' | 'EX';
}

interface ImprovedGradeSheetProps {
  classId: string;
  term: string;
  examType: string;
  onSubmissionSuccess?: () => void;
}

export const ImprovedGradeSheet: React.FC<ImprovedGradeSheetProps> = ({
  classId,
  term,
  examType,
  onSubmissionSuccess
}) => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { curriculumType, loading: curriculumLoading } = useSchoolCurriculum();
  const { saveAssessment } = useCBCStrandAssessments(classId, term, examType);
  const { toast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Record<string, Record<string, GradeValue>>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (classId && schoolId && !curriculumLoading) {
      loadGradingData();
    }
  }, [classId, schoolId, curriculumLoading]);

  const loadGradingData = async () => {
    if (!schoolId || !classId || !user?.id) return;

    setLoading(true);
    try {
      // Load students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .eq('school_id', schoolId)
        .order('name');

      if (studentsError) throw studentsError;

      // Load subjects (teacher's assigned subjects)
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subject_teacher_assignments')
        .select(`
          subject_id,
          subjects!inner(id, name, code)
        `)
        .eq('teacher_id', user.id)
        .eq('class_id', classId)
        .eq('school_id', schoolId)
        .eq('is_active', true);

      if (subjectsError) throw subjectsError;

      const subjects = subjectsData?.map(item => item.subjects).filter(Boolean) || [];

      // Load existing grades
      let gradesData = [];
      if (curriculumType === 'cbc') {
        // Load CBC strand assessments
        const { data: cbcGrades, error: cbcError } = await supabase
          .from('cbc_strand_assessments')
          .select('*')
          .eq('school_id', schoolId)
          .eq('class_id', classId)
          .eq('term', term)
          .eq('assessment_type', examType.toLowerCase());

        if (cbcError) throw cbcError;
        gradesData = cbcGrades || [];
      } else {
        // Load standard grades
        const { data: standardGrades, error: standardError } = await supabase
          .from('grades')
          .select('*')
          .eq('school_id', schoolId)
          .eq('class_id', classId)
          .eq('term', term)
          .eq('exam_type', examType);

        if (standardError) throw standardError;
        gradesData = standardGrades || [];
      }

      // Transform grades data
      const gradesMap: Record<string, Record<string, GradeValue>> = {};
      
      if (curriculumType === 'cbc') {
        // Group CBC assessments by student and subject
        gradesData.forEach((grade: any) => {
          if (!gradesMap[grade.student_id]) {
            gradesMap[grade.student_id] = {};
          }
          if (!gradesMap[grade.student_id][grade.subject_id]) {
            gradesMap[grade.student_id][grade.subject_id] = {
              strand_scores: {},
              teacher_remarks: '',
              assessment_type: grade.assessment_type,
              performance_level: 'EM'
            };
          }
          
          // Add strand score
          if (gradesMap[grade.student_id][grade.subject_id].strand_scores) {
            gradesMap[grade.student_id][grade.subject_id].strand_scores![grade.strand_name] = grade.performance_level;
          }
          
          // Update overall performance and remarks
          gradesMap[grade.student_id][grade.subject_id].performance_level = grade.performance_level as 'EM' | 'AP' | 'PR' | 'EX';
          gradesMap[grade.student_id][grade.subject_id].teacher_remarks = grade.teacher_remarks || '';
        });
      } else {
        // Standard grades
        gradesData.forEach((grade: any) => {
          if (!gradesMap[grade.student_id]) {
            gradesMap[grade.student_id] = {};
          }
          gradesMap[grade.student_id][grade.subject_id] = {
            score: grade.score,
            percentage: grade.percentage,
            letter_grade: grade.letter_grade
          };
        });
      }

      setStudents(studentsData || []);
      setSubjects(subjects);
      setGrades(gradesMap);
      setDataLoaded(true);

    } catch (error) {
      console.error('Error loading grading data:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load grading data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (studentId: string, subjectId: string, value: GradeValue) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: value
      }
    }));
  };

  const handleSubmitGrades = async () => {
    if (!user?.id || !schoolId) {
      toast({
        title: "Error",
        description: "User or school information is missing.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      let submittedCount = 0;

      if (curriculumType === 'cbc') {
        // Submit CBC assessments
        for (const [studentId, studentGrades] of Object.entries(grades)) {
          for (const [subjectId, gradeValue] of Object.entries(studentGrades)) {
            if (gradeValue.strand_scores && Object.keys(gradeValue.strand_scores).length > 0) {
              // Submit each strand assessment
              for (const [strandName, performanceLevel] of Object.entries(gradeValue.strand_scores)) {
                await saveAssessment({
                  student_id: studentId,
                  subject_id: subjectId,
                  strand_name: strandName,
                  performance_level: performanceLevel as 'EM' | 'AP' | 'PR' | 'EX',
                  assessment_type: examType.toLowerCase(),
                  term: term,
                  teacher_remarks: gradeValue.teacher_remarks || '',
                  assessment_date: new Date().toISOString().split('T')[0]
                });
                submittedCount++;
              }
            }
          }
        }
      } else {
        // Submit standard grades
        const gradesToSubmit = [];
        for (const [studentId, studentGrades] of Object.entries(grades)) {
          for (const [subjectId, gradeValue] of Object.entries(studentGrades)) {
            if (gradeValue.score !== undefined && gradeValue.score !== null) {
              gradesToSubmit.push({
                school_id: schoolId,
                student_id: studentId,
                subject_id: subjectId,
                class_id: classId,
                term: term,
                exam_type: examType,
                score: gradeValue.score,
                max_score: 100,
                percentage: gradeValue.percentage,
                letter_grade: gradeValue.letter_grade,
                curriculum_type: curriculumType,
                status: 'submitted',
                submitted_by: user.id,
                submitted_at: new Date().toISOString()
              });
            }
          }
        }

        if (gradesToSubmit.length > 0) {
          const { error } = await supabase
            .from('grades')
            .upsert(gradesToSubmit);

          if (error) throw error;
          submittedCount = gradesToSubmit.length;
        }
      }

      toast({
        title: "Grades Submitted Successfully",
        description: `${submittedCount} ${curriculumType === 'cbc' ? 'assessments' : 'grades'} submitted for principal approval.`,
      });

      if (onSubmissionSuccess) {
        onSubmissionSuccess();
      }

    } catch (error) {
      console.error('Error submitting grades:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit grades. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (curriculumLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading curriculum settings...</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading grading data...</span>
      </div>
    );
  }

  if (!dataLoaded) {
    return (
      <Alert>
        <AlertDescription>
          No grading data available. Please check your class and subject assignments.
        </AlertDescription>
      </Alert>
    );
  }

  const hasGradesToSubmit = Object.values(grades).some(studentGrades =>
    Object.values(studentGrades).some(grade =>
      curriculumType === 'cbc' 
        ? (grade.strand_scores && Object.keys(grade.strand_scores).length > 0)
        : (grade.score !== undefined && grade.score !== null)
    )
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {curriculumType === 'cbc' ? 'CBC Assessment Sheet' : 'Grade Sheet'} - {term} {examType}
            </span>
            <Button
              onClick={handleSubmitGrades}
              disabled={submitting || !hasGradesToSubmit}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Submit {curriculumType === 'cbc' ? 'Assessments' : 'Grades'}
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Students:</strong> {students.length}</p>
            <p><strong>Subjects:</strong> {subjects.length}</p>
            <p><strong>Curriculum:</strong> {curriculumType.toUpperCase()}</p>
            {curriculumType === 'cbc' && (
              <p className="text-blue-600"><strong>Note:</strong> Use performance levels (EM, AP, PR, EX) to assess competency strands</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grading Sheet */}
      <BulkGradingSheet
        students={students}
        subjects={subjects}
        grades={grades}
        onGradeChange={handleGradeChange}
        curriculumType={curriculumType}
        selectedClass={classId}
        selectedTerm={term}
        selectedExamType={examType}
      />

      {/* Submit Section */}
      {hasGradesToSubmit && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  Ready to submit {curriculumType === 'cbc' ? 'assessments' : 'grades'} for approval
                </span>
              </div>
              <Button
                onClick={handleSubmitGrades}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Submit for Principal Approval
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
