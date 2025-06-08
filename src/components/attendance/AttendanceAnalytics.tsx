
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AttendanceStats } from '@/types/attendance';

interface AttendanceAnalyticsProps {
  stats: AttendanceStats[];
  className?: string;
}

const AttendanceAnalytics = ({ stats, className }: AttendanceAnalyticsProps) => {
  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceBadge = (rate: number) => {
    if (rate >= 90) return 'default';
    if (rate >= 75) return 'secondary';
    return 'destructive';
  };

  const overallStats = stats.reduce((acc, student) => {
    acc.totalStudents += 1;
    acc.totalDays += student.totalDays;
    acc.totalPresent += student.presentDays;
    acc.totalAbsent += student.absentDays;
    acc.totalLate += student.lateDays;
    return acc;
  }, {
    totalStudents: 0,
    totalDays: 0,
    totalPresent: 0,
    totalAbsent: 0,
    totalLate: 0
  });

  const overallRate = overallStats.totalDays > 0 
    ? (overallStats.totalPresent / overallStats.totalDays) * 100 
    : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overallRate.toFixed(1)}%</div>
            <Progress value={overallRate} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overallStats.totalPresent}</div>
            <p className="text-xs text-muted-foreground">Out of {overallStats.totalDays} total days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overallStats.totalAbsent}</div>
            <p className="text-xs text-muted-foreground">Across {overallStats.totalStudents} students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Late</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{overallStats.totalLate}</div>
            <p className="text-xs text-muted-foreground">Late arrivals recorded</p>
          </CardContent>
        </Card>
      </div>

      {/* Student-wise Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Student Attendance Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.map((student) => (
              <div key={student.studentId} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="font-medium">Student ID: {student.studentId}</div>
                    <Badge variant={getAttendanceBadge(student.attendanceRate)}>
                      {student.attendanceRate.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Present: {student.presentDays} | Absent: {student.absentDays} | Late: {student.lateDays}
                  </div>
                  <div className="flex gap-4 mt-2 text-xs">
                    <span>Morning: {student.morningAttendanceRate.toFixed(1)}%</span>
                    <span>Afternoon: {student.afternoonAttendanceRate.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="w-32">
                  <Progress value={student.attendanceRate} className="h-2" />
                </div>
              </div>
            ))}
            {stats.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No attendance data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceAnalytics;
