import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BookOpen,
  ClipboardList,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
} from "lucide-react";

interface TeacherStats {
  classCount: number;
  studentCount: number;
  subjectCount: number;
  todayAttendance: number;
  pendingGrades: number;
  submittedGrades: number;
  approvedGrades: number;
  attendancePercentage: number;
  classes: Array<{
    id: string;
    name: string;
    student_count: number;
  }>;
  subjects: Array<{
    id: string;
    name: string;
    code: string;
  }>;
}

interface TeacherStatsCardsProps {
  stats: TeacherStats | null;
  loading: boolean;
}

const TeacherStatsCards: React.FC<TeacherStatsCardsProps> = ({
  stats,
  loading,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-12"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: "My Classes", value: 0, icon: BookOpen, color: "blue" },
          { title: "My Students", value: 0, icon: Users, color: "green" },
          { title: "Subjects", value: 0, icon: ClipboardList, color: "purple" },
          {
            title: "Today's Attendance",
            value: 0,
            icon: CheckCircle,
            color: "orange",
          },
          {
            title: "Pending Grades",
            value: 0,
            icon: AlertTriangle,
            color: "red",
          },
        ].map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-700 text-sm font-medium">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-blue-600">Not assigned</p>
                </div>
                <stat.icon className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* My Classes */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 text-sm font-medium">My Classes</p>
              <p className="text-2xl font-bold text-blue-900">
                {stats.classCount}
              </p>
              <p className="text-xs text-blue-600">
                {stats.classCount === 0
                  ? "No assignments"
                  : "Active assignments"}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
          {stats.classCount > 0 && (
            <div className="mt-2">
              <Badge
                variant="outline"
                className="text-blue-700 border-blue-300 text-xs"
              >
                Teaching {stats.classCount}{" "}
                {stats.classCount === 1 ? "class" : "classes"}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Students */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 text-sm font-medium">My Students</p>
              <p className="text-2xl font-bold text-green-900">
                {stats.studentCount}
              </p>
              <p className="text-xs text-green-600">
                {stats.studentCount === 0 ? "No students" : "Total learners"}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
          {stats.studentCount > 0 && (
            <div className="mt-2">
              <Badge
                variant="outline"
                className="text-green-700 border-green-300 text-xs"
              >
                Across {stats.classCount}{" "}
                {stats.classCount === 1 ? "class" : "classes"}
              </Badge>
            </div>
          )}
          {stats.classes.length > 0 && (
            <div className="mt-1">
              <p className="text-xs text-green-600">
                Avg: {Math.round(stats.studentCount / stats.classCount)} per
                class
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subjects */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-700 text-sm font-medium">Subjects</p>
              <p className="text-2xl font-bold text-purple-900">
                {stats.subjectCount}
              </p>
              <p className="text-xs text-purple-600">
                {stats.subjectCount === 0 ? "No subjects" : "Teaching areas"}
              </p>
            </div>
            <ClipboardList className="h-8 w-8 text-purple-600" />
          </div>
          {stats.subjectCount > 0 && (
            <div className="mt-2">
              <Badge
                variant="outline"
                className="text-purple-700 border-purple-300 text-xs"
              >
                {stats.subjectCount}{" "}
                {stats.subjectCount === 1 ? "subject" : "subjects"}
              </Badge>
            </div>
          )}
          {stats.subjects.length > 0 && (
            <div className="mt-1">
              <p className="text-xs text-purple-600">
                {stats.subjects
                  .slice(0, 2)
                  .map((s) => s.name)
                  .join(", ")}
                {stats.subjects.length > 2 && "..."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Attendance */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-700 text-sm font-medium">
                Today's Attendance
              </p>
              <p className="text-2xl font-bold text-orange-900">
                {stats.todayAttendance}
              </p>
              <p className="text-xs text-orange-600">
                {stats.todayAttendance === 0
                  ? "Not recorded"
                  : "Classes recorded"}
              </p>
            </div>
            <div className="flex flex-col items-center">
              {stats.todayAttendance > 0 ? (
                <CheckCircle className="h-8 w-8 text-orange-600" />
              ) : (
                <Calendar className="h-8 w-8 text-orange-400" />
              )}
            </div>
          </div>
          {stats.todayAttendance === 0 && stats.classCount > 0 && (
            <div className="mt-2">
              <Badge
                variant="outline"
                className="text-orange-700 border-orange-300 text-xs"
              >
                Pending for today
              </Badge>
            </div>
          )}
          {stats.attendancePercentage > 0 && (
            <div className="mt-2">
              <Badge
                variant="outline"
                className="text-orange-700 border-orange-300 text-xs"
              >
                {stats.attendancePercentage}% average (30 days)
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Grades */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-700 text-sm font-medium">Pending Grades</p>
              <p className="text-2xl font-bold text-red-900">
                {stats.pendingGrades}
              </p>
              <p className="text-xs text-red-600">
                {stats.pendingGrades === 0 ? "All caught up" : "Need attention"}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          {stats.pendingGrades > 0 && (
            <div className="mt-2">
              <Badge
                variant="outline"
                className="text-red-700 border-red-300 text-xs"
              >
                {stats.submittedGrades} submitted, {stats.approvedGrades}{" "}
                approved
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherStatsCards;
