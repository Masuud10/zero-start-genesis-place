
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Calendar, Clock, FileText, Bell, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import ClassOverviewSection from './teacher/ClassOverviewSection';
import UpcomingTasksSection from './teacher/UpcomingTasksSection';

interface TeacherStats {
  classesCount: number;
  studentsCount: number;
  subjectsCount: number;
  pendingGrades: number;
}

const TeacherDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getCurrentSchoolId, validateSchoolAccess } = useSchoolScopedData();
  const [stats, setStats] = useState<TeacherStats>({
    classesCount: 0,
    studentsCount: 0,
    subjectsCount: 0,
    pendingGrades: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const schoolId = getCurrentSchoolId();

  useEffect(() => {
    if (schoolId && user) {
      fetchTeacherData();
    } else {
      setLoading(false);
      setError('No school assignment found');
    }
  }, [schoolId, user]);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!schoolId || !user?.id) {
        throw new Error('Missing required data');
      }

      console.log('👨‍🏫 TeacherDashboard: Fetching data for teacher:', user.id, 'school:', schoolId);

      // Validate school access
      if (!validateSchoolAccess({ school_id: schoolId })) {
        throw new Error('Access denied to school data');
      }

      // Fetch classes taught by this teacher
      const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select('id, name')
        .eq('school_id', schoolId)
        .eq('teacher_id', user.id);

      // Fetch subjects taught by this teacher
      const { data: subjects, error: subjectsError } = await supabase
        .from('subjects')
        .select('id, name, class_id')
        .eq('school_id', schoolId)
        .eq('teacher_id', user.id);

      // Get students in teacher's classes
      let studentsCount = 0;
      if (classes && classes.length > 0) {
        const classIds = classes.map(c => c.id);
        const { data: students, error: studentsError, count } = await supabase
          .from('students')
          .select('id', { count: 'exact' })
          .in('class_id', classIds)
          .eq('is_active', true);

        if (studentsError) {
          console.error('👨‍🏫 TeacherDashboard: Students query error:', studentsError);
        } else {
          studentsCount = count || 0;
        }
      }

      // Get pending grades count
      let pendingGrades = 0;
      if (subjects && subjects.length > 0) {
        const subjectIds = subjects.map(s => s.id);
        const { data: grades, error: gradesError, count } = await supabase
          .from('grades')
          .select('id', { count: 'exact' })
          .in('subject_id', subjectIds)
          .eq('submitted_by', user.id)
          .eq('status', 'draft');

        if (gradesError) {
          console.error('👨‍🏫 TeacherDashboard: Grades query error:', gradesError);
        } else {
          pendingGrades = count || 0;
        }
      }

      // Check for errors
      if (classesError || subjectsError) {
        const errors = [classesError, subjectsError].filter(Boolean);
        console.error('👨‍🏫 TeacherDashboard: Query errors:', errors);
        throw new Error('Failed to fetch some data');
      }

      setStats({
        classesCount: classes?.length || 0,
        studentsCount,
        subjectsCount: subjects?.length || 0,
        pendingGrades
      });

      console.log('👨‍🏫 TeacherDashboard: Data fetched successfully', {
        classesCount: classes?.length || 0,
        studentsCount,
        subjectsCount: subjects?.length || 0,
        pendingGrades
      });

    } catch (error: any) {
      console.error('👨‍🏫 TeacherDashboard: Error fetching teacher data:', error);
      setError(error.message || 'Failed to fetch teacher data');
      
      toast({
        title: "Error",
        description: `Failed to fetch teacher data: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Take Attendance",
      description: "Mark today's attendance",
      icon: Users,
      color: "text-blue-600",
      onClick: () => console.log("Take Attendance clicked")
    },
    {
      title: "Enter Grades",
      description: "Submit student grades",
      icon: FileText,
      color: "text-green-600",
      onClick: () => console.log("Enter Grades clicked")
    },
    {
      title: "Create Assignment",
      description: "Add new assignment",
      icon: BookOpen,
      color: "text-purple-600",
      onClick: () => console.log("Create Assignment clicked")
    },
    {
      title: "Schedule Class",
      description: "Plan upcoming lessons",
      icon: Calendar,
      color: "text-orange-600",
      onClick: () => console.log("Schedule Class clicked")
    }
  ];

  const todayStats = [
    {
      title: "My Classes",
      value: stats.classesCount,
      description: "Classes assigned to you",
      icon: Clock
    },
    {
      title: "My Students",
      value: stats.studentsCount,
      description: "Total students in your classes",
      icon: Users
    },
    {
      title: "My Subjects",
      value: stats.subjectsCount,
      description: "Subjects you teach",
      icon: FileText
    },
    {
      title: "Pending Grades",
      value: stats.pendingGrades,
      description: "Grades to submit",
      icon: Bell
    }
  ];

  // Mock data for classes
  const mockClasses = [
    {
      title: "Mathematics Grade 7",
      students: 32,
      attendance: 94,
      avgGrade: 78,
      pendingGrades: 5,
      nextClass: "Today 10:00 AM"
    },
    {
      title: "Science Grade 8", 
      students: 28,
      attendance: 89,
      avgGrade: 82,
      pendingGrades: 0,
      nextClass: "Tomorrow 2:00 PM"
    },
    {
      title: "Mathematics Grade 6",
      students: 30,
      attendance: 96,
      avgGrade: 75,
      pendingGrades: 3,
      nextClass: "Monday 9:00 AM"
    }
  ];

  // Mock data for upcoming tasks
  const mockTasks = [
    {
      task: "Grade Math Test Papers",
      dueDate: "Today",
      priority: "high" as const,
      type: "Grading"
    },
    {
      task: "Prepare Science Lab Materials",
      dueDate: "Tomorrow",
      priority: "medium" as const,
      type: "Preparation"
    },
    {
      task: "Submit Monthly Report",
      dueDate: "Friday",
      priority: "low" as const,
      type: "Administrative"
    },
    {
      task: "Parent-Teacher Meeting Prep",
      dueDate: "Next Week",
      priority: "medium" as const,
      type: "Meeting"
    }
  ];

  // Error state
  if (error && !loading) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Dashboard Error
          </CardTitle>
          <CardDescription>
            There was a problem loading your dashboard data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchTeacherData} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {todayStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : stat.value}
                  </p>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
                <stat.icon className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Frequently used teaching tools and functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-20 flex-col gap-2 hover:bg-gray-50"
                onClick={action.onClick}
              >
                <action.icon className={`h-6 w-6 ${action.color}`} />
                <div className="text-center">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-gray-500">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Class Overview */}
      <ClassOverviewSection classes={mockClasses} />

      {/* Upcoming Tasks */}
      <UpcomingTasksSection tasks={mockTasks} />
    </div>
  );
};

export default TeacherDashboard;
