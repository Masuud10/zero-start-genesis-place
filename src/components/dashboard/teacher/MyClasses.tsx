
import React from 'react';
import { useTeacherClasses } from '@/hooks/useTeacherClasses';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const MyClasses = () => {
    const { data: teacherClasses, isLoading, error } = useTeacherClasses();

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center p-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
        }

        if (error) {
            return <div className="text-red-500 flex items-center gap-2 p-4"><AlertCircle className="h-4 w-4" /> Error: {error.message}</div>;
        }

        if (!teacherClasses || teacherClasses.length === 0) {
            return <p className="text-muted-foreground p-4 text-center">You are not assigned to any classes yet.</p>;
        }

        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Class</TableHead>
                        <TableHead>Subject Taught</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {teacherClasses.map((tc, index) => (
                        <TableRow key={`${tc.class.id}-${tc.subject?.id || index}`}>
                            <TableCell className="font-medium">{tc.class.name}</TableCell>
                            <TableCell>
                                {tc.subject ? (
                                    <Badge variant="secondary">{tc.subject.name}</Badge>
                                ) : (
                                    <span className="text-muted-foreground text-sm">Class Teacher</span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Assignments</CardTitle>
                <CardDescription>Classes and subjects you are assigned to teach.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                {renderContent()}
            </CardContent>
        </Card>
    );
};

export default MyClasses;
