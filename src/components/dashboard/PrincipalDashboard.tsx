
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import StudentAdmissionModal from '../modals/StudentAdmissionModal';
import TeacherAdmissionModal from '../modals/TeacherAdmissionModal';
import ParentAdmissionModal from '../modals/ParentAdmissionModal';
import PrincipalReportsModal from '../modals/PrincipalReportsModal';

interface PrincipalDashboardProps {
  onModalOpen: (modalType: string) => void;
}

const PrincipalDashboard = ({ onModalOpen }: PrincipalDashboardProps) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { user } = useAuth();

  // Get first name from user name
  const getFirstName = (fullName: string) => {
    return fullName?.split(' ')[0] || 'Principal';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const todayStats = [
    {
      title: "Today's Attendance",
      value: "94.2%",
      count: "1,174/1,247",
      icon: "📅",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Active Teachers",
      value: "46/48",
      count: "95.8%",
      icon: "👨‍🏫",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Pending Approvals",
      value: "12",
      count: "Grade approvals",
      icon: "✅",
      color: "from-orange-500 to-orange-600"
    },
    {
      title: "Active Classes",
      value: "18/20",
      count: "90%",
      icon: "🏫",
      color: "from-purple-500 to-purple-600"
    }
  ];

  const classPerformance = [
    { class: 'Grade 8A', students: 32, attendance: 96, avgGrade: 85, teacher: 'Ms. Johnson' },
    { class: 'Grade 8B', students: 30, attendance: 93, avgGrade: 82, teacher: 'Mr. Smith' },
    { class: 'Grade 7A', students: 28, attendance: 89, avgGrade: 78, teacher: 'Mrs. Davis' },
    { class: 'Grade 7B', students: 31, attendance: 91, avgGrade: 80, teacher: 'Mr. Wilson' },
  ];

  const quickActions = [
    {
      title: "Student Admission",
      description: "Admit new students to the school",
      icon: "👨‍🎓",
      color: "from-blue-500 to-blue-600",
      action: () => setActiveModal('student-admission')
    },
    {
      title: "Teacher Registration",
      description: "Add new teaching staff",
      icon: "👨‍🏫",
      color: "from-green-500 to-green-600",
      action: () => setActiveModal('teacher-admission')
    },
    {
      title: "Parent Registration",
      description: "Register new parent accounts",
      icon: "👨‍👩‍👧‍👦",
      color: "from-purple-500 to-purple-600",
      action: () => setActiveModal('parent-admission')
    },
    {
      title: "Generate Reports",
      description: "Create comprehensive school reports",
      icon: "📊",
      color: "from-orange-500 to-orange-600",
      action: () => setActiveModal('principal-reports')
    },
    {
      title: "Approve Grades",
      description: "Review and approve submitted grades",
      icon: "✅",
      color: "from-red-500 to-red-600",
      action: () => onModalOpen('grades')
    },
    {
      title: "Attendance Overview",
      description: "Monitor school-wide attendance",
      icon: "📅",
      color: "from-teal-500 to-teal-600",
      action: () => onModalOpen('attendance')
    }
  ];

  const recentActivities = [
    {
      action: "Grade 8A Mathematics results submitted by Ms. Johnson",
      user: "Ms. Johnson",
      time: "15 minutes ago",
      type: "grade"
    },
    {
      action: "Attendance marked for Grade 7B by Mr. Wilson",
      user: "Mr. Wilson",
      time: "30 minutes ago",
      type: "attendance"
    },
    {
      action: "Parent meeting scheduled for Grade 8 students",
      user: "Administration",
      time: "1 hour ago",
      type: "admin"
    },
    {
      action: "New student enrolled in Grade 7A",
      user: "Admissions",
      time: "2 hours ago",
      type: "student"
    }
  ];

  const handleModalSuccess = () => {
    // Refresh data after successful admission
    console.log('Admission successful, refreshing data...');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Greeting */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {getGreeting()}, {getFirstName(user?.name || 'Principal')}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome to your principal dashboard. Here's what's happening at your school today.
          </p>
        </CardContent>
      </Card>

      {/* Today's Overview */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📊</span>
            <span>Today's Overview</span>
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
                <p className="text-xs text-muted-foreground">{stat.count}</p>
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
            <span>Principal Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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

      {/* Class Performance */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📚</span>
            <span>Class Performance Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {classPerformance.map((cls, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{cls.class}</p>
                    <p className="text-sm text-muted-foreground">Teacher: {cls.teacher}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {cls.students} students
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm font-medium">{cls.attendance}%</p>
                    <p className="text-xs text-muted-foreground">Attendance</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{cls.avgGrade}%</p>
                    <p className="text-xs text-muted-foreground">Avg Grade</p>
                  </div>
                  <Badge variant={cls.avgGrade >= 80 ? 'default' : cls.avgGrade >= 70 ? 'secondary' : 'destructive'}>
                    {cls.avgGrade >= 80 ? 'Excellent' : cls.avgGrade >= 70 ? 'Good' : 'Needs Attention'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📋</span>
            <span>Recent School Activities</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'grade' ? 'bg-blue-500' :
                  activity.type === 'attendance' ? 'bg-green-500' :
                  activity.type === 'admin' ? 'bg-purple-500' :
                  'bg-orange-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground">by {activity.user}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {activeModal === 'student-admission' && (
        <StudentAdmissionModal 
          onClose={() => setActiveModal(null)} 
          onSuccess={handleModalSuccess}
        />
      )}
      {activeModal === 'teacher-admission' && (
        <TeacherAdmissionModal 
          onClose={() => setActiveModal(null)} 
          onSuccess={handleModalSuccess}
        />
      )}
      {activeModal === 'parent-admission' && (
        <ParentAdmissionModal 
          onClose={() => setActiveModal(null)} 
          onSuccess={handleModalSuccess}
        />
      )}
      {activeModal === 'principal-reports' && (
        <PrincipalReportsModal 
          onClose={() => setActiveModal(null)} 
        />
      )}
    </div>
  );
};

export default PrincipalDashboard;
