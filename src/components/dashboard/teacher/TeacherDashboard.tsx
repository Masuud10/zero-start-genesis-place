
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
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { academicInfo } = useCurrentAcademicInfo(schoolId);

  const { data: teacherStats, isLoading, error } = useQuery({
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Error Loading Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">Unable to load teacher dashboard data. Please try refreshing the page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 md:p-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Teacher Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name} | {academicInfo.term} - {academicInfo.year}
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2 w-fit">
          <Calendar className="h-4 w-4" />
          {new Date().toLocaleDateString()}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-700 text-sm font-medium">My Classes</p>
                <p className="text-2xl font-bold text-blue-900">{teacherStats?.classCount || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 text-sm font-medium">My Students</p>
                <p className="text-2xl font-bold text-green-900">{teacherStats?.studentCount || 0}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-700 text-sm font-medium">Subjects</p>
                <p className="text-2xl font-bold text-purple-900">{teacherStats?.subjectCount || 0}</p>
              </div>
              <ClipboardList className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-700 text-sm font-medium">Today's Attendance</p>
                <p className="text-2xl font-bold text-orange-900">{teacherStats?.todayAttendance || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teacherStats?.classes?.length > 0 ? (
                teacherStats.classes.map((cls) => (
                  <div key={cls.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <span className="font-medium text-gray-900">{cls.name}</span>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No classes assigned yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* My Subjects */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teacherStats?.subjects?.length > 0 ? (
                teacherStats.subjects.map((subject) => (
                  <div key={subject.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <span className="font-medium text-gray-900">{subject.name}</span>
                    <Badge variant="outline">Teaching</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No subjects assigned yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks and Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pending Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teacherStats?.pendingGrades > 0 && (
              <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <TrendingUp className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-gray-900">You have {teacherStats.pendingGrades} pending grade submissions</span>
                </div>
                <Badge variant="outline" className="text-yellow-700 border-yellow-300">Action Required</Badge>
              </div>
            )}
            
            {teacherStats?.todayAttendance === 0 && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-gray-900">Today's attendance not yet recorded</span>
                </div>
                <Badge variant="outline" className="text-blue-700 border-blue-300">Pending</Badge>
              </div>
            )}

            {teacherStats?.pendingGrades === 0 && teacherStats?.todayAttendance > 0 && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-gray-900">All tasks completed for today!</span>
                </div>
                <Badge variant="outline" className="text-green-700 border-green-300">Up to date</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
