
import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserX, Clock, BadgeHelp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Class {
  id: string;
  name: string;
}

interface SessionOption {
    label: string;
    value: string;
}

interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
}

interface AttendanceControlsProps {
  classes: Class[];
  selectedClass: string;
  onClassChange: (value: string) => void;
  selectedDate: string;
  onDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  session: string;
  onSessionChange: (value: string) => void;
  sessionOptions: SessionOption[];
  onMarkAll: (status: 'present' | 'absent') => void;
  onSaveAttendance: () => void;
  loading: boolean;
  saving: boolean;
  academicInfoError: string | null;
  stats: AttendanceStats;
}

const StatCard = ({ icon, title, value, color }: { icon: React.ReactNode, title: string, value: number, color: string }) => (
    <div className="flex items-center gap-4 p-4 bg-background rounded-lg border">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

const AttendanceControls: React.FC<AttendanceControlsProps> = ({
  classes,
  selectedClass,
  onClassChange,
  selectedDate,
  onDateChange,
  session,
  onSessionChange,
  sessionOptions,
  onMarkAll,
  onSaveAttendance,
  loading,
  saving,
  academicInfoError,
  stats,
}) => {
  const attendancePercentage = stats.total > 0 ? ((stats.present + stats.late) / stats.total) * 100 : 0;
  const selectedClassName = classes.find(c => c.id === selectedClass)?.name;

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Controls */}
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle>Attendance Filter</CardTitle>
                    <CardDescription>Select class, date, and session.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                        <Select value={selectedClass} onValueChange={onClassChange} disabled={classes.length === 0 || loading}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.map((cls) => (
                                    <SelectItem key={cls.id} value={cls.id}>
                                        {cls.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={onDateChange}
                            className="h-10 px-2 rounded-md border border-input w-full bg-background"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
                        <Select value={session} onValueChange={onSessionChange} disabled={loading}>
                            <SelectTrigger><SelectValue placeholder="Session" /></SelectTrigger>
                            <SelectContent>
                                {sessionOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Column 2: Summary */}
            <div className="lg:col-span-2">
                {selectedClass && !loading && (
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {selectedClassName} Summary
                            </CardTitle>
                            <CardDescription>
                                Attendance for {selectedDate} ({session} session).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                               <span className="text-sm font-medium">Attendance Rate:</span>
                               <Progress value={attendancePercentage} className="w-full flex-1" />
                               <span className="text-lg font-bold">{!isNaN(attendancePercentage) ? attendancePercentage.toFixed(1) : 0}%</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-4">
                                <StatCard icon={<Users className="h-6 w-6 text-blue-800" />} title="Total" value={stats.total} color="bg-blue-100" />
                                <StatCard icon={<UserCheck className="h-6 w-6 text-green-800" />} title="Present" value={stats.present} color="bg-green-100" />
                                <StatCard icon={<UserX className="h-6 w-6 text-red-800" />} title="Absent" value={stats.absent} color="bg-red-100" />
                                <StatCard icon={<Clock className="h-6 w-6 text-yellow-800" />} title="Late" value={stats.late} color="bg-yellow-100" />
                                <StatCard icon={<BadgeHelp className="h-6 w-6 text-purple-800" />} title="Excused" value={stats.excused} color="bg-purple-100" />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border rounded-lg bg-card">
             <div className="flex gap-2">
                <Button variant="outline" type="button" onClick={() => onMarkAll('present')} disabled={loading || !selectedClass || stats.total === 0}>
                    Mark All Present
                </Button>
                <Button variant="outline" type="button" onClick={() => onMarkAll('absent')} disabled={loading || !selectedClass || stats.total === 0}>
                    Mark All Absent
                </Button>
            </div>
            <Button size="lg" onClick={onSaveAttendance} disabled={saving || loading || !selectedClass || stats.total === 0 || !!academicInfoError}>
                {saving ? "Saving..." : "Save Attendance"}
            </Button>
        </div>
    </div>
  );
};

export default AttendanceControls;
