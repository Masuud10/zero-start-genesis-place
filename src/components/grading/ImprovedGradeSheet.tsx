
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
            status: grade.status || 'draft'
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
          status: 'draft' as const
        }
      }
    }));
  };

  const saveGrades = async () => {
    if (!user?.id || !schoolId) return;

    setSaving(true);
    try {
      const gradesToSave: any[] = [];
      
      Object.values(grades).forEach(studentGrades => {
        Object.values(studentGrades).forEach(grade => {
          if (grade.score !== null || grade.comments) {
            gradesToSave.push({
              student_id: grade.student_id,
              subject_id: grade.subject_id,
              class_id: classId,
              term,
              exam_type: examType,
              score: grade.score,
              max_score: subjects.find(s => s.id === grade.subject_id)?.max_score || 100,
              comments: grade.comments,
              submitted_by: user.id,
              school_id: schoolId,
              status: 'draft' as const
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

      console.log('Saving grades:', gradesToSave.length);

      const { error } = await supabase
        .from('grades')
        .upsert(gradesToSave, {
          onConflict: 'student_id,subject_id,class_id,term,exam_type,submitted_by'
        });

      if (error) throw error;

      toast({
        title: "Grades Saved",
        description: `${gradesToSave.length} grades saved successfully`,
      });

    } catch (error) {
      console.error('Error saving grades:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save grades. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const submitForApproval = async () => {
    if (!user?.id || !schoolId) return;

    setSubmitting(true);
    try {
      // First save all grades
      await saveGrades();

      // Create submission batch
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
        grades_entered: Object.keys(grades).length,
        status: 'submitted' as const
      };

      const { data: batch, error: batchError } = await supabase
        .from('grade_submission_batches')
        .insert(batchData)
        .select('id')
        .single();

      if (batchError) throw batchError;

      // Update grades status to submitted
      const { error: updateError } = await supabase
        .from('grades')
        .update({
          status: 'submitted' as const,
          submission_batch_id: batch.id,
          submitted_at: new Date().toISOString()
        })
        .eq('class_id', classId)
        .eq('term', term)
        .eq('exam_type', examType)
        .eq('submitted_by', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Grades Submitted",
        description: "Grades have been submitted for principal approval",
      });

      onSubmissionSuccess?.();

    } catch (error) {
      console.error('Error submitting grades:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit grades for approval",
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
        if (grades[student.id]?.[subject.id]?.score !== null) {
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
        <CardContent>
          <div className="flex gap-4">
            <Button
              onClick={saveGrades}
              disabled={saving}
              variant="outline"
              className="flex items-center gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button
              onClick={submitForApproval}
              disabled={submitting || enteredGrades === 0}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {submitting ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grade Sheet */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-left font-medium text-gray-900 min-w-[250px] border-r">
                    Student Information
                  </th>
                  {subjects.map(subject => (
                    <th key={subject.id} className="p-4 text-center font-medium text-gray-900 min-w-[150px] border-r">
                      <div>
                        <div className="font-semibold">{subject.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {subject.code} (/{subject.max_score})
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}>
                    <td className="p-4 border-r border-b">
                      <div>
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          Adm: {student.admission_number} | Roll: {student.roll_number}
                        </div>
                      </div>
                    </td>
                    {subjects.map(subject => (
                      <td key={subject.id} className="p-3 text-center border-r border-b">
                        <div className="space-y-2">
                          <Input
                            type="number"
                            min="0"
                            max={subject.max_score}
                            step="0.5"
                            value={grades[student.id]?.[subject.id]?.score ?? ''}
                            onChange={(e) => updateGrade(student.id, subject.id, e.target.value)}
                            className="text-center h-12 text-lg font-medium border-2 focus:border-blue-500"
                            placeholder="--"
                          />
                          <Textarea
                            value={grades[student.id]?.[subject.id]?.comments ?? ''}
                            onChange={(e) => updateGrade(
                              student.id, 
                              subject.id, 
                              grades[student.id]?.[subject.id]?.score?.toString() ?? '', 
                              e.target.value
                            )}
                            placeholder="Comments..."
                            className="text-xs h-16 resize-none"
                            rows={2}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {enteredGrades < totalGrades && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span className="text-orange-800">
                {totalGrades - enteredGrades} grades remaining to complete the grade sheet
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
