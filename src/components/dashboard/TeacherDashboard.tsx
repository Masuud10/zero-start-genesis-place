import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthUser } from '@/types/auth';
import { GraduationCap, Users, CalendarCheck, BookOpen, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TeacherDashboardProps {
  user: AuthUser;
  onModalOpen: (modalType: string) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, onModalOpen }) => {
  console.log('👩‍🏫 TeacherDashboard: Rendering for teacher:', user.email);

  const [stats, setStats] = useState({
    classes: 0,
    students: 0,
    pendingGrades: 0,
    todaysClasses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      if (!user?.id || !user?.school_id) {
        setLoading(false);
        return;
      }
      // 1. Count of classes assigned (from teacher_classes)
      const { count: classCount } = await supabase
        .from('teacher_classes')
        .select('id', { count: 'exact', head: true })
        .eq('teacher_id', user.id);

      // 2. Number of students taught (across all classes)
      // Fetch class_ids 
      const { data: teacherClassRows } = await supabase
        .from('teacher_classes')
        .select('class_id')
        .eq('teacher_id', user.id);

      const classIds = (teacherClassRows ?? []).map(row => row.class_id);

      let studentsCount = 0;
      if (classIds.length > 0) {
        const { count } = await supabase
          .from('students')
          .select('id', { count: 'exact', head: true })
          .in('class_id', classIds);
        studentsCount = count ?? 0;
      }

      // 3. Count of pending grades (status='draft', submitted_by=teacher)
      const { count: pendingGradesCount } = await supabase
        .from('grades')
        .select('id', { count: 'exact', head: true })
        .eq('submitted_by', user.id)
        .eq('status', 'draft');

      // 4. Today's classes (from teacher_classes and timetables)
      let todaysClasses = 0;
      if (classIds.length > 0) {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        // We assume timetable_slots have a "day" (e.g., "monday", "tuesday")
        const { data: timetableSlots } = await supabase
          .from('timetable_slots')
          .select('id')
          .in('class_id', classIds)
          .eq('day', today);
        todaysClasses = timetableSlots?.length ?? 0;
      }

      setStats({
        classes: classCount ?? 0,
        students: studentsCount,
        pendingGrades: pendingGradesCount ?? 0,
        todaysClasses,
      });
      setLoading(false);
    };
    fetchStats();
  }, [user.id, user.school_id]);

  const teacherActions = [
    { id: 'grades', label: 'My Classes Grades', icon: GraduationCap, description: 'Grade student work' },
    { id: 'attendance', label: 'Take Attendance', icon: CalendarCheck, description: 'Mark daily attendance' },
    { id: 'students', label: 'My Students', icon: Users, description: 'View student profiles' },
    { id: 'timetable', label: 'My Schedule', icon: BookOpen, description: 'View teaching schedule' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, description: 'Communicate with parents' },
  ];

  return (
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
  );
};

export default TeacherDashboard;
