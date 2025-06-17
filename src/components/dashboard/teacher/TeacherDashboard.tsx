
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useCurrentAcademicInfo } from '@/hooks/useCurrentAcademicInfo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  Calendar,
  CheckCircle,
  ClipboardList,
  TrendingUp
} from 'lucide-react';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { academicInfo } = useCurrentAcademicInfo(schoolId);

  const { data: teacherStats, isLoading } = useQuery({
    queryKey: ['teacher-stats', user?.id, schoolId],
    queryFn: async () => {
      if (!user?.id || !schoolId) return null;

      try {
        // Get classes taught by this teacher
        const { data: classes } = await supabase
          .from('classes')
          .select('id, name')
          .eq('teacher_id', user.id)
          .eq('school_id', schoolId);

        const classIds = classes?.map(c => c.id) || [];

        // Get total students in teacher's classes
        const { count: studentCount } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .in('class_id', classIds)
          .eq('is_active', true);

        // Get subjects taught
        const { data: subjects } = await supabase
          .from('subjects')
          .select('id, name')
          .eq('teacher_id', user.id)
          .eq('school_id', schoolId);

        // Get today's attendance submissions
        const today = new Date().toISOString().split('T')[0];
        const { count: todayAttendance } = await supabase
          .from('attendance')
          .select('*', { count: 'exact', head: true })
          .eq('submitted_by', user.id)
          .eq('date', today);

        // Get pending grade submissions
        const { count: pendingGrades } = await supabase
          .from('grades')
          .select('*', { count: 'exact', head: true })
          .eq('submitted_by', user.id)
          .eq('status', 'draft');

        return {
          classCount: classes?.length || 0,
          studentCount: studentCount || 0,
          subjectCount: subjects?.length || 0,
          todayAttendance: todayAttendance || 0,
          pendingGrades: pendingGrades || 0,
          classes: classes || [],
          subjects: subjects || []
        };
      } catch (error) {
        console.error('Error fetching teacher stats:', error);
        return {
          classCount: 0,
          studentCount: 0,
          subjectCount: 0,
          todayAttendance: 0,
          pendingGrades: 0,
          classes: [],
          subjects: []
        };
      }
    },
    enabled: !!user?.id && !!schoolId
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Teacher Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name} | {academicInfo.term} - {academicInfo.year}
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {new Date().toLocaleDateString()}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">My Classes</p>
                <p className="text-3xl font-bold">{teacherStats?.classCount || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">My Students</p>
                <p className="text-3xl font-bold">{teacherStats?.studentCount || 0}</p>
              </div>
              <Users className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Subjects</p>
                <p className="text-3xl font-bold">{teacherStats?.subjectCount || 0}</p>
              </div>
              <ClipboardList className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Today's Attendance</p>
                <p className="text-3xl font-bold">{teacherStats?.todayAttendance || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teacherStats?.classes?.length > 0 ? (
                teacherStats.classes.map((cls) => (
                  <div key={cls.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{cls.name}</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No classes assigned yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teacherStats?.subjects?.length > 0 ? (
                teacherStats.subjects.map((subject) => (
                  <div key={subject.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{subject.name}</span>
                    <Badge variant="secondary">Teaching</Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No subjects assigned yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teacherStats?.pendingGrades > 0 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
                <span>You have {teacherStats.pendingGrades} pending grade submissions</span>
                <Badge variant="outline">Action Required</Badge>
              </div>
            )}
            
            {teacherStats?.todayAttendance === 0 && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Today's attendance not yet recorded</span>
                <Badge variant="outline">Pending</Badge>
              </div>
            )}

            {teacherStats?.pendingGrades === 0 && teacherStats?.todayAttendance > 0 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>All tasks completed for today!</span>
                <Badge variant="outline">Up to date</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
