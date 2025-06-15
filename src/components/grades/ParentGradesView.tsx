
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
                    return;
                }

                const { data: gradeData, error: gradeError } = await supabase
                    .from('grades')
                    .select(`
                        id,
                        term,
                        percentage,
                        subjects ( name ),
                        students ( name )
                    `)
                    .in('student_id', studentIds)
                    .eq('is_released', true)
                    .order('term', { ascending: false });
                
                if (gradeError) throw gradeError;

                const formattedGrades = gradeData.map((g: any) => ({
                    id: g.id,
                    term: g.term,
                    percentage: g.percentage,
                    subjectName: g.subjects?.name || 'N/A',
                    studentName: g.students?.name || 'N/A',
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
        <div>
            <h3 className="text-xl font-bold mb-4">Child Grade Records</h3>
            {grades.length === 0 ? (
                <p>No released grade records found for your child(ren).</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Term</TableHead>
                            <TableHead>Percentage</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {grades.map(grade => (
                            <TableRow key={grade.id}>
                                <TableCell>{grade.studentName}</TableCell>
                                <TableCell>{grade.subjectName}</TableCell>
                                <TableCell>{grade.term}</TableCell>
                                <TableCell>{grade.percentage}%</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
};

export default ParentGradesView;
