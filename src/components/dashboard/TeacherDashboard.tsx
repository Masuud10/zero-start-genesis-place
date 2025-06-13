
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, ClipboardList, Calendar, MessageSquare, CheckSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TeacherStats {
  totalStudents: number;
  totalSubjects: number;
  totalClasses: number;
  pendingGrades: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

const TeacherDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<TeacherStats>({
    totalStudents: 0,
    totalSubjects: 0,
    totalClasses: 0,
    pendingGrades: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id && user?.school_id) {
      fetchTeacherData();
    }
  }, [user?.id, user?.school_id]);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      
      if (!user?.id || !user?.school_id) {
        console.log('Missing user id or school_id');
        return;
      }

      // Fetch subjects taught by this teacher
      const { data: subjects, error: subjectsError } = await supabase
        .from('subjects')
        .select('id, name, class_id')
        .eq('teacher_id', user.id)
        .eq('school_id', user.school_id);

      if (subjectsError) throw subjectsError;

      // Get unique class IDs from subjects
      const classIds = [...new Set(subjects?.map(s => s.class_id).filter(Boolean))] || [];

      // Fetch students from classes taught by this teacher
      let totalStudents = 0;
      if (classIds.length > 0) {
        const { data: students, error: studentsError } = await supabase
          .from('students')
          .select('id')
          .in('class_id', classIds)
          .eq('school_id', user.school_id)
          .eq('is_active', true);

        if (studentsError) throw studentsError;
        totalStudents = students?.length || 0;
      }

      // Fetch classes taught by this teacher
      const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select('id')
        .eq('teacher_id', user.id)
        .eq('school_id', user.school_id);

      if (classesError) throw classesError;

      // Fetch pending grades (draft status)
      const { data: pendingGrades, error: gradesError } = await supabase
        .from('grades')
        .select('id')
        .eq('submitted_by', user.id)
        .eq('status', 'draft');

      if (gradesError) throw gradesError;

      // Fetch recent announcements
      const { data: announcements, error: announcementsError } = await supabase
        .from('announcements')
        .select('id, title, created_at')
        .eq('school_id', user.school_id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (announcementsError) throw announcementsError;

      setStats({
        totalStudents,
        totalSubjects: subjects?.length || 0,
        totalClasses: classes?.length || 0,
        pendingGrades: pendingGrades?.length || 0
      });

      // Transform announcements to activities
      const activities = announcements?.map(announcement => ({
        id: announcement.id,
        type: 'announcement',
        description: `New announcement: ${announcement.title}`,
        timestamp: announcement.created_at
      })) || [];

      setRecentActivities(activities);

    } catch (error: any) {
      console.error('Error fetching teacher data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch teacher data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "My Students",
      value: stats.totalStudents,
      description: "Students in my classes",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "My Subjects",
      value: stats.totalSubjects,
      description: "Subjects I teach",
      icon: BookOpen,
      color: "text-green-600"
    },
    {
      title: "My Classes",
      value: stats.totalClasses,
      description: "Classes assigned to me",
      icon: ClipboardList,
      color: "text-purple-600"
    },
    {
      title: "Pending Grades",
      value: stats.pendingGrades,
      description: "Grades to be submitted",
      icon: CheckSquare,
      color: "text-orange-600"
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-500">{card.description}</p>
                </div>
                <card.icon className={`h-8 w-8 ${card.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common teaching tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-blue-50">
              <CheckSquare className="h-6 w-6" />
              <span>Take Attendance</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-green-50">
              <BookOpen className="h-6 w-6" />
              <span>Grade Students</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-purple-50">
              <Calendar className="h-6 w-6" />
              <span>View Timetable</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-orange-50">
              <MessageSquare className="h-6 w-6" />
              <span>Send Messages</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent School Updates</CardTitle>
          <CardDescription>
            Latest announcements and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivities.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-gray-600">{activity.type}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No recent updates</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
