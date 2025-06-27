
import React from 'react';
import { useTeacherTimetable } from '@/hooks/useTeacherTimetable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, AlertCircle, CalendarDays } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const TeacherTimetable = () => {
    const { data: timetable, isLoading, error } = useTeacherTimetable();

    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const groupedTimetable = React.useMemo(() => {
        if (!timetable) return [];
        
        const groups: Record<string, typeof timetable> = {};
        for (const slot of timetable) {
            const day = slot.day_of_week; // Use the exact day name from DB
            if (!groups[day]) {
                groups[day] = [];
            }
            groups[day].push(slot);
        }
        
        return daysOrder
            .map(day => ({ day, slots: groups[day] || [] }))
            .filter(g => g.slots.length > 0);

    }, [timetable]);

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center p-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
        }

        if (error) {
            return <div className="text-red-500 flex items-center gap-2 p-4"><AlertCircle className="h-4 w-4" /> Error: {error.message}</div>;
        }

        if (!groupedTimetable || groupedTimetable.length === 0) {
            return (
                <div className="text-center text-muted-foreground p-8">
                    <CalendarDays className="mx-auto h-12 w-12" />
                    <p className="mt-4">Your timetable has not been published yet.</p>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {groupedTimetable.map(({ day, slots }) => (
                    <div key={day}>
                        <h3 className="font-semibold capitalize mb-2 px-6 text-primary">{day}</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Class</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Room</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {slots.map(slot => (
                                    <TableRow key={slot.id}>
                                        <TableCell className="font-mono text-sm">{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</TableCell>
                                        <TableCell>{slot.classes.name}</TableCell>
                                        <TableCell><Badge variant="outline">{slot.subjects.name}</Badge></TableCell>
                                        <TableCell>{slot.room ?? '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Timetable</CardTitle>
                <CardDescription>Your weekly teaching schedule.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                {renderContent()}
            </CardContent>
        </Card>
    );
};

export default TeacherTimetable;
