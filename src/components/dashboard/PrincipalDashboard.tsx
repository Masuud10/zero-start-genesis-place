
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, GraduationCap, BookOpen, TrendingUp, Plus, Calendar, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SchoolStats {
  totalStudents: number;
  totalTeachers: number;
  totalSubjects: number;
  totalClasses: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

const PrincipalDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<SchoolStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalSubjects: 0,
    totalClasses: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.school_id) {
      fetchSchoolData();
    }
  }, [user?.school_id]);

  const fetchSchoolData = async () => {
    try {
      setLoading(true);
      
      if (!user?.school_id) {
        console.log('No school_id found for user');
        return;
      }

      // Fetch students count
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .eq('school_id', user.school_id)
        .eq('is_active', true);

      if (studentsError) throw studentsError;

      // Fetch teachers count
      const { data: teachers, error: teachersError } = await supabase
        .from('profiles')
        .select('id')
        .eq('school_id', user.school_id)
        .eq('role', 'teacher');

      if (teachersError) throw teachersError;

      // Fetch subjects count
      const { data: subjects, error: subjectsError } = await supabase
        .from('subjects')
        .select('id')
        .eq('school_id', user.school_id);

      if (subjectsError) throw subjectsError;

      // Fetch classes count
      const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select('id')
        .eq('school_id', user.school_id);

      if (classesError) throw classesError;

      // Fetch recent announcements for activities
      const { data: announcements, error: announcementsError } = await supabase
        .from('announcements')
        .select('id, title, created_at')
        .eq('school_id', user.school_id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (announcementsError) throw announcementsError;

      setStats({
        totalStudents: students?.length || 0,
        totalTeachers: teachers?.length || 0,
        totalSubjects: subjects?.length || 0,
        totalClasses: classes?.length || 0
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
      console.error('Error fetching school data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch school data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      description: "Active students in school",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Total Teachers",
      value: stats.totalTeachers,
      description: "Teaching staff members",
      icon: GraduationCap,
      color: "text-green-600"
    },
    {
      title: "Total Subjects",
      value: stats.totalSubjects,
      description: "Subjects offered",
      icon: BookOpen,
      color: "text-purple-600"
    },
    {
      title: "Total Classes",
      value: stats.totalClasses,
      description: "Active class groups",
      icon: TrendingUp,
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
            <Plus className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-blue-50">
              <Users className="h-6 w-6" />
              <span>Manage Students</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-green-50">
              <GraduationCap className="h-6 w-6" />
              <span>Manage Teachers</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-purple-50">
              <Calendar className="h-6 w-6" />
              <span>View Timetable</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-orange-50">
              <MessageSquare className="h-6 w-6" />
              <span>Announcements</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>
            Latest activities in your school
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
              <p className="text-gray-600">No recent activities</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PrincipalDashboard;
