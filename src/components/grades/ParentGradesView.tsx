
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GradeRecord {
  id: string;
  term: string;
  percentage: number;
  subjectName: string;
  studentName: string;
}

const ParentGradesView: React.FC = () => {
    const { user } = useAuth();
    const [grades, setGrades] = useState<GradeRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGrades = async () => {
            if (!user?.id) return;
            setLoading(true);
            setError(null);

            try {
                const { data: parentStudents, error: parentStudentsError } = await supabase
                    .from('parent_students')
                    .select('student_id')
                    .eq('parent_id', user.id);
                if (parentStudentsError) throw parentStudentsError;

                const studentIds = parentStudents.map(ps => ps.student_id);
                if (studentIds.length === 0) {
                    setError("No children found for your account.");
                    setGrades([]);
                    setLoading(false);
                    return;
                }

                // Pre-fetch student names
                const { data: studentData, error: studentError } = await supabase
                    .from('students')
                    .select('id, name')
                    .in('id', studentIds);
                if (studentError) throw studentError;
                const studentMap = new Map(studentData?.map(s => [s.id, s.name]));

                const { data: gradeData, error: gradeError } = await supabase
                    .from('grades')
                    .select('id, term, percentage, subject_id, student_id')
                    .in('student_id', studentIds)
                    .eq('is_released', true)
                    .order('term', { ascending: false });
                
                if (gradeError) throw gradeError;

                if (!gradeData || gradeData.length === 0) {
                    setGrades([]);
                    return; // finally will set loading to false
                }

                const subjectIds = [...new Set(gradeData.map(g => g.subject_id).filter(Boolean))];
                const subjectMap = new Map<string, string>();

                if (subjectIds.length > 0) {
                    const { data: subjectData, error: subjectError } = await supabase
                        .from('subjects')
                        .select('id, name')
                        .in('id', subjectIds);
                    if (subjectError) throw subjectError;
                    subjectData?.forEach(s => subjectMap.set(s.id, s.name));
                }

                const formattedGrades = gradeData.map((g) => ({
                    id: g.id,
                    term: g.term,
                    percentage: g.percentage,
                    subjectName: g.subject_id ? subjectMap.get(g.subject_id) || 'N/A' : 'N/A',
                    studentName: g.student_id ? studentMap.get(g.student_id) || 'N/A' : 'N/A',
                }));

                setGrades(formattedGrades);
            } catch (err: any) {
                setError(`Failed to load grades: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchGrades();
    }, [user]);
    
    const gradesByStudent = grades.reduce((acc, grade) => {
        const { studentName } = grade;
        if (!acc[studentName]) {
            acc[studentName] = [];
        }
        acc[studentName].push(grade);
        return acc;
    }, {} as Record<string, GradeRecord[]>);

    if (loading) return <div>Loading grades...</div>;

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Error Loading Grades</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-2">Child Grade Records</h3>
            {grades.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <p>No released grade records found for your child(ren).</p>
                    </CardContent>
                </Card>
            ) : (
                Object.entries(gradesByStudent).map(([studentName, studentGrades]) => (
                    <Card key={studentName}>
                        <CardHeader>
                            <CardTitle>{studentName}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Term</TableHead>
                                        <TableHead className="text-right">Percentage</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {studentGrades.map(grade => (
                                        <TableRow key={grade.id}>
                                            <TableCell className="font-medium">{grade.subjectName}</TableCell>
                                            <TableCell>{grade.term}</TableCell>
                                            <TableCell className="text-right font-semibold">{grade.percentage}%</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
};

export default ParentGradesView;
