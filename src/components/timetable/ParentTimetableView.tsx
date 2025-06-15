
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TimetableViewer from './TimetableViewer';

interface ChildInfo {
  studentId: string;
  studentName: string;
  classId: string | null;
  className: string | null;
}

const ParentTimetableView: React.FC = () => {
    const { user } = useAuth();
    const [childrenInfo, setChildrenInfo] = useState<ChildInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const currentTerm = 'Term 1'; // Using a default term. A dynamic term hook would be an enhancement.

    useEffect(() => {
        const fetchChildrenInfo = async () => {
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
                    setChildrenInfo([]);
                    return;
                }

                const { data: studentsData, error: studentsError } = await supabase
                    .from('students')
                    .select('id, name, student_classes(class_id, is_active, classes(name))')
                    .in('id', studentIds);

                if (studentsError) throw studentsError;

                const formattedChildrenInfo: ChildInfo[] = studentsData.map((student: any) => {
                    const activeClass = student.student_classes.find((sc: any) => sc.is_active);
                    return {
                        studentId: student.id,
                        studentName: student.name,
                        classId: activeClass ? activeClass.class_id : null,
                        className: activeClass && activeClass.classes ? activeClass.classes.name : 'No active class',
                    };
                });

                setChildrenInfo(formattedChildrenInfo);
            } catch (err: any) {
                setError(`Failed to load children's information: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchChildrenInfo();
    }, [user]);

    if (loading) return <div>Loading timetable information...</div>;

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }
    
    if (childrenInfo.length === 0) {
        return (
             <Card>
                <CardContent className="pt-6">
                    <p>No timetable information available for your child(ren).</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
             {childrenInfo.map(child => (
                <Card key={child.studentId}>
                    <CardHeader>
                        <CardTitle>{child.studentName}</CardTitle>
                        <p className="text-sm text-muted-foreground">Class: {child.className || 'N/A'}</p>
                    </CardHeader>
                    <CardContent>
                        {child.classId ? (
                            <TimetableViewer 
                                term={currentTerm} 
                                classId={child.classId} 
                                studentId={child.studentId} 
                            />
                        ) : (
                            <p>This student is not currently assigned to a class with a published timetable.</p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default ParentTimetableView;
