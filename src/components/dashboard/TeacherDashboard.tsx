
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

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
      priority: "high",
      type: "grade"
    },
    {
      task: "Prepare Grade 7A lesson plan for tomorrow",
      dueDate: "Tomorrow, 8:00 AM", 
      priority: "medium",
      type: "lesson"
    },
    {
      task: "Parent meeting for Grade 8B students",
      dueDate: "Friday, 2:00 PM",
      priority: "medium",
      type: "meeting"
    },
    {
      task: "Submit monthly progress report",
      dueDate: "Next Monday",
      priority: "low",
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
              <div key={index} className="relative overflow-hidden border rounded-lg p-4">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}></div>
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <div className="text-xl">{stat.icon}</div>
                </div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* My Classes */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📚</span>
            <span>My Classes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myClasses.map((cls, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{cls.title}</h3>
                    <p className="text-sm text-muted-foreground">Next class: {cls.nextClass}</p>
                  </div>
                  {cls.pendingGrades > 0 && (
                    <Badge variant="destructive">
                      {cls.pendingGrades} pending grades
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Students</p>
                    <p className="font-medium">{cls.students}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Attendance</p>
                    <p className="font-medium text-green-600">{cls.attendance}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Class Average</p>
                    <p className="font-medium text-blue-600">{cls.avgGrade}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge variant={cls.pendingGrades === 0 ? 'default' : 'secondary'}>
                      {cls.pendingGrades === 0 ? 'Up to date' : 'Pending work'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Tasks */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📋</span>
            <span>Upcoming Tasks</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingTasks.map((task, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    task.priority === 'high' ? 'bg-red-500' :
                    task.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium">{task.task}</p>
                    <p className="text-xs text-muted-foreground">Due: {task.dueDate}</p>
                  </div>
                </div>
                <Badge variant={
                  task.priority === 'high' ? 'destructive' :
                  task.priority === 'medium' ? 'secondary' : 'default'
                }>
                  {task.priority}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
              <button 
                key={index}
                onClick={action.action}
                className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent transition-all duration-200 text-left w-full"
              >
                <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center`}>
                  <span className="text-white text-sm">{action.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-base">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
