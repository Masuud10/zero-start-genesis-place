import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, BookOpen, Plus, Eye } from 'lucide-react';

interface TeacherGradeBookModalProps {
  open: boolean;
  onClose: () => void;
  classId?: string;
  className?: string;
}

const TeacherGradeBookModal: React.FC<TeacherGradeBookModalProps> = ({
  open,
  onClose,
  classId,
  className
}) => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();

  const { data: gradeData, isLoading, error } = useQuery({
    queryKey: ['teacher-gradebook', user?.id, schoolId, classId],
    queryFn: async () => {
      if (!user?.id || !schoolId) return { students: [], subjects: [], grades: [] };

      // Get students in the class
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, name, admission_number')
        .eq('class_id', classId)
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('name');

      if (studentsError) throw studentsError;

      // Get subjects taught by this teacher in this class
      const { data: subjects, error: subjectsError } = await supabase
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

      const subjectsList = subjects?.map(s => s.subjects) || [];

      // Get grades for these students and subjects
      const studentIds = students?.map(s => s.id) || [];
      const subjectIds = subjectsList.map(s => s.id);

      const { data: grades, error: gradesError } = await supabase
        .from('grades')
        .select('*')
        .in('student_id', studentIds)
        .in('subject_id', subjectIds)
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (gradesError) throw gradesError;

      return {
        students: students || [],
        subjects: subjectsList,
        grades: grades || []
      };
    },
    enabled: open && !!user?.id && !!schoolId && !!classId,
  });

  const getGradeForStudent = (studentId: string, subjectId: string) => {
    return gradeData?.grades.find(g => g.student_id === studentId && g.subject_id === subjectId);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'draft': { variant: 'secondary', text: 'Draft' },
      'submitted': { variant: 'default', text: 'Submitted' },
      'approved': { variant: 'default', text: 'Approved' },
      'released': { variant: 'default', text: 'Released' },
      'rejected': { variant: 'destructive', text: 'Rejected' }
    } as const;

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary', text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {className} - Grade Book
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-gray-600">Loading grade book...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-8 text-red-600">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Unable to load grade book</p>
            </div>
          </div>
        )}

        {!isLoading && !error && gradeData && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="font-medium text-blue-900">{gradeData.students.length}</span>
                  <span className="text-blue-700 ml-1">Students</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-blue-900">{gradeData.subjects.length}</span>
                  <span className="text-blue-700 ml-1">Subjects</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-blue-900">{gradeData.grades.length}</span>
                  <span className="text-blue-700 ml-1">Grades Recorded</span>
                </div>
              </div>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-3 w-3 mr-1" />
                Add Grades
              </Button>
            </div>

            {gradeData.students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No students in this class</p>
                <p className="text-sm mt-1">Students will appear here once they are enrolled in this class.</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">Student</TableHead>
                      <TableHead className="w-32">Admission No.</TableHead>
                      {gradeData.subjects.map((subject) => (
                        <TableHead key={subject.id} className="text-center min-w-32">
                          {subject.name}
                          {subject.code && (
                            <div className="text-xs text-gray-500 font-normal">({subject.code})</div>
                          )}
                        </TableHead>
                      ))}
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gradeData.students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell className="text-gray-600">{student.admission_number}</TableCell>
                        {gradeData.subjects.map((subject) => {
                          const grade = getGradeForStudent(student.id, subject.id);
                          return (
                            <TableCell key={subject.id} className="text-center">
                              {grade ? (
                                <div className="space-y-1">
                                  <div className="font-medium">
                                    {grade.percentage !== null ? `${grade.percentage}%` : 
                                     grade.score !== null ? `${grade.score}/${grade.max_score}` : 
                                     grade.letter_grade || '-'}
                                  </div>
                                  {grade.status && getStatusBadge(grade.status)}
                                </div>
                              ) : (
                                <div className="text-gray-400">-</div>
                              )}
                            </TableCell>
                          );
                        })}
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TeacherGradeBookModal;