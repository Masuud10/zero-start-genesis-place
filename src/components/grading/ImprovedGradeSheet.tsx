
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';
import { Save, Send, FileSpreadsheet, Users, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Student {
  id: string;
  name: string;
  admission_number: string;
  roll_number: string;
  is_active: boolean;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  max_score: number;
  class_id: string;
}

interface GradeEntry {
  student_id: string;
  subject_id: string;
  score: number | null;
  comments?: string;
  status: 'draft' | 'submitted' | 'approved' | 'released';
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
  const { toast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Record<string, Record<string, GradeEntry>>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (classId && schoolId && user?.id) {
      loadGradingData();
    }
  }, [classId, schoolId, user?.id, term, examType]);

  const loadGradingData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading grading data for:', { classId, schoolId, userId: user?.id, term, examType });

      // Validate required fields
      if (!classId || !schoolId || !user?.id || !term || !examType) {
        throw new Error('Missing required parameters for loading grading data');
      }

      // Load students for the class
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, name, admission_number, roll_number, is_active')
        .eq('class_id', classId)
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('name');

      if (studentsError) {
        console.error('Error loading students:', studentsError);
        throw new Error(`Failed to load students: ${studentsError.message}`);
      }

      console.log('Students loaded:', studentsData?.length || 0);

      // Load subjects assigned to the teacher for this class
      const { data: subjectAssignments, error: subjectsError } = await supabase
        .from('subject_teacher_assignments')
        .select(`
          subject_id,
          subjects!inner(
            id,
            name,
            code,
            class_id
          )
        `)
        .eq('teacher_id', user?.id)
        .eq('class_id', classId)
        .eq('school_id', schoolId)
        .eq('is_active', true);

      if (subjectsError) {
        console.error('Error loading subject assignments:', subjectsError);
        throw new Error(`Failed to load subject assignments: ${subjectsError.message}`);
      }

      // Extract subjects with max_score default
      const subjectsWithDefaults = subjectAssignments?.map((assignment: any) => ({
        id: assignment.subjects.id,
        name: assignment.subjects.name,
        code: assignment.subjects.code,
        class_id: assignment.subjects.class_id,
        max_score: 100 // Default max score
      })) || [];

      console.log('Subjects loaded:', subjectsWithDefaults.length);

      if (subjectsWithDefaults.length === 0) {
        throw new Error('No subjects assigned to you for this class. Please contact your administrator.');
      }

      // Load existing grades
      const { data: existingGrades, error: gradesError } = await supabase
        .from('grades')
        .select('*')
        .eq('class_id', classId)
        .eq('term', term)
        .eq('exam_type', examType)
        .eq('submitted_by', user?.id)
        .eq('school_id', schoolId)
        .in('subject_id', subjectsWithDefaults.map(s => s.id));

      if (gradesError) {
        console.error('Error loading grades:', gradesError);
        // Don't throw error for grades as they might not exist yet
      }

      // Organize grades by student and subject
      const gradesMap: Record<string, Record<string, GradeEntry>> = {};
      
      if (existingGrades && existingGrades.length > 0) {
        existingGrades.forEach(grade => {
          if (!gradesMap[grade.student_id]) {
            gradesMap[grade.student_id] = {};
          }
          gradesMap[grade.student_id][grade.subject_id] = {
            student_id: grade.student_id,
            subject_id: grade.subject_id,
            score: grade.score,
            comments: grade.comments,
            status: (grade.status || 'draft') as 'draft' | 'submitted' | 'approved' | 'released'
          };
        });
      }

      setStudents(studentsData || []);
      setSubjects(subjectsWithDefaults);
      setGrades(gradesMap);
      setDataLoaded(true);

      console.log('Grading data loaded successfully');

    } catch (error) {
      console.error('Error loading grading data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load grading data');
      toast({
        title: "Error Loading Data",
        description: error instanceof Error ? error.message : 'Failed to load grading data',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateGrade = (studentId: string, subjectId: string, score: string, comments?: string) => {
    const numericScore = score === '' ? null : parseFloat(score);
    
    // Validate score
    const subject = subjects.find(s => s.id === subjectId);
    if (numericScore !== null && subject && numericScore > subject.max_score) {
      toast({
        title: "Invalid Score",
        description: `Score cannot exceed ${subject.max_score}`,
        variant: "destructive"
      });
      return;
    }

    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: {
          student_id: studentId,
          subject_id: subjectId,
          score: numericScore,
          comments: comments || prev[studentId]?.[subjectId]?.comments,
          status: 'draft' as 'draft' | 'submitted' | 'approved' | 'released'
        }
      }
    }));
  };

  const saveGrades = async () => {
    if (!user?.id || !schoolId) {
      toast({
        title: "Authentication Error", 
        description: "User not authenticated or school not identified",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const gradesToSave: any[] = [];
      
      Object.values(grades).forEach(studentGrades => {
        Object.values(studentGrades).forEach(grade => {
          if (grade.score !== null || grade.comments) {
            // Validate required fields
            if (!grade.student_id || !grade.subject_id || !classId || !term || !examType) {
              console.error('Missing required fields for grade:', grade);
              return;
            }

            const subjectMaxScore = subjects.find(s => s.id === grade.subject_id)?.max_score || 100;
            const percentage = grade.score !== null ? (grade.score / subjectMaxScore) * 100 : null;

            gradesToSave.push({
              student_id: grade.student_id,
              subject_id: grade.subject_id,
              class_id: classId,
              term,
              exam_type: examType,
              score: grade.score,
              max_score: subjectMaxScore,
              percentage: percentage,
              comments: grade.comments,
              submitted_by: user.id,
              school_id: schoolId,
              status: 'draft',
              submitted_at: new Date().toISOString()
            });
          }
        });
      });

      if (gradesToSave.length === 0) {
        toast({
          title: "No Changes to Save",
          description: "Please enter some grades before saving",
          variant: "default"
        });
        return;
      }

      console.log('Saving grades:', gradesToSave.length, gradesToSave);

      const { error } = await supabase
        .from('grades')
        .upsert(gradesToSave, {
          onConflict: 'student_id,subject_id,class_id,term,exam_type,submitted_by'
        });

      if (error) {
        console.error('Error saving grades:', error);
        throw error;
      }

      // Update local state to reflect saved grades
      const updatedGrades = { ...grades };
      gradesToSave.forEach(savedGrade => {
        if (updatedGrades[savedGrade.student_id]) {
          updatedGrades[savedGrade.student_id][savedGrade.subject_id] = {
            ...updatedGrades[savedGrade.student_id][savedGrade.subject_id],
            status: 'draft'
          };
        }
      });
      setGrades(updatedGrades);

      toast({
        title: "Grades Saved",
        description: `${gradesToSave.length} grades saved successfully`,
      });

    } catch (error) {
      console.error('Error saving grades:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save grades. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const submitForApproval = async () => {
    if (!user?.id || !schoolId) {
      toast({
        title: "Authentication Error",
        description: "User not authenticated or school not identified",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      // First save all grades as draft
      await saveGrades();

      // Get all grades that have scores entered
      const gradesToSubmit: any[] = [];
      
      Object.values(grades).forEach(studentGrades => {
        Object.values(studentGrades).forEach(grade => {
          if (grade.score !== null && grade.score >= 0) {
            gradesToSubmit.push({
              student_id: grade.student_id,
              subject_id: grade.subject_id,
              class_id: classId,
              term,
              exam_type: examType,
              score: grade.score,
              max_score: subjects.find(s => s.id === grade.subject_id)?.max_score || 100,
              percentage: ((grade.score / (subjects.find(s => s.id === grade.subject_id)?.max_score || 100)) * 100),
              comments: grade.comments,
              submitted_by: user.id,
              school_id: schoolId,
              status: 'submitted',
              submitted_at: new Date().toISOString()
            });
          }
        });
      });

      if (gradesToSubmit.length === 0) {
        toast({
          title: "No Grades to Submit",
          description: "Please enter at least one grade before submitting for approval",
          variant: "destructive"
        });
        return;
      }

      console.log('Submitting grades for approval:', gradesToSubmit.length);

      // Update grades status to submitted
      const { error: updateError } = await supabase
        .from('grades')
        .upsert(gradesToSubmit, {
          onConflict: 'student_id,subject_id,class_id,term,exam_type,submitted_by'
        });

      if (updateError) {
        console.error('Error updating grade status:', updateError);
        throw new Error(`Failed to submit grades: ${updateError.message}`);
      }

      // Create submission batch record for tracking
      const batchData = {
        class_id: classId,
        term,
        exam_type: examType,
        school_id: schoolId,
        submitted_by: user.id,
        batch_name: `${term} - ${examType} - ${new Date().toLocaleDateString()}`,
        curriculum_type: 'standard',
        academic_year: new Date().getFullYear().toString(),
        total_students: students.length,
        grades_entered: gradesToSubmit.length,
        status: 'submitted'
      };

      const { error: batchError } = await supabase
        .from('grade_submission_batches')
        .insert(batchData);

      if (batchError) {
        console.warn('Failed to create submission batch:', batchError);
        // Don't fail the entire submission for batch creation errors
      }

      // Update local state to reflect submitted grades
      const updatedGrades = { ...grades };
      gradesToSubmit.forEach(submittedGrade => {
        if (updatedGrades[submittedGrade.student_id]) {
          updatedGrades[submittedGrade.student_id][submittedGrade.subject_id] = {
            ...updatedGrades[submittedGrade.student_id][submittedGrade.subject_id],
            status: 'submitted'
          };
        }
      });
      setGrades(updatedGrades);

      toast({
        title: "Grades Submitted Successfully",
        description: `${gradesToSubmit.length} grades have been submitted for principal approval`,
      });

      onSubmissionSuccess?.();

    } catch (error) {
      console.error('Error submitting grades:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit grades for approval",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getGradeStats = () => {
    let totalGrades = 0;
    let enteredGrades = 0;

    students.forEach(student => {
      subjects.forEach(subject => {
        totalGrades++;
        if (grades[student.id]?.[subject.id]?.score !== null && grades[student.id]?.[subject.id]?.score !== undefined) {
          enteredGrades++;
        }
      });
    });

    return { totalGrades, enteredGrades };
  };

  const { totalGrades, enteredGrades } = getGradeStats();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Loading grading sheet...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <br />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadGradingData}
                className="mt-2"
              >
                Retry Loading
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!dataLoaded || students.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No students found in this class or you may not have permission to view this data.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Grade Sheet - {term} {examType}
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {students.length} Students
              </Badge>
              <Badge variant="outline">
                {enteredGrades}/{totalGrades} Grades
              </Badge>
              {enteredGrades === totalGrades && totalGrades > 0 && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Complete
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Grade Entry Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-medium">Student</th>
                  <th className="text-left p-3 font-medium">Admission No.</th>
                  {subjects.map(subject => (
                    <th key={subject.id} className="text-center p-3 font-medium min-w-[120px]">
                      {subject.name}
                      <div className="text-xs text-gray-500 font-normal">
                        /{subject.max_score}
                      </div>
                    </th>
                  ))}
                  <th className="text-left p-3 font-medium">Comments</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{student.name}</td>
                    <td className="p-3 text-gray-600">{student.admission_number}</td>
                    {subjects.map(subject => (
                      <td key={subject.id} className="p-3">
                        <Input
                          type="number"
                          min="0"
                          max={subject.max_score}
                          value={grades[student.id]?.[subject.id]?.score || ''}
                          onChange={(e) => updateGrade(student.id, subject.id, e.target.value)}
                          className="w-full text-center"
                          placeholder="0"
                        />
                      </td>
                    ))}
                    <td className="p-3">
                      <Textarea
                        value={grades[student.id] ? 
                          Object.values(grades[student.id])[0]?.comments || '' : ''
                        }
                        onChange={(e) => {
                          // Update comments for all subjects of this student
                          subjects.forEach(subject => {
                            if (grades[student.id]?.[subject.id]) {
                              updateGrade(student.id, subject.id, 
                                grades[student.id][subject.id].score?.toString() || '', 
                                e.target.value
                              );
                            }
                          });
                        }}
                        placeholder="Optional comments..."
                        className="w-full min-w-[200px]"
                        rows={2}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {enteredGrades > 0 ? (
                <span className="text-green-700 font-medium">
                  ✓ {enteredGrades} grades entered out of {totalGrades}
                </span>
              ) : (
                <span>No grades entered yet</span>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={saveGrades} 
                disabled={saving || enteredGrades === 0}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Draft
                  </>
                )}
              </Button>
              
              <Button 
                onClick={submitForApproval} 
                disabled={submitting || enteredGrades === 0}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit for Principal Approval
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
