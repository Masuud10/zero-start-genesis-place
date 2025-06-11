
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatsCard from './shared/StatsCard';
import QuickActionCard from './shared/QuickActionCard';
import ClassOverviewSection from './teacher/ClassOverviewSection';
import UpcomingTasksSection from './teacher/UpcomingTasksSection';

interface TeacherDashboardProps {
  onModalOpen: (modalType: string) => void;
}

const TeacherDashboard = ({ onModalOpen }: TeacherDashboardProps) => {
  const myClasses = [
    {
      title: "Grade 8A - Mathematics",
      students: 32,
      attendance: 96,
      avgGrade: 85,
      pendingGrades: 0,
      nextClass: "Today, 10:00 AM"
    },
    {
      title: "Grade 8B - Mathematics", 
      students: 30,
      attendance: 93,
      avgGrade: 82,
      pendingGrades: 5,
      nextClass: "Today, 2:00 PM"
    },
    {
      title: "Grade 7A - Mathematics",
      students: 28,
      attendance: 89,
      avgGrade: 78,
      pendingGrades: 0,
      nextClass: "Tomorrow, 9:00 AM"
    }
  ];

  const todayStats = [
    {
      title: "My Students",
      value: "90",
      subtitle: "Across 3 classes",
      icon: "👥",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Today's Classes",
      value: "4",
      subtitle: "2 completed",
      icon: "📚",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Pending Grades",
      value: "5",
      subtitle: "Need submission",
      icon: "📝",
      color: "from-orange-500 to-orange-600"
    },
    {
      title: "Class Average",
      value: "81.7%",
      subtitle: "+2.3% this term",
      icon: "📊",
      color: "from-purple-500 to-purple-600"
    }
  ];

  const quickActions = [
    {
      title: "Submit Grades",
      description: "Enter and submit student grades",
      icon: "📝",
      color: "from-blue-500 to-blue-600",
      action: () => onModalOpen('grades')
    },
    {
      title: "Mark Attendance",
      description: "Record today's class attendance",
      icon: "📅",
      color: "from-green-500 to-green-600",
      action: () => onModalOpen('attendance')
    },
    {
      title: "Class Reports",
      description: "Generate performance reports",
      icon: "📊",
      color: "from-purple-500 to-purple-600",
      action: () => onModalOpen('reports')
    }
  ];

  const upcomingTasks = [
    {
      task: "Submit Grade 8A CAT 2 Mathematics results",
      dueDate: "Today, 5:00 PM",
      priority: "high" as const,
      type: "grade"
    },
    {
      task: "Prepare Grade 7A lesson plan for tomorrow",
      dueDate: "Tomorrow, 8:00 AM", 
      priority: "medium" as const,
      type: "lesson"
    },
    {
      task: "Parent meeting for Grade 8B students",
      dueDate: "Friday, 2:00 PM",
      priority: "medium" as const,
      type: "meeting"
    },
    {
      task: "Submit monthly progress report",
      dueDate: "Next Monday",
      priority: "low" as const,
      type: "report"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Today's Stats */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📊</span>
            <span>My Teaching Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {todayStats.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                subtitle={stat.subtitle}
                icon={stat.icon}
                color={stat.color}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <ClassOverviewSection classes={myClasses} />
      <UpcomingTasksSection tasks={upcomingTasks} />

      {/* Quick Actions */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>⚡</span>
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={index}
                title={action.title}
                description={action.description}
                icon={action.icon}
                color={action.color}
                onClick={action.action}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
