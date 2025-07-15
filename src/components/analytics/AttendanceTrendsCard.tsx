import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAttendanceAnalytics } from '@/hooks/useSchoolAnalytics';
import { Loader2, Users, UserCheck, UserX, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AttendanceTrendsCardProps {
  schoolId: string;
}

const AttendanceTrendsCard: React.FC<AttendanceTrendsCardProps> = ({ schoolId }) => {
  const { data: attendanceData, isLoading, error } = useAttendanceAnalytics(schoolId);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Attendance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Attendance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load attendance data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Attendance Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        {attendanceData ? (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-800">Total Students</span>
                </div>
                <p className="text-xl font-bold text-blue-900">{attendanceData.total_students}</p>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-800">Present Today</span>
                </div>
                <p className="text-xl font-bold text-green-900">{attendanceData.present_today}</p>
              </div>
              
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <UserX className="h-4 w-4 text-red-600" />
                  <span className="text-xs font-medium text-red-800">Absent Today</span>
                </div>
                <p className="text-xl font-bold text-red-900">{attendanceData.absent_today}</p>
              </div>
              
              <div className={`p-3 rounded-lg ${
                attendanceData.overall_attendance_rate >= 90 ? 'bg-green-50' : 
                attendanceData.overall_attendance_rate >= 75 ? 'bg-yellow-50' : 'bg-red-50'
              }`}>
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-4 w-4 ${
                    attendanceData.overall_attendance_rate >= 90 ? 'text-green-600' : 
                    attendanceData.overall_attendance_rate >= 75 ? 'text-yellow-600' : 'text-red-600'
                  }`} />
                  <span className={`text-xs font-medium ${
                    attendanceData.overall_attendance_rate >= 90 ? 'text-green-800' : 
                    attendanceData.overall_attendance_rate >= 75 ? 'text-yellow-800' : 'text-red-800'
                  }`}>
                    Overall Rate
                  </span>
                </div>
                <p className={`text-xl font-bold ${
                  attendanceData.overall_attendance_rate >= 90 ? 'text-green-900' : 
                  attendanceData.overall_attendance_rate >= 75 ? 'text-yellow-900' : 'text-red-900'
                }`}>
                  {attendanceData.overall_attendance_rate.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Daily Trends Chart */}
            <div>
              <h4 className="text-sm font-medium mb-3">Daily Attendance Trends (Last 14 Days)</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceData.daily_trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                        weekday: 'long', month: 'short', day: 'numeric' 
                      })}
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Attendance Rate']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="attendance_rate" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Students with Most Absences */}
            {attendanceData.students_with_most_absences.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3">Students Requiring Attention</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {attendanceData.students_with_most_absences.slice(0, 10).map((student, index) => (
                    <div key={student.student_id} className="flex justify-between items-center p-2 bg-muted rounded">
                      <div>
                        <span className="text-sm font-medium">{student.student_name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {student.absence_count} absences
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        student.attendance_rate >= 75 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.attendance_rate.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">No attendance data available</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceTrendsCard;