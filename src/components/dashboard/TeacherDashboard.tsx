
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Calendar, Clock, FileText, Bell } from 'lucide-react';
import ClassOverviewSection from './teacher/ClassOverviewSection';
import UpcomingTasksSection from './teacher/UpcomingTasksSection';

const TeacherDashboard = () => {
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
      title: "Classes Today",
      value: "6",
      description: "Scheduled sessions",
      icon: Clock
    },
    {
      title: "Students Present",
      value: "142",
      description: "Out of 156 total",
      icon: Users
    },
    {
      title: "Assignments Due",
      value: "8",
      description: "Pending submissions",
      icon: FileText
    },
    {
      title: "Notifications",
      value: "3",
      description: "New messages",
      icon: Bell
    }
  ];

  // Check if stats is defined and has length
  const hasStats = todayStats && todayStats.length > 0;

  return (
    <div className="space-y-6">
      {/* Today's Stats */}
      {hasStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {todayStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
      <ClassOverviewSection />

      {/* Upcoming Tasks */}
      <UpcomingTasksSection />
    </div>
  );
};

export default TeacherDashboard;
