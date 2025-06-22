
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { Loader2, Save, Send } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  admission_number: string;
}

interface IGCSESubject {
  id: string;
  subject_name: string;
  subject_code: string;
  subject_type: 'core' | 'extended';
  components: string[];
}

type IGCSEGrade = 'A*' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'U';

interface IGCSEGradeData {
  student_id: string;
  subject_id: string;
  component: string;
  marks?: number;
  letter_grade: IGCSEGrade;
  teacher_remarks: string;
}

interface IGCSEGradeEntryProps {
  classId: string;
  term: string;
  onSubmissionSuccess?: () => void;
}

const IGCSE_GRADES: { value: IGCSEGrade; label: string; color: string }[] = [
  { value: 'A*', label: 'A* (Outstanding)', color: 'bg-purple-100 text-purple-800' },
  { value: 'A', label: 'A (Excellent)', color: 'bg-green-100 text-green-800' },
  { value: 'B', label: 'B (Very Good)', color: 'bg-blue-100 text-blue-800' },
  { value: 'C', label: 'C (Good)', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'D', label: 'D (Satisfactory)', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'E', label: 'E (Pass)', color: 'bg-orange-100 text-orange-800' },
  { value: 'F', label: 'F (Fail)', color: 'bg-red-100 text-red-800' },
  { value: 'G', label: 'G (Fail)', color: 'bg-red-100 text-red-800' },
  { value: 'U', label: 'U (Ungraded)', color: 'bg-gray-100 text-gray-800' }
];

export const IGCSEGradeEntry: React.FC<IGCSEGradeEntryProps> = ({
  classId,
  term,
  onSubmissionSuccess
}) => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [igcseSubjects, setIgcseSubjects] = useState<IGCSESubject[]>([]);
  const [grades, setGrades] = useState<Record<string, Record<string, Record<string, IGCSEGradeData>>>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (classId && schoolId && user?.id) {
      loadData();
    }
  }, [classId, schoolId, user?.id, term]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, name, admission_number')
        .eq('class_id', classId)
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('name');

      if (studentsError) throw studentsError;

      // Load IGCSE subjects
      const { data: igcseSubjectsData, error: igcseSubjectsError } = await supabase
        .from('igcse_subjects')
        .select('*')
        .eq('school_id', schoolId)
        .order('subject_name');

      if (igcseSubjectsError) throw igcseSubjectsError;

      // Load existing grades
      const { data: existingGrades, error: gradesError } = await supabase
        .from('igcse_grades')
        .select('*')
        .eq('class_id', classId)
        .eq('term', term)
        .eq('teacher_id', user?.id)
        .eq('school_id', schoolId);

      if (gradesError) throw gradesError;

      setStudents(studentsData || []);
      
      // Transform IGCSE subjects data
      const transformedSubjects: IGCSESubject[] = (igcseSubjectsData || []).map(subject => ({
        id: subject.id,
        subject_name: subject.subject_name,
        subject_code: subject.subject_code,
        subject_type: subject.subject_type as 'core' | 'extended',
        components: Array.isArray(subject.components) ? subject.components as string[] : []
      }));
      setIgcseSubjects(transformedSubjects);

      // Organize existing grades
      const gradesMap: Record<string, Record<string, Record<string, IGCSEGradeData>>> = {};
      existingGrades?.forEach(grade => {
        if (!gradesMap[grade.student_id]) {
          gradesMap[grade.student_id] = {};
        }
        if (!gradesMap[grade.student_id][grade.subject_id]) {
          gradesMap[grade.student_id][grade.subject_id] = {};
        }
        gradesMap[grade.student_id][grade.subject_id][grade.component] = {
          student_id: grade.student_id,
          subject_id: grade.subject_id,
          component: grade.component,
          marks: grade.marks || undefined,
          letter_grade: grade.letter_grade as IGCSEGrade,
          teacher_remarks: grade.teacher_remarks || ''
        };
      });

      setGrades(gradesMap);
    } catch (error: any) {
      console.error('Error loading IGCSE data:', error);
      toast({
        title: "Error",
        description: "Failed to load IGCSE grading data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateGrade = (studentId: string, subjectId: string, component: string, field: keyof IGCSEGradeData, value: string | number) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: {
          ...prev[studentId]?.[subjectId],
          [component]: {
            student_id: studentId,
            subject_id: subjectId,
            component: component,
            marks: prev[studentId]?.[subjectId]?.[component]?.marks,
            letter_grade: prev[studentId]?.[subjectId]?.[component]?.letter_grade || 'U',
            teacher_remarks: prev[studentId]?.[subjectId]?.[component]?.teacher_remarks || '',
            [field]: value
          }
        }
      }
    }));
  };

  const saveAsDraft = async () => {
    setSaving(true);
    try {
      const gradesToSave = [];
      for (const studentId in grades) {
        for (const subjectId in grades[studentId]) {
          for (const component in grades[studentId][subjectId]) {
            const grade = grades[studentId][subjectId][component];
            if (grade.letter_grade && grade.letter_grade !== 'U') {
              gradesToSave.push({
                school_id: schoolId,
                student_id: studentId,
                class_id: classId,
                subject_id: subjectId,
                component: component,
                marks: grade.marks || null,
                letter_grade: grade.letter_grade,
                teacher_remarks: grade.teacher_remarks,
                term: term,
                academic_year: new Date().getFullYear().toString(),
                teacher_id: user?.id,
                status: 'draft'
              });
            }
          }
        }
      }

      if (gradesToSave.length === 0) {
        toast({
          title: "No Grades to Save",
          description: "Please enter at least one grade before saving",
          variant: "default"
        });
        return;
      }

      const { error } = await supabase
        .from('igcse_grades')
        .upsert(gradesToSave, {
          onConflict: 'school_id,student_id,subject_id,component,term,academic_year'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `${gradesToSave.length} IGCSE grades saved as draft`
      });

    } catch (error: any) {
      console.error('Error saving IGCSE grades:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save IGCSE grades",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const submitForApproval = async () => {
    setSubmitting(true);
    try {
      const gradesToSubmit = [];
      for (const studentId in grades) {
        for (const subjectId in grades[studentId]) {
          for (const component in grades[studentId][subjectId]) {
            const grade = grades[studentId][subjectId][component];
            if (grade.letter_grade && grade.letter_grade !== 'U') {
              gradesToSubmit.push({
                school_id: schoolId,
                student_id: studentId,
                class_id: classId,
                subject_id: subjectId,
                component: component,
                marks: grade.marks || null,
                letter_grade: grade.letter_grade,
                teacher_remarks: grade.teacher_remarks,
                term: term,
                academic_year: new Date().getFullYear().toString(),
                teacher_id: user?.id,
                status: 'submitted',
                submitted_at: new Date().toISOString()
              });
            }
          }
        }
      }

      if (gradesToSubmit.length === 0) {
        toast({
          title: "No Grades to Submit",
          description: "Please enter at least one grade before submitting",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('igcse_grades')
        .upsert(gradesToSubmit, {
          onConflict: 'school_id,student_id,subject_id,component,term,academic_year'
        });

      if (error) throw error;

      // Create submission batch
      const { error: batchError } = await supabase
        .from('igcse_grade_batches')
        .upsert({
          school_id: schoolId,
          class_id: classId,
          subject_id: igcseSubjects[0]?.id, // For now, use first subject
          term: term,
          academic_year: new Date().getFullYear().toString(),
          teacher_id: user?.id,
          batch_name: `IGCSE ${term} - ${new Date().toLocaleDateString()}`,
          total_students: students.length,
          grades_entered: gradesToSubmit.length,
          status: 'submitted',
          submitted_at: new Date().toISOString()
        }, {
          onConflict: 'school_id,class_id,subject_id,term,academic_year,teacher_id'
        });

      if (batchError) console.warn('Batch creation warning:', batchError);

      toast({
        title: "Success",
        description: `${gradesToSubmit.length} IGCSE grades submitted for principal approval`
      });

      if (onSubmissionSuccess) onSubmissionSuccess();

    } catch (error: any) {
      console.error('Error submitting IGCSE grades:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit IGCSE grades",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Loading IGCSE grading data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            IGCSE Grade Entry - {term}
            <Badge variant="outline" className="bg-purple-100 text-purple-800">
              IGCSE Curriculum
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-3 gap-2">
            {IGCSE_GRADES.slice(0, 9).map(grade => (
              <div key={grade.value} className={`p-2 rounded text-center text-sm ${grade.color}`}>
                <div className="font-semibold">{grade.value}</div>
                <div className="text-xs">{grade.label.split(' ').slice(1).join(' ')}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-medium sticky left-0 bg-gray-50">Student</th>
                  {igcseSubjects.map(subject => (
                    <th key={subject.id} className="text-center p-3 font-medium min-w-[300px]">
                      {subject.subject_name}
                      <div className="text-xs text-gray-500 font-normal">
                        {subject.subject_code} ({subject.subject_type})
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 sticky left-0 bg-white">
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.admission_number}</div>
                    </td>
                    {igcseSubjects.map(subject => (
                      <td key={subject.id} className="p-3">
                        <div className="space-y-3">
                          {subject.components.map(component => (
                            <div key={component} className="border rounded p-2 space-y-2">
                              <div className="text-xs font-medium text-gray-600 uppercase">{component}</div>
                              
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  type="number"
                                  placeholder="Marks (0-100)"
                                  min="0"
                                  max="100"
                                  value={grades[student.id]?.[subject.id]?.[component]?.marks || ''}
                                  onChange={(e) => updateGrade(student.id, subject.id, component, 'marks', parseFloat(e.target.value) || 0)}
                                  className="text-sm"
                                />
                                
                                <Select
                                  value={grades[student.id]?.[subject.id]?.[component]?.letter_grade || ''}
                                  onValueChange={(value) => updateGrade(student.id, subject.id, component, 'letter_grade', value)}
                                >
                                  <SelectTrigger className="text-sm">
                                    <SelectValue placeholder="Grade" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {IGCSE_GRADES.map(grade => (
                                      <SelectItem key={grade.value} value={grade.value}>
                                        {grade.value} - {grade.label.split(' (')[1]?.replace(')', '')}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <Textarea
                                placeholder="Teacher remarks..."
                                value={grades[student.id]?.[subject.id]?.[component]?.teacher_remarks || ''}
                                onChange={(e) => updateGrade(student.id, subject.id, component, 'teacher_remarks', e.target.value)}
                                className="text-sm"
                                rows={2}
                              />
                            </div>
                          ))}
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

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              IGCSE Assessment Entry for {students.length} students across {igcseSubjects.length} subjects
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={saveAsDraft} 
                disabled={saving}
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
                disabled={submitting}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
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
