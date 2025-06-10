
import React, { useState } from 'react';
import TodayStatsSection from './principal/TodayStatsSection';
import QuickActionsSection from './principal/QuickActionsSection';
import ClassPerformanceSection from './principal/ClassPerformanceSection';
import RecentActivitiesSection from './principal/RecentActivitiesSection';
import PrincipalModals from './principal/PrincipalModals';

interface PrincipalDashboardProps {
  onModalOpen: (modalType: string) => void;
}

const PrincipalDashboard = ({ onModalOpen }: PrincipalDashboardProps) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

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
    console.log('Admission successful, refreshing data...');
  };

  return (
    <div className="space-y-6">
      <TodayStatsSection stats={todayStats} />
      <QuickActionsSection actions={quickActions} />
      <ClassPerformanceSection classPerformance={classPerformance} />
      <RecentActivitiesSection activities={recentActivities} />
      
      <PrincipalModals 
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default PrincipalDashboard;
