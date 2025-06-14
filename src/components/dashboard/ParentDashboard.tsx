import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, BookOpen, Calendar, MessageSquare, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ParentStats {
  totalChildren: number;
  upcomingEvents: number;
  unreadMessages: number;
  pendingFees: number;
}

interface Child {
  id: string;
  name: string;
  class_name: string;
  attendance_percentage: number;
  current_average: number;
  recent_grades: Array<{ subject: string; score: number; maxScore: number }>;
}

const ParentDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<ParentStats>({
    totalChildren: 0,
    upcomingEvents: 0,
    unreadMessages: 0,
    pendingFees: 0
  });
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock detailed academic data for children
  const mockChildrenData: Child[] = [
    {
      id: 'child-1',
      name: 'Alice Johnson',
      class_name: 'Grade 2A',
      attendance_percentage: 96,
      current_average: 88,
      recent_grades: [
        { subject: 'Mathematics', score: 85, maxScore: 100 },
        { subject: 'English', score: 92, maxScore: 100 },
        { subject: 'Science', score: 87, maxScore: 100 }
      ]
    },
    {
      id: 'child-2',
      name: 'Bob Johnson',
      class_name: 'Grade 5B',
      attendance_percentage: 94,
      current_average: 82,
      recent_grades: [
        { subject: 'Mathematics', score: 78, maxScore: 100 },
        { subject: 'English', score: 86, maxScore: 100 },
        { subject: 'Social Studies', score: 84, maxScore: 100 }
      ]
    }
  ];

  useEffect(() => {
    if (user?.id && user?.school_id) {
      fetchParentData();
    }
  }, [user?.id, user?.school_id]);

  const fetchParentData = async () => {
    try {
      setLoading(true);
      
      if (!user?.id || !user?.school_id) {
        console.log('Missing user id or school_id');
        return;
      }

      // Fetch children linked to this parent
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          name,
          class_id,
          classes:class_id (
            name
          )
        `)
        .eq('parent_id', user.id)
        .eq('school_id', user.school_id)
        .eq('is_active', true);

      if (studentsError) throw studentsError;

      const childrenList = studentsData?.map(student => ({
        id: student.id,
        name: student.name,
        class_name: student.classes?.name || 'No Class',
        attendance_percentage: 85 // This would come from attendance_summary table
      })) || [];

      setChildren(childrenList);

      // Fetch unread messages for this parent
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('id')
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      if (messagesError) throw messagesError;

      // Fetch pending fees for children
      const studentIds = childrenList.map(child => child.id);
      let pendingFeesCount = 0;
      
      if (studentIds.length > 0) {
        const { data: fees, error: feesError } = await supabase
          .from('fees')
          .select('id')
          .in('student_id', studentIds)
          .eq('status', 'pending');

        if (feesError) throw feesError;
        pendingFeesCount = fees?.length || 0;
      }

      // Fetch upcoming announcements as events
      const { data: announcements, error: announcementsError } = await supabase
        .from('announcements')
        .select('id')
        .eq('school_id', user.school_id)
        .gte('expiry_date', new Date().toISOString().split('T')[0]);

      if (announcementsError) throw announcementsError;

      setStats({
        totalChildren: childrenList.length,
        upcomingEvents: announcements?.length || 0,
        unreadMessages: messages?.length || 0,
        pendingFees: pendingFeesCount
      });

    } catch (error: any) {
      console.error('Error fetching parent data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch parent data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "My Children",
      value: mockChildrenData.length,
      description: "Children in school",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Upcoming Events",
      value: stats.upcomingEvents,
      description: "School events & announcements",
      icon: Calendar,
      color: "text-green-600"
    },
    {
      title: "Unread Messages",
      value: stats.unreadMessages,
      description: "Messages from school",
      icon: MessageSquare,
      color: "text-purple-600"
    },
    {
      title: "Pending Fees",
      value: stats.pendingFees,
      description: "Outstanding payments",
      icon: DollarSign,
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

      {/* Children Academic Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Children's Academic Progress (Read-Only)
          </CardTitle>
          <CardDescription>
            Overview of your children's academic performance and attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-blue-800">
              <BarChart3 className="h-4 w-4" />
              <span className="font-medium">Parent View</span>
            </div>
            <p className="text-blue-700 text-sm mt-1">
              Academic summaries to help track your children's progress. Contact teachers for detailed reports.
            </p>
          </div>
          
          {children.length > 0 ? (
            <div className="space-y-6">
              {children.map((child) => (
                <Card key={child.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{child.name}</CardTitle>
                        <CardDescription>{child.class_name}</CardDescription>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">
                          {child.current_average}% Average
                        </Badge>
                        <p className="text-xs text-muted-foreground">Current Term</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Attendance Summary */}
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Attendance</p>
                          <p className="text-sm text-muted-foreground">This term</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={child.attendance_percentage} className="w-20 h-2" />
                        <Badge variant={child.attendance_percentage >= 90 ? 'default' : 'secondary'}>
                          {child.attendance_percentage}%
                        </Badge>
                      </div>
                    </div>

                    {/* Recent Grades */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Recent Grades
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {child.recent_grades.map((grade, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <p className="font-medium text-sm">{grade.subject}</p>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-lg font-bold text-blue-600">
                                {grade.score}/{grade.maxScore}
                              </p>
                              <Badge variant={grade.score >= 80 ? 'default' : 'secondary'}>
                                {Math.round((grade.score / grade.maxScore) * 100)}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No children found</p>
              <p className="text-sm text-gray-500">Contact the school to link your children to your account</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common parent tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-blue-50">
              <BookOpen className="h-6 w-6" />
              <span>View Grades</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-green-50">
              <Calendar className="h-6 w-6" />
              <span>Check Attendance</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-purple-50">
              <MessageSquare className="h-6 w-6" />
              <span>Messages</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-orange-50">
              <DollarSign className="h-6 w-6" />
              <span>Pay Fees</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentDashboard;
