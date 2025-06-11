
import React, { useState } from 'react';
import TodayStatsSection from './principal/TodayStatsSection';
import QuickActionsSection from './principal/QuickActionsSection';
import ClassPerformanceSection from './principal/ClassPerformanceSection';
import RecentActivitiesSection from './principal/RecentActivitiesSection';
import PrincipalModals from './principal/PrincipalModals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, BookOpen, Calendar } from 'lucide-react';

interface PrincipalDashboardProps {
  onModalOpen: (modalType: string) => void;
}

const PrincipalDashboard = ({ onModalOpen }: PrincipalDashboardProps) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // For new schools, show clean initial state with zero data
  const todayStats = [
    {
      title: "Today's Attendance",
      value: "0%",
      count: "0/0",
      icon: "📅",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Active Teachers",
      value: "0/0",
      count: "0%",
      icon: "👨‍🏫",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Pending Approvals",
      value: "0",
      count: "No pending items",
      icon: "✅",
      color: "from-orange-500 to-orange-600"
    },
    {
      title: "Active Classes",
      value: "0/0",
      count: "0%",
      icon: "🏫",
      color: "from-purple-500 to-purple-600"
    }
  ];

  // Empty class performance for new schools
  const classPerformance: any[] = [];

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
      title: "Setup Classes",
      description: "Create and organize class structures",
      icon: "🏫",
      color: "from-indigo-500 to-indigo-600",
      action: () => onModalOpen('classes')
    },
    {
      title: "Setup Subjects",
      description: "Define subjects and curriculum",
      icon: "📚",
      color: "from-teal-500 to-teal-600",
      action: () => onModalOpen('subjects')
    },
    {
      title: "School Settings",
      description: "Configure school information",
      icon: "⚙️",
      color: "from-gray-500 to-gray-600",
      action: () => onModalOpen('settings')
    }
  ];

  // Empty activities for new schools
  const recentActivities: any[] = [];

  const handleModalSuccess = () => {
    console.log('Action completed successfully');
  };

  // Show welcome message for new schools with no data
  const isNewSchool = classPerformance.length === 0 && recentActivities.length === 0;

  return (
    <div className="space-y-6">
      {isNewSchool && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Welcome to Your School Dashboard!
                </h3>
                <p className="text-blue-700 mb-4">
                  Your school account has been created successfully. To get started, you can:
                </p>
                <ul className="space-y-2 text-sm text-blue-600">
                  <li className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Register teachers and staff members</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Set up classes and subjects</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Add students and parents</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <TodayStatsSection stats={todayStats} />
      <QuickActionsSection actions={quickActions} />
      
      {classPerformance.length > 0 ? (
        <ClassPerformanceSection classPerformance={classPerformance} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Class Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No Classes Set Up Yet</h3>
              <p className="text-sm text-muted-foreground">
                Create classes and add students to see performance data here.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {recentActivities.length > 0 ? (
        <RecentActivitiesSection activities={recentActivities} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No Recent Activities</h3>
              <p className="text-sm text-muted-foreground">
                School activities will appear here as you start using the system.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      <PrincipalModals 
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default PrincipalDashboard;
