
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface AttendanceStat {
  studentId: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendanceRate: number;
  morningAttendanceRate: number;
  afternoonAttendanceRate: number;
}

interface AttendanceAnalyticsProps {
  stats: AttendanceStat[];
}

const AttendanceAnalytics: React.FC<AttendanceAnalyticsProps> = ({ stats }) => {
  const averageAttendanceRate = stats.reduce((sum, stat) => sum + stat.attendanceRate, 0) / stats.length;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{averageAttendanceRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Average Attendance Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.length}</div>
              <div className="text-sm text-muted-foreground">Total Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.reduce((sum, stat) => sum + stat.totalDays, 0) / stats.length}
              </div>
              <div className="text-sm text-muted-foreground">Average School Days</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium">Individual Student Performance</h4>
            {stats.map((stat, index) => (
              <div key={stat.studentId} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">Student {index + 1}</div>
                  <div className="text-sm text-muted-foreground">
                    {stat.presentDays}/{stat.totalDays} days present
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <Progress value={stat.attendanceRate} className="h-2" />
                  </div>
                  <Badge 
                    variant={stat.attendanceRate >= 90 ? 'default' : stat.attendanceRate >= 75 ? 'secondary' : 'destructive'}
                  >
                    {stat.attendanceRate.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceAnalytics;
