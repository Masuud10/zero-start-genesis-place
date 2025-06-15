import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SubjectGrade {
  name: string;
  score?: number | null;
  letter_grade?: string | null;
  cbc_performance_level?: string | null;
  comments?: string | null;
}

interface StudentGrades {
  student_id: string;
  student_name: string;
  reports: Record<string, SubjectGrade[]>;
}

const ParentGradesView = () => {
  const { user } = useAuth();
  const [studentGrades, setStudentGrades] = useState<StudentGrades[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrades = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);

      const { data: parentStudents, error: parentStudentsError } = await supabase
        .from('parent_students')
        .select('student_id')
        .eq('parent_id', user.id);

      if (parentStudentsError) {
        setError('Could not fetch your children information.');
        setLoading(false);
        return;
      }

      if (!parentStudents || parentStudents.length === 0) {
        setLoading(false);
        return;
      }
      
      const studentIds = parentStudents.map(ps => ps.student_id);

      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select(`
          student_id, term, exam_type, score, letter_grade, cbc_performance_level, comments,
          students:students!student_id (name),
          subjects:subjects!subject_id (name)
        `)
        .in('student_id', studentIds)
        .eq('status', 'released');

      if (gradesError) {
        setError('Could not fetch grades.');
        setLoading(false);
        return;
      }

      const processedGrades: Record<string, { student_name: string, reports: Record<string, any[]> }> = {};

      for (const grade of gradesData) {
        const studentId = grade.student_id;
        if (!studentId || !grade.students || !grade.subjects) continue;

        if (!processedGrades[studentId]) {
          processedGrades[studentId] = {
            student_name: grade.students.name,
            reports: {}
          };
        }

        const reportKey = `${grade.term} - ${grade.exam_type}`;
        if (!processedGrades[studentId].reports[reportKey]) {
          processedGrades[studentId].reports[reportKey] = [];
        }
        
        processedGrades[studentId].reports[reportKey].push({
            name: grade.subjects.name,
            score: grade.score,
            letter_grade: grade.letter_grade,
            cbc_performance_level: grade.cbc_performance_level,
            comments: grade.comments,
        });
      }

      const finalStudentGrades = Object.entries(processedGrades).map(([id, data]) => ({
        student_id: id,
        student_name: data.student_name,
        reports: data.reports,
      }));
      
      setStudentGrades(finalStudentGrades);
      setLoading(false);
    };

    fetchGrades();
  }, [user]);

  if (loading) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">My Children's Grades</h1>
      {studentGrades.length === 0 ? (
        <Alert><AlertDescription>No released grades found for your children at the moment.</AlertDescription></Alert>
      ) : (
        studentGrades.map(student => (
          <Card key={student.student_id}>
            <CardHeader>
              <CardTitle>{student.student_name}</CardTitle>
              <CardDescription>Academic performance overview. Only released results are shown here.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {Object.keys(student.reports).length === 0 ? (
                  <p className="text-muted-foreground">No reports available for {student.student_name}.</p>
                ) : Object.entries(student.reports).map(([reportKey, subjectGrades]) => (
                  <AccordionItem value={reportKey} key={reportKey}>
                    <AccordionTrigger>{reportKey}</AccordionTrigger>
                    <AccordionContent>
                       <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Subject</TableHead>
                                  <TableHead className="text-right">Grade/Score</TableHead>
                                  <TableHead>Comments</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {subjectGrades.map((subjectGrade: SubjectGrade) => (
                                  <TableRow key={subjectGrade.name}>
                                      <TableCell className="font-medium">{subjectGrade.name}</TableCell>
                                      <TableCell className="text-right">
                                          {subjectGrade.score ?? subjectGrade.letter_grade ?? subjectGrade.cbc_performance_level ?? 'N/A'}
                                      </TableCell>
                                      <TableCell>{subjectGrade.comments ?? '-'}</TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                       </Table>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default ParentGradesView;
