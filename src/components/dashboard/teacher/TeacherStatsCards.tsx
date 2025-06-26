
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  GraduationCap,
  CalendarCheck,
  ClipboardList,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface TeacherStats {
  classCount: number;
  studentCount: number;
  subjectCount: number;
  todayAttendance: number;
  pendingGrades: number;
  submittedGrades: number;
  approvedGrades: number;
  attendancePercentage: number;
  classes: any[];
  subjects: any[];
}

interface TeacherStatsCardsProps {
  stats: TeacherStats | null | undefined;
  loading: boolean;
}

const TeacherStatsCards: React.FC<TeacherStatsCardsProps> = ({ stats, loading }) => {
  const statCards = [
    {
      title: 'My Classes',
      value: stats?.classCount || 0,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: stats?.classCount === 0 ? 'No classes assigned' : 'Active classes'
    },
    {
      title: 'Total Students',
      value: stats?.studentCount || 0,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: stats?.studentCount === 0 ? 'No students' : 'Across all classes'
    },
    {
      title: 'My Subjects',
      value: stats?.subjectCount || 0,
      icon: ClipboardList,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: stats?.subjectCount === 0 ? 'No subjects assigned' : 'Teaching subjects'
    },
    {
      title: 'Attendance Rate',
      value: `${stats?.attendancePercentage || 0}%`,
      icon: CalendarCheck,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Last 30 days average',
      badge: stats?.attendancePercentage && stats.attendancePercentage >= 90 ? 'Excellent' : 
             stats?.attendancePercentage && stats.attendancePercentage >= 80 ? 'Good' : 
             stats?.attendancePercentage && stats.attendancePercentage > 0 ? 'Needs Improvement' : null
    },
    {
      title: 'Pending Grades',
      value: stats?.pendingGrades || 0,
      icon: GraduationCap,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: stats?.pendingGrades === 0 ? 'All up to date' : 'Require attention',
      urgent: (stats?.pendingGrades || 0) > 0
    },
    {
      title: "Today's Attendance",
      value: stats?.todayAttendance || 0,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: stats?.todayAttendance === 0 ? 'Not recorded' : 'Classes marked',
      urgent: (stats?.todayAttendance || 0) === 0
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statCards.map((card, index) => (
        <Card key={index} className={`${card.bgColor} border-2 transition-all duration-200 hover:shadow-md`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <card.icon className={`h-4 w-4 ${card.color}`} />
                {card.title}
              </span>
              {card.urgent && (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color} mb-1`}>
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                card.value
              )}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {loading ? "" : card.description}
              </p>
              {card.badge && !loading && (
                <Badge 
                  variant={
                    card.badge === 'Excellent' ? 'default' : 
                    card.badge === 'Good' ? 'secondary' : 'destructive'
                  }
                  className="text-xs"
                >
                  {card.badge}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TeacherStatsCards;
