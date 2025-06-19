
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TeacherStats {
  classCount: number;
  studentCount: number;
  subjectCount: number;
  todayAttendance: number;
  pendingGrades: number;
  classes: any[];
  subjects: any[];
}

interface TeacherStatsCardsProps {
  stats: TeacherStats | null;
  loading: boolean;
}

const TeacherStatsCards: React.FC<TeacherStatsCardsProps> = ({ stats, loading }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">My Classes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-blue-600">
          {loading ? <span className="animate-pulse">...</span> : stats?.classCount || 0}
        </div>
        <p className="text-xs text-muted-foreground">
          {loading ? "" : (stats?.classCount === 0 ? "No classes" : "Active classes")}
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-green-600">
          {loading ? <span className="animate-pulse">...</span> : stats?.studentCount || 0}
        </div>
        <p className="text-xs text-muted-foreground">
          {loading ? "" : (stats?.studentCount === 0 ? "No students" : "Across all classes")}
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Pending Grades</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-orange-600">
          {loading ? <span className="animate-pulse">...</span> : stats?.pendingGrades || 0}
        </div>
        <p className="text-xs text-muted-foreground">
          {loading ? "" : (stats?.pendingGrades === 0 ? "None" : "Need grading")}
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-purple-600">
          {loading ? <span className="animate-pulse">...</span> : stats?.todayAttendance || 0}
        </div>
        <p className="text-xs text-muted-foreground">
          {loading ? "" : (stats?.todayAttendance === 0 ? "Not recorded" : "Recorded")}
        </p>
      </CardContent>
    </Card>
  </div>
);

export default TeacherStatsCards;
