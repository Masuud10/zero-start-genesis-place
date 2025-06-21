
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
import { Save, Send, FileSpreadsheet, Users, CheckCircle, AlertTriangle } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  admission_number: string;
  roll_number: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  max_score: number;
}

interface GradeEntry {
  student_id: string;
  subject_id: string;
  score: number | null;
  comments?: string;
}

interface EnhancedGradeSheetProps {
  classId: string;
  term: string;
  examType: string;
  onSubmissionSuccess?: () => void;
}

export const EnhancedGradeSheet: React.FC<EnhancedGradeSheetProps> = ({
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
  const [batchId, setBatchId] = useState<string | null>(null);

  useEffect(() => {
    if (classId && schoolId) {
      loadClassData();
    }
  }, [classId, schoolId]);

  const loadClassData = async () => {
    setLoading(true);
    try {
      // Load students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, name, admission_number, roll_number')
        .eq('class_id', classId)
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('name');

      if (studentsError) throw studentsError;

      // Load subjects for teacher
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subject_teacher_assignments')
        .select(`
          subject:subjects(id, name, code, max_score)
        `)
        .eq('teacher_id', user?.id)
        .eq('class_id', classId)
        .eq('school_id', schoolId)
        .eq('is_active', true);

      if (subjectsError) throw subjectsError;

      const processedSubjects = subjectsData
        ?.map((item: any) => item.subject)
        .filter((s: any) => s && s.id) || [];

      setStudents(studentsData || []);
      setSubjects(processedSubjects);

      // Load existing grades
      await loadExistingGrades(studentsData || [], processedSubjects);

    } catch (error) {
      console.error('Error loading class data:', error);
      toast({
        title: "Error",
        description: "Failed to load class data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExistingGrades = async (studentsList: Student[], subjectsList: Subject[]) => {
    if (!studentsList.length || !subjectsList.length) return;

    try {
      const { data: existingGrades, error } = await supabase
        .from('grades')
        .select('*')
        .eq('class_id', classId)
        .eq('term', term)
        .eq('exam_type', examType)
        .eq('school_id', schoolId)
        .in('subject_id', subjectsList.map(s => s.id));

      if (error) throw error;

      const gradesMap: Record<string, Record<string, GradeEntry>> = {};
      
      existingGrades?.forEach(grade => {
        if (!gradesMap[grade.student_id]) {
          gradesMap[grade.student_id] = {};
        }
        gradesMap[grade.student_id][grade.subject_id] = {
          student_id: grade.student_id,
          subject_id: grade.subject_id,
          score: grade.score,
          comments: grade.comments
        };
      });

      setGrades(gradesMap);

      // Check for existing batch
      const { data: batchData } = await supabase
        .from('grade_submission_batches')
        .select('id')
        .eq('class_id', classId)
        .eq('term', term)
        .eq('exam_type', examType)
        .eq('submitted_by', user?.id)
        .eq('school_id', schoolId)
        .single();

      if (batchData) {
        setBatchId(batchData.id);
      }

    } catch (error) {
      console.error('Error loading existing grades:', error);
    }
  };

  const updateGrade = (studentId: string, subjectId: string, score: string, comments?: string) => {
    const numericScore = score === '' ? null : parseFloat(score);
    
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: {
          student_id: studentId,
          subject_id: subjectId,
          score: numericScore,
          comments: comments || prev[studentId]?.[subjectId]?.comments
        }
      }
    }));
  };

  const updateComments = (studentId: string, subjectId: string, comments: string) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: {
          ...prev[studentId]?.[subjectId],
          student_id: studentId,
          subject_id: subjectId,
          comments: comments
        }
      }
    }));
  };

  const saveGrades = async () => {
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
              submitted_by: user?.id,
              school_id: schoolId,
              status: 'draft'
            });
          }
        });
      });

      if (gradesToSave.length === 0) {
        toast({
          title: "No Grades to Save",
          description: "Please enter some grades before saving",
          variant: "default"
        });
        return;
      }

      // Upsert grades
      const { error } = await supabase
        .from('grades')
        .upsert(gradesToSave, {
          onConflict: 'student_id,subject_id,class_id,term,exam_type'
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
        description: "Failed to save grades",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const submitForApproval = async () => {
    setSubmitting(true);
    try {
      // First save all grades
      await saveGrades();

      // Create or update submission batch
      const batchData = {
        class_id: classId,
        term,
        exam_type: examType,
        school_id: schoolId,
        submitted_by: user?.id,
        batch_name: `${term} - ${examType} - ${new Date().toLocaleDateString()}`,
        curriculum_type: 'standard',
        academic_year: new Date().getFullYear().toString(),
        total_students: students.length,
        grades_entered: Object.keys(grades).length,
        status: 'submitted'
      };

      let currentBatchId = batchId;

      if (batchId) {
        // Update existing batch
        const { error } = await supabase
          .from('grade_submission_batches')
          .update({
            ...batchData,
            submitted_at: new Date().toISOString()
          })
          .eq('id', batchId);

        if (error) throw error;
      } else {
        // Create new batch
        const { data, error } = await supabase
          .from('grade_submission_batches')
          .insert(batchData)
          .select('id')
          .single();

        if (error) throw error;
        currentBatchId = data.id;
        setBatchId(currentBatchId);
      }

      // Update grades status to submitted
      const { error: updateError } = await supabase
        .from('grades')
        .update({
          status: 'submitted',
          submission_batch_id: currentBatchId,
          submitted_at: new Date().toISOString()
        })
        .eq('class_id', classId)
        .eq('term', term)
        .eq('exam_type', examType)
        .eq('submitted_by', user?.id);

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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading grade sheet...</span>
          </div>
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
              Enhanced Grade Sheet
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
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button
              onClick={submitForApproval}
              disabled={submitting || enteredGrades === 0}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
              {submitting ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grade Sheet */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-left font-medium text-gray-900 min-w-[200px]">
                    Student
                  </th>
                  {subjects.map(subject => (
                    <th key={subject.id} className="p-4 text-center font-medium text-gray-900 min-w-[120px]">
                      <div>
                        <div>{subject.name}</div>
                        <div className="text-xs text-gray-500">/{subject.max_score}</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}>
                    <td className="p-4 border-r">
                      <div>
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">
                          {student.admission_number} • Roll: {student.roll_number}
                        </div>
                      </div>
                    </td>
                    {subjects.map(subject => (
                      <td key={subject.id} className="p-2 text-center border-r">
                        <div className="space-y-2">
                          <Input
                            type="number"
                            min="0"
                            max={subject.max_score}
                            step="0.5"
                            value={grades[student.id]?.[subject.id]?.score || ''}
                            onChange={(e) => updateGrade(student.id, subject.id, e.target.value)}
                            className="text-center h-12 text-lg font-medium"
                            placeholder="--"
                          />
                          <Textarea
                            value={grades[student.id]?.[subject.id]?.comments || ''}
                            onChange={(e) => updateComments(student.id, subject.id, e.target.value)}
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
