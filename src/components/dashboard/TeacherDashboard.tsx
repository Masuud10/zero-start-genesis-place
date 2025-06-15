
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthUser } from '@/types/auth';
import { GraduationCap, Megaphone, BookOpen, ClipboardCheck, CalendarCheck, MessageSquare } from 'lucide-react';
import TeacherAnalyticsSummaryCard from "@/components/analytics/TeacherAnalyticsSummaryCard";
import BulkAttendanceAction from "./teacher/BulkAttendanceAction";
import { useAuth } from "@/contexts/AuthContext";
import RoleGuard from "@/components/common/RoleGuard";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { format } from "date-fns";
import { useTeacherDashboardStats } from "@/hooks/useTeacherDashboardStats";

interface TeacherDashboardProps {
  user: AuthUser;
  onModalOpen: (modalType: string) => void;
}

// Teacher dashboard now requires confirmed role & school assignment before showing content.
// Everything queries strictly by school_id (except EduFam Admin for global).

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, onModalOpen }) => {
  const { isSystemAdmin, schoolId, isReady } = useSchoolScopedData();
  const { user: authUser } = useAuth();
  const { stats, loading } = useTeacherDashboardStats(user);

  // Prevent any render before role/school_id are ready
  if (!isReady) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="animate-pulse"><div className="h-6 bg-gray-300 rounded mb-2"></div></div>
      </div>
    );
  }

  // Only show for valid teacher role, with school scoped
  return (
    <RoleGuard allowedRoles={['teacher']} requireSchoolAssignment={true}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h2>
            <p className="text-muted-foreground">
              Welcome back, {user.name}! Ready to inspire young minds today?
            </p>
          </div>
        </div>
        {/* Teacher Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">My Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {loading ? <span className="animate-pulse">...</span> : stats.classes}
              </div>
              <p className="text-xs text-muted-foreground">
                {loading ? "" : stats.classes === 0 ? "No classes" : "Active classes"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {loading ? <span className="animate-pulse">...</span> : stats.students}
              </div>
              <p className="text-xs text-muted-foreground">
                {loading ? "" : stats.students === 0 ? "No students" : "Across all classes"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Grades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {loading ? <span className="animate-pulse">...</span> : stats.pendingGrades}
              </div>
              <p className="text-xs text-muted-foreground">
                {loading ? "" : stats.pendingGrades === 0 ? "None" : "Need grading"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {loading ? <span className="animate-pulse">...</span> : stats.todaysClasses}
              </div>
              <p className="text-xs text-muted-foreground">
                {loading ? "" : stats.todaysClasses === 0 ? "No classes" : "Scheduled for today"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Teacher Analytics Overview */}
        {user.role === "teacher" && (
          <TeacherAnalyticsSummaryCard />
        )}

        {/* Teacher Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Teaching Tools
            </CardTitle>
            <CardDescription>
              Access your classroom management features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <BulkAttendanceAction user={user} />
              {teacherActions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  className="h-24 flex-col gap-2 p-4"
                  onClick={() => onModalOpen(action.id)}
                >
                  <action.icon className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium text-sm">{action.label}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
};

const teacherActions = [
  {
    id: "create-announcement",
    label: "New Announcement",
    description: "Post important updates",
    icon: Megaphone,
  },
  {
    id: "view-classes",
    label: "View Classes",
    description: "Manage your classes",
    icon: BookOpen,
  },
  {
    id: "manage-grades",
    label: "Manage Grades",
    description: "Enter student grades",
    icon: ClipboardCheck,
  },
  {
    id: "view-attendance",
    label: "View Attendance",
    description: "Check student attendance",
    icon: CalendarCheck,
  },
  {
    id: "send-message",
    label: "Send Message",
    description: "Communicate with students",
    icon: MessageSquare,
  },
];

export default TeacherDashboard;
