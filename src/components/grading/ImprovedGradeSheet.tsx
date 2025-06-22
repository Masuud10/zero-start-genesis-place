
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';
import { FileSpreadsheet, Users, AlertTriangle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GradeSubmissionWorkflow } from './GradeSubmissionWorkflow';

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

      // Load existing grades (including drafts)
      const { data: existingGrades, error: gradesError } = await supabase
        .from('grades')
        .select('*')
        .eq('class_id', classId)
        .eq('term', term)
        .eq('exam_type', examType.toUpperCase())
        .eq('submitted_by', user?.id)
        .eq('school_id', schoolId)
        .in('subject_id', subjectsWithDefaults.map(s => s.id));

      if (gradesError) {
        console.error('Error loading grades:', gradesError);
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
              <button 
                onClick={loadGradingData}
                className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
              >
                Retry Loading
              </button>
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
                {subjects.length} Subjects
              </Badge>
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

      {/* Grade Submission Workflow */}
      <GradeSubmissionWorkflow
        grades={grades}
        classId={classId}
        term={term}
        examType={examType}
        subjects={subjects}
        students={students}
        onSubmissionSuccess={onSubmissionSuccess || (() => {})}
      />
    </div>
  );
};
